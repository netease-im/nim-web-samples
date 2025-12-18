import { Button, Card, Checkbox, Form, Select, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;

interface DeleteConversationFormValues {
  conversationId: string;
  clearMessage: boolean;
}

const defaultDeleteConversationFormValues: DeleteConversationFormValues = {
  conversationId: '',
  clearMessage: false,
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMConversationService.deleteConversation`;

const DeleteConversationPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): DeleteConversationFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultDeleteConversationFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultDeleteConversationFormValues;
  };

  const initialValues = getInitialValues();

  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 会话列表
  const [conversations, setConversations] = useState<any[]>([]);
  // 获取会话列表的加载状态
  const [conversationsLoading, setConversationsLoading] = useState(false);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取会话列表
  const getConversationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    setConversationsLoading(true);
    console.log('API V2NIMConversationService.getConversationList execute');
    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationService.getConversationList(0, 50)
    );
    setConversationsLoading(false);
    if (error) {
      message.error(`获取会话列表失败: ${error.toString()}`);
      console.error('获取会话列表失败:', error.toString());
      setConversations([]);
      return;
    }
    if (result) {
      console.log('获取到的会话列表:', result);
      setConversations(result.conversationList || []);

      if (!result.conversationList || result.conversationList.length === 0) {
        message.info('当前没有会话记录');
      } else {
        message.success(`获取到 ${result.conversationList.length} 个会话`);
      }
    }
  };

  // 页面加载时自动获取会话列表
  useEffect(() => {
    // 防止重复加载
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleDeleteConversation = async (values: DeleteConversationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    const { conversationId, clearMessage } = values;
    if (!conversationId) {
      message.error('请选择要删除的会话');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API V2NIMConversationService.deleteConversation execute, params:',
      conversationId,
      clearMessage
    );

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMConversationService.deleteConversation(conversationId, clearMessage)
    );
    if (error) {
      message.error(`删除会话失败: ${error.toString()}`);
      console.error('删除会话失败:', error.toString());
    } else {
      message.success('删除会话成功');
      // 删除成功后，重新获取会话列表
      getConversationList();
    }
    // finally
    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultDeleteConversationFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationId, clearMessage } = values;

    if (!conversationId) {
      message.error('请先选择要删除的会话');
      return;
    }

    const callStatement = `const result = await window.nim.V2NIMConversationService.deleteConversation("${conversationId}", ${clearMessage});`;

    console.log('V2NIMConversationService.deleteConversation 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化会话显示信息
  const formatConversationLabel = (conversation: any) => {
    const typeMap: { [key: number]: string } = {
      1: 'P2P',
      2: '群聊',
      3: '超大群',
    };

    const conversationType = typeMap[conversation.type] || '未知';
    const lastMessageTime = conversation.updateTime
      ? new Date(conversation.updateTime).toLocaleString()
      : '无消息';

    return `${conversationType} - ${conversation.conversationId} - ${lastMessageTime}`;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleDeleteConversation}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMConversationService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="选择会话"
          name="conversationId"
          tooltip="选择要删除的会话"
          rules={[{ required: true, message: '请选择要删除的会话' }]}
        >
          <Select
            placeholder="请选择要删除的会话"
            loading={conversationsLoading}
            notFoundContent={conversationsLoading ? '获取中...' : '暂无会话记录'}
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: 8, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    onClick={getConversationList}
                    loading={conversationsLoading}
                    style={{ padding: 0 }}
                  >
                    刷新会话列表
                  </Button>
                </div>
              </div>
            )}
          >
            {conversations.map(conversation => (
              <Option key={conversation.conversationId} value={conversation.conversationId}>
                {formatConversationLabel(conversation)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="清除消息"
          name="clearMessage"
          valuePropName="checked"
          tooltip="是否删除会话对应的云端历史消息"
        >
          <Checkbox>删除会话对应的云端历史消息</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }} danger>
              删除会话
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
            <strong>功能：</strong>删除指定的云端会话记录
          </li>
          <li>
            <strong>参数：</strong>conversationId (会话ID), clearMessage (是否清除消息)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;void&gt;
          </li>
          <li>
            <strong>用途：</strong>从云端移除不需要的会话，可选择是否删除历史消息
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
          <li>需要先启用云端会话功能才能使用此API</li>
          <li>删除会话操作会从云端移除会话记录</li>
          <li>勾选"清除消息"会同时删除会话对应的云端历史消息</li>
          <li>删除成功会触发 onConversationDeleted 事件</li>
        </ul>
      </Card>
    </div>
  );
};

export default DeleteConversationPage;
