import { Button, Card, Checkbox, Form, Input, Select, Space, Switch, message } from 'antd';
import { V2NIMConst } from 'nim-web-sdk-ng';
import { V2NIMAIModelCallMessage } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMAIService';
import { useCallback, useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { TextArea } = Input;

interface ProxyAIModelCallFormValues {
  accountId: string;
  requestId: string;
  content: string;
  messages: string[];
  aiStream: boolean;
}

const defaultFormValues: ProxyAIModelCallFormValues = {
  accountId: '',
  requestId: '',
  content: '你好，请介绍一下你自己',
  messages: [],
  aiStream: false,
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMAIService.proxyAIModelCall`;

const ProxyAIModelCallPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // AI 用户列表
  const [aiUsers, setAiUsers] = useState<any[]>([]);
  // 获取 AI 用户列表的加载状态
  const [aiUsersLoading, setAiUsersLoading] = useState(false);
  // 历史消息列表（用于上下文选择）
  const [historyMessages, setHistoryMessages] = useState<V2NIMAIModelCallMessage[]>([]);
  // 防止重复加载的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const initialValues = { ...defaultFormValues };

  // 获取 AI 用户列表
  const getAIUserList = useCallback(async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setAiUsersLoading(true);
    console.log('API V2NIMAIService.getAIUserList execute');
    const [error, result] = await to(() => window.nim?.V2NIMAIService.getAIUserList());
    setAiUsersLoading(false);

    if (error) {
      message.error(`获取 AI 用户列表失败: ${error}`);
      console.error('获取 AI 用户列表失败:', error.toString());
      setAiUsers([]);
      return;
    }
    if (result) {
      console.log('获取到的 AI 用户列表:', result);
      setAiUsers(result || []);

      if (!result || result.length === 0) {
        message.info('当前没有可用的 AI 用户');
      } else {
        message.success(`获取到 ${result.length} 个 AI 用户`);
        // 自动选择第一个 AI 用户
        if (result.length > 0) {
          form.setFieldsValue({ accountId: result[0].accountId });
        }
      }
    }
  }, [form]);

  // 页面加载时自动获取 AI 用户列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      console.log('是我执行的嘛?');
      getAIUserList();
    }
  }, [getAIUserList]);

  // 监听 AI 响应事件
  useEffect(() => {
    if (!window.nim) return;

    const handleAIResponse = (result: any) => {
      console.log('ProxyAIModelCall 页面, 收到 AI 响应事件:', result);

      // 如果有响应内容，添加到历史消息
      if (result.content && result.content.msg) {
        const aiMessage: V2NIMAIModelCallMessage = {
          role: V2NIMConst.V2NIMAIModelRoleType.V2NIM_AI_MODEL_ROLE_TYPE_ASSISTANT,
          msg: result.content.msg,
          type: result.content.type || 0,
        };

        setHistoryMessages(prev => {
          const newMessages = [...prev, aiMessage];
          // 最多保留 30 条消息
          return newMessages.slice(-30);
        });

        message.success('ProxyAIModelCall 页面, 已收到 AI 响应并添加到历史消息');
      }
    };

    // 注册监听器
    window.nim.V2NIMAIService.on('onProxyAIModelCall', handleAIResponse);

    // 组件卸载时移除监听器
    return () => {
      window.nim?.V2NIMAIService.off('onProxyAIModelCall', handleAIResponse);
    };
  }, []);

  // 生成随机 requestId (使用简单的UUID生成方法)
  const generateRequestId = () => {
    const newRequestId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    form.setFieldsValue({ requestId: newRequestId });
    message.success('已生成新的 requestId');
  };

  // 表单提交: 触发 API 调用
  const handleProxyAIModelCall = async (values: ProxyAIModelCallFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountId, requestId, content, messages, aiStream } = values;

    if (!accountId) {
      message.error('请选择 AI 用户');
      return;
    }

    if (!requestId) {
      message.error('请输入或生成 requestId');
      return;
    }

    if (!content || content.trim() === '') {
      message.error('请输入请求内容');
      return;
    }

    setLoading(true);

    // 构建上下文消息
    const contextMessages: V2NIMAIModelCallMessage[] = messages
      ? historyMessages.filter((_, index) => messages.includes(index.toString()))
      : [];

    // 构建 API 参数
    const params = {
      accountId,
      requestId,
      content: {
        msg: content,
        type: 0, // 目前只支持文本类型
      },
      messages: contextMessages.length > 0 ? contextMessages : undefined,
      aiStream,
    };

    // 打印 API 入参
    console.log('API V2NIMAIService.proxyAIModelCall execute, params:', params);

    // 执行 API
    const [error] = await to(() => window.nim?.V2NIMAIService.proxyAIModelCall(params));

    setLoading(false);

    if (error) {
      message.error(`AI 请求代理失败: ${error.toString()}`);
      console.error('AI 请求代理失败:', error.toString());
    } else {
      message.success('AI 请求已发送，请等待响应（通过 onProxyAIModelCall 事件接收）');
      console.log('AI 请求已发送');
      // 将当前问题添加到历史消息中
      const newMessage: V2NIMAIModelCallMessage = {
        role: V2NIMConst.V2NIMAIModelRoleType.V2NIM_AI_MODEL_ROLE_TYPE_USER,
        msg: content,
        type: 0,
      };
      setHistoryMessages(prev => {
        const newMessages = [...prev, newMessage];
        // 最多保留 30 条消息
        return newMessages.slice(-30);
      });
      // 存储最终执行的参数
      localStorage.setItem(storageKey, JSON.stringify(values));
    }
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultFormValues);
    // 清空历史消息
    setHistoryMessages([]);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { accountId, requestId, content, messages, aiStream } = values;

    if (!accountId || !requestId || !content) {
      message.error('请先填写必要参数');
      return;
    }

    const contextMessages: V2NIMAIModelCallMessage[] = messages
      ? historyMessages.filter((_, index) => messages.includes(index.toString()))
      : [];

    const params = {
      accountId,
      requestId,
      content: { msg: content, type: 'text' },
      messages: contextMessages.length > 0 ? contextMessages : undefined,
      aiStream,
    };

    const callStatement = `const params = ${JSON.stringify(params, null, 2)};
await window.nim.V2NIMAIService.proxyAIModelCall(params);`;

    console.log('V2NIMAIService.proxyAIModelCall 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化 AI 用户显示信息
  const formatAIUserLabel = (aiUser: any) => {
    return `${aiUser.name || aiUser.accountId} (${aiUser.accountId})`;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleProxyAIModelCall}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMAIService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="AI 用户"
          name="accountId"
          rules={[{ required: true, message: '请选择 AI 用户' }]}
          tooltip="选择要对话的 AI 数字人账号"
        >
          <Select
            placeholder="请选择 AI 用户"
            loading={aiUsersLoading}
            notFoundContent={aiUsersLoading ? '获取中...' : '暂无 AI 用户'}
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: 8, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    onClick={getAIUserList}
                    loading={aiUsersLoading}
                    style={{ padding: 0 }}
                  >
                    刷新 AI 用户列表
                  </Button>
                </div>
              </div>
            )}
          >
            {aiUsers.map(aiUser => (
              <Select.Option key={aiUser.accountId} value={aiUser.accountId}>
                {formatAIUserLabel(aiUser)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="请求 ID" tooltip="唯一请求标识，用于匹配请求和响应" required>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="requestId"
              rules={[{ required: true, message: '请输入或生成 requestId' }]}
              noStyle
            >
              <Input placeholder="请输入 requestId 或点击生成" style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" onClick={generateRequestId}>
              随机生成
            </Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          label="请求内容"
          name="content"
          rules={[{ required: true, message: '请输入请求内容' }]}
          tooltip="向 AI 发送的文本内容"
        >
          <TextArea rows={4} placeholder="请输入向 AI 发送的文本内容" />
        </Form.Item>

        <Form.Item
          label="上下文消息"
          name="messages"
          tooltip="选择历史消息作为上下文，帮助 AI 理解对话背景"
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {historyMessages.length === 0 ? (
                <div style={{ color: '#999', padding: '8px 0' }}>暂无历史消息</div>
              ) : (
                historyMessages.map((msg, index) => (
                  <Checkbox key={index} value={index.toString()}>
                    <span style={{ fontWeight: 'bold' }}>{msg.role}:</span> {msg.msg}
                  </Checkbox>
                ))
              )}
            </Space>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          label="流式响应"
          name="aiStream"
          valuePropName="checked"
          tooltip="是否启用流式响应，启用后 AI 会逐步返回响应内容"
        >
          <Switch />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              发送 AI 请求
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>向 AI 数字人发送请求并获取响应
          </li>
          <li>
            <strong>参数：</strong>accountId (AI账号), requestId (请求ID), content (文本内容),
            messages (上下文消息), aiStream (流式响应)
          </li>
          <li>
            <strong>返回值：</strong>void (通过 onProxyAIModelCall 事件接收响应)
          </li>
          <li>
            <strong>用途：</strong>与 AI 数字人进行智能对话交互
          </li>
        </ul>
      </Card>

      {/* 重要提醒 */}
      <Card
        title="⚠️ 重要提醒"
        style={{
          marginTop: 16,
          border: '2px solid #ff9c6e',
          backgroundColor: '#fff7e6',
        }}
        size="small"
        styles={{
          header: {
            backgroundColor: '#ffe7ba',
            color: '#d46b08',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#d46b08' }}>
          <li>需先通过 getAIUserList 获取可用的 AI 用户列表</li>
          <li>requestId 必须唯一，建议使用 UUID 生成</li>
          <li>响应通过 onProxyAIModelCall 事件回调，请监听该事件</li>
          <li>流式响应会多次触发回调，直到接收完整内容</li>
          <li>上下文消息可帮助 AI 更好理解对话背景</li>
        </ul>
      </Card>
    </div>
  );
};

export default ProxyAIModelCallPage;
