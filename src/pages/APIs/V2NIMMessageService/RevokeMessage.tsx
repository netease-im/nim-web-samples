import { Button, Card, Form, Input, Select, Space, message } from 'antd';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;
const { TextArea } = Input;

// 消息类型选项
const messageTypeOptions = [
  { label: '文本消息', value: 0 },
  { label: '图片消息', value: 1 },
  { label: '音频消息', value: 2 },
  { label: '视频消息', value: 3 },
  { label: '文件消息', value: 4 },
  { label: '位置消息', value: 5 },
  { label: '通知消息', value: 10 },
  { label: '自定义消息', value: 100 },
];

interface RevokeMessageFormValues {
  conversationId: string;
  messageId: string;
  postscript: string;
  serverExtension: string;
  pushContent: string;
  pushPayload: string;
  env: string;
}

const defaultRevokeMessageFormValues: RevokeMessageFormValues = {
  conversationId: '',
  messageId: '',
  postscript: '我撤回了一条消息',
  serverExtension: '{"reason": "user_revoke"}',
  pushContent: '撤回了一条消息',
  pushPayload: '{"action": "revoke"}',
  env: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMMessageService.revokeMessage`;

const RevokeMessagePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 会话列表
  const [conversations, setConversations] = useState<V2NIMLocalConversation[]>([]);
  // 获取会话列表的加载状态
  const [conversationsLoading, setConversationsLoading] = useState(false);
  // 查询到的消息列表
  const [messages, setMessages] = useState<V2NIMMessage[]>([]);
  // 获取消息列表的加载状态
  const [messagesLoading, setMessagesLoading] = useState(false);
  // 选择的消息对象
  const [selectedMessage, setSelectedMessage] = useState<V2NIMMessage | null>(null);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const initialValues = defaultRevokeMessageFormValues;

  // 获取会话列表
  const getConversationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setConversationsLoading(true);
    console.log('API V2NIMLocalConversationService.getConversationList execute');
    const [error, result] = await to(() =>
      window.nim?.V2NIMLocalConversationService.getConversationList(0, 50)
    );
    setConversationsLoading(false);
    if (error) {
      message.error(`获取会话列表失败: ${error}`);
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

  // 根据会话ID获取消息列表
  const getMessagesByConversationId = async (conversationId: string) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setMessagesLoading(true);
    setMessages([]);
    setSelectedMessage(null);
    form.setFieldsValue({ messageId: '' });

    // 构建查询选项
    const option = {
      conversationId,
      limit: 50,
      direction: 0,
      messageTypes: [0, 1, 2, 3, 4, 5, 10, 100], // 查询所有类型的消息
    };

    console.log('API V2NIMMessageService.getMessageListEx execute, params:', option);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMMessageService.getMessageListEx(option)
    );

    if (error) {
      message.error(`获取消息列表失败: ${error.toString()}`);
      console.error('获取消息列表失败:', error.toString());
      setMessages([]);
    } else {
      console.log('获取消息列表成功, 结果:', result);
      const messageList = result?.messages || [];

      // 只显示当前用户发送的消息（只能撤回自己的消息）
      const currentUserId = window.nim?.V2NIMLoginService.getLoginUser();
      const userMessages = messageList.filter(msg => msg.senderId === currentUserId);

      setMessages(userMessages);

      if (userMessages.length === 0) {
        message.info('该会话中没有您发送的消息可以撤回');
      } else {
        message.success(`获取到 ${userMessages.length} 条可撤回的消息`);
      }
    }
    setMessagesLoading(false);
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
  const handleRevokeMessage = async (values: RevokeMessageFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }
    if (!selectedMessage) {
      message.error('请选择要撤回的消息');
      return;
    }

    const { postscript, serverExtension, pushContent, pushPayload, env } = values;

    setLoading(true);

    // 构建撤回参数
    const revokeParams: any = {};
    if (postscript.trim()) {
      revokeParams.postscript = postscript;
    }

    if (serverExtension.trim()) {
      try {
        revokeParams.serverExtension = serverExtension;
      } catch (error) {
        message.error('服务端扩展字段格式错误');
        setLoading(false);
        return;
      }
    }

    if (pushContent.trim()) {
      revokeParams.pushContent = pushContent;
    }

    if (pushPayload.trim()) {
      revokeParams.pushPayload = pushPayload;
    }

    if (env.trim()) {
      revokeParams.env = env;
    }

    // 打印 API 入参
    console.log(
      'API V2NIMMessageService.revokeMessage execute, params:',
      selectedMessage,
      revokeParams
    );

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMMessageService.revokeMessage(selectedMessage, revokeParams)
    );

    if (error) {
      message.error(`撤回消息失败: ${error.toString()}`);
      console.error('撤回消息失败:', error.toString());
    } else {
      message.success('撤回消息成功');

      // 撤回成功后，重新获取消息列表
      if (values.conversationId) {
        getMessagesByConversationId(values.conversationId);
      }

      // 存储最终执行的参数
      localStorage.setItem(storageKey, JSON.stringify(values));
    }
    setLoading(false);
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultRevokeMessageFormValues);
    setMessages([]);
    setSelectedMessage(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();

    if (!selectedMessage) {
      message.error('请先选择要撤回的消息');
      return;
    }

    const { postscript, serverExtension, pushContent, pushPayload, env } = values;

    // 构建参数对象
    const revokeParams: any = {};

    if (postscript.trim()) {
      revokeParams.postscript = postscript;
    }

    if (serverExtension.trim()) {
      revokeParams.serverExtension = serverExtension;
    }

    if (pushContent.trim()) {
      revokeParams.pushContent = pushContent;
    }

    if (pushPayload.trim()) {
      revokeParams.pushPayload = pushPayload;
    }

    if (env.trim()) {
      revokeParams.env = env;
    }

    const callStatement = `await window.nim.V2NIMMessageService.revokeMessage(messageObject, ${JSON.stringify(revokeParams, null, 2)});`;

    console.log('V2NIMMessageService.revokeMessage 调用语句:');
    console.log(callStatement);
    console.log('messageObject:', selectedMessage);
    message.success('调用语句已输出到控制台');
  };

  // 格式化会话显示信息
  const formatConversationLabel = (conversation: V2NIMLocalConversation) => {
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

  // 格式化消息类型
  const formatMessageType = (type: number) => {
    const typeOption = messageTypeOptions.find(option => option.value === type);
    return typeOption ? typeOption.label : `未知类型(${type})`;
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-';
  };

  function onMessageSelect(value: string): void {
    setSelectedMessage(messages.find(msg => msg.messageClientId === value) || null);
  }

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleRevokeMessage}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMMessageService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="选择会话"
          name="conversationId"
          tooltip="选择要撤回消息的会话"
          rules={[{ required: true, message: '请选择会话' }]}
        >
          <Select
            placeholder="请选择会话"
            loading={conversationsLoading}
            notFoundContent={conversationsLoading ? '获取中...' : '暂无会话记录'}
            onChange={value => {
              if (value) {
                getMessagesByConversationId(value);
              } else {
                setMessages([]);
                setSelectedMessage(null);
                form.setFieldsValue({ messageId: '' });
              }
            }}
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
          label="选择消息"
          name="messageId"
          tooltip="选择要撤回的消息"
          rules={[{ required: true, message: '请选择要撤回的消息' }]}
        >
          <Select
            placeholder={messages.length === 0 ? '请先选择会话' : '从下方表格中选择消息'}
            disabled={messages.length === 0}
            value={selectedMessage?.messageClientId}
            onChange={value => onMessageSelect(value)}
            notFoundContent={messagesLoading ? '获取消息中...' : '无可撤回的消息'}
          >
            {messages.map(msg => (
              <Option key={msg.messageClientId} value={msg.messageClientId}>
                {msg.messageClientId.slice(-8)} - {formatMessageType(msg.messageType)} -{' '}
                {formatTimestamp(msg.createTime)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="撤回附言" name="postscript" tooltip="撤回消息时显示的附言">
          <Input placeholder="撤回消息时显示的附言" />
        </Form.Item>

        <Form.Item label="服务端扩展" name="serverExtension" tooltip="服务端扩展字段，JSON格式">
          <TextArea rows={2} placeholder="服务端扩展字段，JSON格式" />
        </Form.Item>

        <Form.Item label="推送内容" name="pushContent" tooltip="撤回消息的推送内容">
          <Input placeholder="撤回消息的推送内容" />
        </Form.Item>

        <Form.Item label="推送附加参数" name="pushPayload" tooltip="撤回消息的附加参数，JSON格式">
          <TextArea rows={2} placeholder="撤回消息的推送附加参数，JSON格式" />
        </Form.Item>

        <Form.Item label="环境参数" name="env" tooltip="环境参数">
          <Input placeholder="环境参数（可选）" />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ flex: 1 }}
              danger
              disabled={!selectedMessage}
            >
              撤回消息
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
            <strong>功能：</strong>撤回指定的消息
          </li>
          <li>
            <strong>参数：</strong>message (消息对象), revokeParams (撤回配置)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，撤回成功后触发相关事件
          </li>
          <li>
            <strong>用途：</strong>撤回已发送的消息，支持设置撤回原因和推送配置
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
          <li>只能撤回自己发送的消息，通常只能撤回2分钟内的消息</li>
          <li>撤回后对方会收到撤回通知，显示您设置的附言</li>
          <li>撤回成功会触发 onMessageRevoked 事件</li>
          <li>服务端扩展和推送载荷需要使用JSON格式</li>
        </ul>
      </Card>
    </div>
  );
};

export default RevokeMessagePage;
