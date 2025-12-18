import { Button, Card, Form, InputNumber, Select, Space, Table, Tag, message } from 'antd';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;

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

// 查询方向
const directionOptions = [
  { label: '查询比锚点时间更旧的消息（默认）', value: 0 },
  { label: '查询比锚点时间更新的消息', value: 1 },
];

interface GetMessageListExFormValues {
  conversationId: string;
  beginTime: number;
  endTime: number;
  limit: number;
  direction: number;
  messageTypes: number[];
  anchorMessage?: string;
}

const defaultGetMessageListExFormValues: GetMessageListExFormValues = {
  conversationId: '',
  beginTime: 0,
  endTime: 0,
  limit: 20,
  direction: 0,
  messageTypes: [0, 1, 2, 3, 4, 5, 10, 100],
  anchorMessage: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMMessageService.getMessageListEx`;

const GetMessageListExPage = () => {
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
  // 是否有更多消息
  const [hasMore, setHasMore] = useState(false);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const initialValues = defaultGetMessageListExFormValues;

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

  // 页面加载时自动获取会话列表
  useEffect(() => {
    // 防止重复加载
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleGetMessageListEx = async (values: GetMessageListExFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { conversationId, beginTime, endTime, limit, direction, messageTypes, anchorMessage } =
      values;
    if (!conversationId) {
      message.error('请选择会话');
      return;
    }

    setLoading(true);

    // 构建查询选项
    const option: any = {
      conversationId,
      beginTime: beginTime || 0,
      endTime: endTime || 0,
      limit: limit || 20,
      direction: direction || 0,
      messageTypes: messageTypes && messageTypes.length > 0 ? messageTypes : undefined,
    };

    // 如果提供了锚点消息ID，查找对应的消息对象
    if (anchorMessage) {
      const selectedMessage = messages.find(msg => msg.messageClientId === anchorMessage);
      if (selectedMessage) {
        option.anchorMessage = selectedMessage;
      } else {
        message.error('选择的锚点消息不存在，请重新选择');
        setLoading(false);
        return;
      }
    }

    // 打印 API 入参
    console.log('API V2NIMMessageService.getMessageListEx execute, params:', option);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMMessageService.getMessageListEx(option)
    );

    if (error) {
      message.error(`查询消息列表失败: ${error.toString()}`);
      console.error('查询消息列表失败:', error.toString());
      setMessages([]);
      setHasMore(false);
    } else {
      message.success(`查询消息列表成功，共获取到 ${result?.messages?.length || 0} 条消息`);
      console.log('查询消息列表成功, 结果:', result);
      setMessages(result?.messages || []);
      setHasMore(result?.messages && result?.messages.length > 0 ? true : false);

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
    form.setFieldsValue(defaultGetMessageListExFormValues);
    setMessages([]);
    setHasMore(false);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationId, beginTime, endTime, limit, direction, messageTypes, anchorMessage } =
      values;

    if (!conversationId) {
      message.error('请先选择会话');
      return;
    }

    // 构建参数对象
    const option: any = {
      conversationId,
      beginTime: beginTime || 0,
      endTime: endTime || 0,
      limit: limit || 20,
      direction: direction || 0,
    };

    if (messageTypes && messageTypes.length > 0) {
      option.messageTypes = messageTypes;
    }
    if (anchorMessage) {
      const selectedMessage = messages.find(msg => msg.messageClientId === anchorMessage);
      if (selectedMessage) {
        option.anchorMessage = selectedMessage;
      }
    }

    const callStatement = `const result = await window.nim.V2NIMMessageService.getMessageListEx(${JSON.stringify(option, null, 2)});`;

    console.log('V2NIMMessageService.getMessageListEx 调用语句:');
    console.log(callStatement);
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

  // 表格列定义
  const messageColumns = [
    {
      title: '消息ID',
      dataIndex: 'messageClientId',
      key: 'messageClientId',
      width: 120,
      ellipsis: true,
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
        onFinish={handleGetMessageListEx}
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
          tooltip="选择要查询消息的会话"
          rules={[{ required: true, message: '请选择要查询消息的会话' }]}
        >
          <Select
            placeholder="请选择要查询消息的会话"
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
          label="开始时间"
          name="beginTime"
          tooltip="查询的开始时间戳（毫秒），0表示不限制"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="开始时间戳（毫秒），0表示不限制"
            min={0}
          />
        </Form.Item>

        <Form.Item label="结束时间" name="endTime" tooltip="查询的结束时间戳（毫秒），0表示不限制">
          <InputNumber
            style={{ width: '100%' }}
            placeholder="结束时间戳（毫秒），0表示不限制"
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="一页数量"
          name="limit"
          tooltip="单次查询的消息数量限制"
          rules={[{ required: true, message: '请输入查询数量' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="查询数量限制" min={1} max={100} />
        </Form.Item>

        <Form.Item label="查询方向" name="direction" tooltip="相对于锚点消息的查询方向">
          <Select placeholder="选择查询方向">
            {directionOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="消息类型"
          name="messageTypes"
          tooltip="筛选的消息类型，不选择表示查询所有类型"
        >
          <Select mode="multiple" placeholder="选择要查询的消息类型（可多选）" allowClear>
            {messageTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="锚点消息" name="anchorMessage" tooltip="选择作为查询起点的锚点消息">
          <Select
            placeholder="请选择锚点消息（可选）"
            allowClear
            showSearch
            optionFilterProp="children"
            notFoundContent={messages.length === 0 ? '请先查询消息列表' : '无匹配消息'}
            onChange={(value, option) => {
              if (value && option) {
                // 选择锚点消息后，自动设置结束时间为该消息的创建时间
                const selectedMessage = messages.find(msg => msg.messageClientId === value);
                if (selectedMessage) {
                  form.setFieldsValue({
                    endTime: selectedMessage.createTime,
                  });
                  message.info(
                    `已自动设置结束时间为：${formatTimestamp(selectedMessage.createTime)}`
                  );
                }
              } else {
                // 清除选择时，重置结束时间
                form.setFieldsValue({
                  endTime: 0,
                });
              }
            }}
          >
            {messages.map(msg => (
              <Option
                key={msg.messageClientId}
                value={msg.messageClientId}
                title={`${msg.senderId} - ${formatTimestamp(msg.createTime)} - ${msg.text || '非文本消息'}`}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {msg.messageClientId.slice(-8)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {msg.senderId} - {formatTimestamp(msg.createTime)}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {msg.messageType === 0
                      ? msg.text || '空文本'
                      : `${formatMessageType(msg.messageType)}`}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              查询消息列表
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

      {/* 查询结果展示 */}
      {messages.length > 0 && (
        <Card
          title={`查询结果 (共 ${messages.length} 条消息${hasMore ? '，还有更多' : ''})`}
          style={{ marginTop: 16 }}
          size="small"
        >
          <Table
            dataSource={messages}
            columns={messageColumns}
            rowKey="messageClientId"
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条消息`,
            }}
            scroll={{ x: 800 }}
          />
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Tag color="orange">还有更多消息，可以选择表格中任意一条消息作为锚点继续查询</Tag>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Tag color="blue">提示：选择锚点消息后会自动设置结束时间，便于分页查询</Tag>
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>增强版消息查询接口，支持多种查询条件
          </li>
          <li>
            <strong>参数：</strong>查询选项对象 (会话ID、时间范围、数量限制、消息类型等)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMMessageListResult (消息列表和分页信息)
          </li>
          <li>
            <strong>用途：</strong>按条件查询历史消息，支持分页和类型筛选
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
          <li>开始时间和结束时间都为0时，表示不限制时间范围</li>
          <li>锚点消息用于分页查询，选择后会自动设置结束时间</li>
          <li>查询方向决定相对于锚点消息是查询更早还是更新的消息</li>
          <li>可以通过消息类型筛选特定类型的消息</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetMessageListExPage;
