import { Alert, Button, Card, Form, Input, Select, Space, Table, Tag, message } from 'antd';
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

interface DeleteMessageFormValues {
  conversationId: string;
  messageIds: string[];
  serverExtension: string;
}

const defaultDeleteMessageFormValues: DeleteMessageFormValues = {
  conversationId: '',
  messageIds: [],
  serverExtension: '{"reason": "user_delete"}',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMMessageService.deleteMessages`;

const DeleteMessagePage = () => {
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
  // 选择的消息对象数组
  const [selectedMessages, setSelectedMessages] = useState<V2NIMMessage[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const initialValues = defaultDeleteMessageFormValues;

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

  // 根据会话ID获取消息列表
  const getMessagesByConversationId = async (conversationId: string) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setMessagesLoading(true);
    setMessages([]);
    setSelectedMessages([]);
    form.setFieldsValue({ messageIds: [] });

    // 构建查询选项
    const option = {
      conversationId,
      limit: 50,
      direction: 0,
      messageTypes: [0, 1, 2, 3, 4, 5, 10, 100], // 查询所有类型的消息
    };

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

      setMessages(messageList);

      if (messageList.length === 0) {
        message.info('该会话中没有消息');
      } else {
        message.success(`获取到 ${messageList.length} 条消息`);
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
  const handleDeleteMessages = async (values: DeleteMessageFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }
    if (selectedMessages.length === 0) {
      message.error('请选择要删除的消息');
      return;
    }

    // 检查是否超过50条限制
    if (selectedMessages.length > 50) {
      message.error('一次最多只能删除50条消息');
      return;
    }

    // 检查是否是同一会话的消息
    const firstConversationId = selectedMessages[0].conversationId;
    const isSameConversation = selectedMessages.every(
      msg => msg.conversationId === firstConversationId
    );
    if (!isSameConversation) {
      message.error('所删除的消息必须是同一会话的消息');
      return;
    }

    const { serverExtension } = values;

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API V2NIMMessageService.deleteMessages execute, params:',
      selectedMessages,
      serverExtension
    );

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMMessageService.deleteMessages(selectedMessages, serverExtension)
    );

    if (error) {
      message.error(`批量删除消息失败: ${error.toString()}`);
      console.error('批量删除消息失败:', error.toString());
    } else {
      message.success(`成功删除 ${selectedMessages.length} 条消息`);

      // 删除成功后，重新获取消息列表
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
    form.setFieldsValue(defaultDeleteMessageFormValues);
    setMessages([]);
    setSelectedMessages([]);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();

    if (selectedMessages.length === 0) {
      message.error('请先选择要删除的消息');
      return;
    }

    const { serverExtension } = values;

    const callStatement = `await window.nim.V2NIMMessageService.deleteMessages(messagesArray, ${JSON.stringify(serverExtension)});`;

    console.log('V2NIMMessageService.deleteMessages 调用语句:');
    console.log(callStatement);
    console.log('messagesArray:', selectedMessages);
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

  // 处理消息多选
  function onMessageSelect(selectedValues: string[]): void {
    const selected = messages.filter(msg => selectedValues.includes(msg.messageClientId));
    setSelectedMessages(selected);
  }

  // 表格列定义
  const messageColumns = [
    {
      title: '消息ID',
      dataIndex: 'messageClientId',
      key: 'messageClientId',
      width: 120,
      ellipsis: true,
      render: (text: string) => text.slice(-8),
    },
    {
      title: '发送者',
      dataIndex: 'senderId',
      key: 'senderId',
      width: 100,
      ellipsis: true,
    },
    {
      title: '消息类型',
      dataIndex: 'messageType',
      key: 'messageType',
      width: 100,
      render: (type: number) => <Tag color="blue">{formatMessageType(type)}</Tag>,
    },
    {
      title: '内容',
      key: 'content',
      width: 200,
      ellipsis: true,
      render: (record: V2NIMMessage) => {
        if (record.messageType === 0) {
          // 文本消息
          return record.text || '-';
        } else if (record.attachment) {
          // 其他消息类型显示附件信息
          return `附件: ${'name' in record.attachment ? record.attachment.name : '未知文件'}`;
        }
        return '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (timestamp: number) => formatTimestamp(timestamp),
    },
    {
      title: '状态',
      dataIndex: 'sendingState',
      key: 'sendingState',
      width: 80,
      render: (state: number) => {
        const stateMap: { [key: number]: { text: string; color: string } } = {
          0: { text: '发送中', color: 'processing' },
          1: { text: '发送成功', color: 'success' },
          2: { text: '发送失败', color: 'error' },
        };
        const stateInfo = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={stateInfo.color}>{stateInfo.text}</Tag>;
      },
    },
  ];

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleDeleteMessages}
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
          tooltip="选择要删除消息的会话"
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
                setSelectedMessages([]);
                form.setFieldsValue({ messageIds: [] });
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
          name="messageIds"
          tooltip="选择要删除的消息（可多选，最多50条）"
          rules={[{ required: true, message: '请选择要删除的消息' }]}
        >
          <Select
            mode="multiple"
            placeholder={messages.length === 0 ? '请先选择会话' : '选择要删除的消息（可多选）'}
            disabled={messages.length === 0}
            value={selectedMessages.map(msg => msg.messageClientId)}
            onChange={onMessageSelect}
            notFoundContent={messagesLoading ? '获取消息中...' : '无消息'}
            maxTagCount={3}
            maxTagTextLength={8}
          >
            {messages.map(msg => (
              <Option key={msg.messageClientId} value={msg.messageClientId}>
                {msg.messageClientId.slice(-8)} - {formatMessageType(msg.messageType)} -{' '}
                {formatTimestamp(msg.createTime)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="服务端扩展" name="serverExtension" tooltip="服务端扩展字段，JSON格式">
          <TextArea rows={2} placeholder="服务端扩展字段，JSON格式" />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ flex: 1 }}
              danger
              disabled={selectedMessages.length === 0}
            >
              删除消息 ({selectedMessages.length})
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

      {/* 选中的消息预览 */}
      {selectedMessages.length > 0 && (
        <Card
          title={`已选择的消息 (${selectedMessages.length} 条)`}
          style={{ marginTop: 16 }}
          size="small"
        >
          <Table
            dataSource={selectedMessages}
            columns={messageColumns}
            rowKey="messageClientId"
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
          />
          {selectedMessages.length > 50 && (
            <Alert
              message="超出限制"
              description="一次最多只能删除50条消息，请重新选择"
              type="error"
              style={{ marginTop: 8 }}
            />
          )}
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>批量删除指定的消息
          </li>
          <li>
            <strong>参数：</strong>messages (消息对象数组), serverExtension (服务端扩展字段)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，删除成功后触发相关事件
          </li>
          <li>
            <strong>用途：</strong>删除会话中的消息，支持多端同步
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
          <li>一次最多可以删除50条消息</li>
          <li>所删除的消息必须是同一会话的消息</li>
          <li>删除消息会多端同步，其他端也会收到删除通知</li>
          <li>删除成功会触发 onMessageDeletedNotifications 事件</li>
        </ul>
      </Card>
    </div>
  );
};

export default DeleteMessagePage;
