import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Text } = Typography;

interface CreateConversationFormValues {
  conversationId: string;
}

const defaultCreateConversationFormValues: CreateConversationFormValues = {
  conversationId: 'cjhz1|1|cjhz2',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMConversationService.createConversation`;

const CreateConversationPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): CreateConversationFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultCreateConversationFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultCreateConversationFormValues;
  };

  const initialValues = getInitialValues();

  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 创建结果
  const [conversationResult, setConversationResult] = useState<any>(null);

  // 随机生成会话ID
  const generateRandomConversationId = () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 生成随机账号ID用于演示
    const randomAccountId = `user${Math.floor(Math.random() * 1000)}`;

    // 使用 V2NIMConversationIdUtil 生成P2P会话ID
    const conversationId = window.nim.V2NIMConversationIdUtil.p2pConversationId(randomAccountId);

    // 设置到表单中
    form.setFieldsValue({ conversationId });
  };

  // 表单提交: 触发 API 调用
  const handleCreateConversation = async (values: CreateConversationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    const { conversationId } = values;
    if (!conversationId) {
      message.error('请输入会话ID');
      return;
    }

    setLoading(true);
    setConversationResult(null);

    // 打印 API 入参
    console.log('API V2NIMConversationService.createConversation execute, params:', conversationId);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationService.createConversation(conversationId)
    );
    if (error) {
      message.error(`创建会话失败: ${error.toString()}`);
      console.error('创建会话失败:', error.toString());
    } else {
      message.success('创建会话成功');
      console.log('创建会话成功, 结果:', result);
      setConversationResult(result);
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
    form.setFieldsValue(defaultCreateConversationFormValues);
    setConversationResult(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationId } = values;

    if (!conversationId) {
      message.error('请先输入会话ID');
      return;
    }

    const callStatement = `const result = await window.nim.V2NIMConversationService.createConversation("${conversationId}");`;

    console.log('V2NIMConversationService.createConversation 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化会话类型
  const formatConversationType = (type: number) => {
    const typeMap: { [key: number]: string } = {
      1: 'P2P',
      2: '群聊',
      3: '超大群',
    };
    return typeMap[type] || '未知';
  };

  // 格式化会话结果显示
  const formatConversationResult = (result: any) => {
    if (!result) {
      return <Text type="secondary">无会话数据</Text>;
    }

    return (
      <div style={{ padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
        <div>
          <Text strong>会话ID:</Text> {result.conversationId}
        </div>
        <div>
          <Text strong>类型:</Text> {formatConversationType(result.type)}
        </div>
        <div>
          <Text strong>未读数:</Text> {result.unreadCount || 0}
        </div>
        <div>
          <Text strong>置顶:</Text> {result.stickTop ? '是' : '否'}
        </div>
        <div>
          <Text strong>免打扰:</Text> {result.mute ? '是' : '否'}
        </div>
        {result.createTime && (
          <div>
            <Text strong>创建时间:</Text> {new Date(result.createTime).toLocaleString()}
          </div>
        )}
        {result.updateTime && (
          <div>
            <Text strong>更新时间:</Text> {new Date(result.updateTime).toLocaleString()}
          </div>
        )}
        {result.serverExtension && (
          <div>
            <Text strong>服务端扩展:</Text> {result.serverExtension}
          </div>
        )}
        {result.localExtension && (
          <div>
            <Text strong>本地扩展:</Text> {result.localExtension}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleCreateConversation}
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

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="dashed" onClick={generateRandomConversationId}>
              随机生成 p2p 会话ID
            </Button>
          </Space>
        </Form.Item>

        <Form.Item
          label="会话ID"
          name="conversationId"
          tooltip="会话的唯一标识符，可以通过上方按钮生成或手动输入"
          rules={[{ required: true, message: '请输入会话ID' }]}
        >
          <Input placeholder="请输入会话ID或点击上方按钮生成" />
        </Form.Item>

        {conversationResult && (
          <Form.Item label="创建结果">{formatConversationResult(conversationResult)}</Form.Item>
        )}

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              创建会话
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
            <strong>功能：</strong>创建新的会话
          </li>
          <li>
            <strong>参数：</strong>conversationId (会话唯一标识)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;V2NIMConversation&gt;
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
          <li>创建会话不会自动发送消息，仅建立会话关系</li>
          <li>如果会话已存在，会返回现有会话信息</li>
        </ul>
      </Card>
    </div>
  );
};

export default CreateConversationPage;
