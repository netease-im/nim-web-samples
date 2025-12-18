import { Button, Card, Form, Select, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;

interface MarkConversationReadFormValues {
  conversationId: string;
}

const defaultMarkConversationReadFormValues: MarkConversationReadFormValues = {
  conversationId: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMConversationService.markConversationRead`;

const MarkConversationReadPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): MarkConversationReadFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultMarkConversationReadFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultMarkConversationReadFormValues;
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
  const handleMarkConversationRead = async (values: MarkConversationReadFormValues) => {
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
      message.error('请选择要标记已读的会话');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API V2NIMConversationService.markConversationRead execute, params:',
      conversationId
    );

    // 执行 API
    const [error, readTime] = await to(() =>
      window.nim?.V2NIMConversationService.markConversationRead(conversationId)
    );

    if (error) {
      message.error(`标记会话已读失败: ${error.toString()}`);
      console.error('标记会话已读失败:', error.toString());
    } else {
      message.success('标记会话已读成功');
      console.log('标记会话已读成功, 已读时间戳:', readTime);
      // 操作成功后，重新获取会话列表
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
    form.setFieldsValue(defaultMarkConversationReadFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationId } = values;

    if (!conversationId) {
      message.error('请先选择要标记已读的会话');
      return;
    }

    const callStatement = `const result = await window.nim.V2NIMConversationService.markConversationRead("${conversationId}");`;

    console.log('V2NIMConversationService.markConversationRead 调用语句:');
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

    // 显示未读数
    const unreadCount = conversation.unreadCount || 0;
    const unreadIndicator = unreadCount > 0 ? `🔴 ${unreadCount}` : '✅';

    return `${unreadIndicator} ${conversationType} - ${conversation.conversationId} - ${lastMessageTime}`;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleMarkConversationRead}
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
          tooltip="选择要标记已读的会话"
          rules={[{ required: true, message: '请选择要标记已读的会话' }]}
        >
          <Select
            placeholder="请选择要标记已读的会话"
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

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              标记已读
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
            <strong>功能：</strong>标记指定云端会话为已读状态
          </li>
          <li>
            <strong>参数：</strong>conversationId (会话ID字符串)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;number&gt; (已读时间戳)
          </li>
          <li>
            <strong>用途：</strong>清除会话未读数，更新已读状态，支持云端多端同步
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
          <li>标记会话已读会将该会话的未读数清零</li>
          <li>有未读消息的会话显示 🔴 和未读数，无未读消息显示 ✅</li>
          <li>操作成功会触发 onConversationReadTimeUpdated 事件</li>
          <li>该操作会同步到云端，所有登录设备实时更新</li>
        </ul>
      </Card>
    </div>
  );
};

export default MarkConversationReadPage;
