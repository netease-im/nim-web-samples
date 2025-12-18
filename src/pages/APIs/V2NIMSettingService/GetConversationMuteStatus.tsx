import { Button, Card, Form, Select, Space, Typography, message } from 'antd';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;
const { Text } = Typography;

interface GetConversationMuteStatusFormValues {
  conversationId: string;
}

const defaultFormValues: GetConversationMuteStatusFormValues = {
  conversationId: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMSettingService.getConversationMuteStatus`;

const GetConversationMuteStatusPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 会话列表
  const [conversations, setConversations] = useState<V2NIMLocalConversation[]>([]);
  // 获取会话列表的加载状态
  const [conversationsLoading, setConversationsLoading] = useState(false);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);
  // 最后一次查询的结果
  const [lastMuteStatus, setLastMuteStatus] = useState<boolean | null>(null);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): GetConversationMuteStatusFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultFormValues;
  };

  const initialValues = getInitialValues();

  // 获取会话列表
  const getConversationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setConversationsLoading(true);
    const [error, result] = await to(() =>
      window.nim?.V2NIMLocalConversationService.getConversationList(0, 50)
    );
    if (error) {
      message.error(`获取会话列表失败: ${error.toString()}`);
      console.error('获取会话列表失败:', error.toString());
      setConversations([]);
      setConversationsLoading(false);
      return;
    }
    if (!result) {
      message.error('获取会话列表结果为空');
      setConversationsLoading(false);
      return;
    }
    console.log('API V2NIMLocalConversationService.getConversationList execute');
    console.log('获取到的会话列表:', result);
    setConversations(result.conversationList || []);

    if (!result.conversationList || result.conversationList.length === 0) {
      message.info('当前没有会话记录');
    } else {
      message.success(`获取到 ${result.conversationList.length} 个会话`);
    }
    setConversationsLoading(false);
  };

  // 页面加载时自动获取会话列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleGetConversationMuteStatus = async (values: GetConversationMuteStatusFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { conversationId } = values;
    if (!conversationId) {
      message.error('请选择要查询免打扰状态的会话');
      return;
    }

    setLoading(true);
    setLastMuteStatus(null);

    // 打印 API 入参
    console.log(
      'API V2NIMSettingService.getConversationMuteStatus execute, params:',
      conversationId
    );

    // 执行 API
    const [error, muteStatus] = await to(() =>
      window.nim?.V2NIMSettingService.getConversationMuteStatus(conversationId)
    );

    if (error) {
      message.error(`获取会话免打扰状态失败: ${error.toString()}`);
      console.error('获取会话免打扰状态失败:', error.toString());
    } else {
      const statusText = muteStatus ? '已开启免打扰' : '未开启免打扰';
      message.success(`获取会话免打扰状态成功: ${statusText}`);
      console.log('获取会话免打扰状态成功, 免打扰状态:', muteStatus, `(${statusText})`);
      setLastMuteStatus(muteStatus as boolean);
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
    form.setFieldsValue(defaultFormValues);
    setLastMuteStatus(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationId } = values;

    if (!conversationId) {
      message.error('请先选择要查询免打扰状态的会话');
      return;
    }

    const callStatement = `const muteStatus = window.nim.V2NIMSettingService.getConversationMuteStatus("${conversationId}");`;

    console.log('V2NIMSettingService.getConversationMuteStatus 调用语句:');
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

    // 显示未读数和免打扰状态
    const unreadCount = conversation.unreadCount || 0;
    const unreadIndicator = unreadCount > 0 ? `🔴 ${unreadCount}` : '✅';

    // 注意：这里无法直接获取免打扰状态，因为需要调用API查询
    // 可以在会话名称中加入提示，告知用户需要查询才能知道免打扰状态

    return `${unreadIndicator} ${conversationType} - ${conversation.conversationId} - ${lastMessageTime}`;
  };

  // 格式化免打扰状态显示
  const formatMuteStatus = (muteStatus: boolean) => {
    return muteStatus ? (
      <Text type="warning">🔕 已开启免打扰</Text>
    ) : (
      <Text type="success">🔔 未开启免打扰</Text>
    );
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetConversationMuteStatus}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMSettingService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>
        <Form.Item
          label="选择会话"
          name="conversationId"
          tooltip="选择要查询免打扰状态的会话"
          rules={[{ required: true, message: '请选择要查询免打扰状态的会话' }]}
        >
          <Select
            placeholder="请选择要查询免打扰状态的会话"
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

        {lastMuteStatus !== null && (
          <Form.Item label="查询结果">
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {formatMuteStatus(lastMuteStatus)}
            </div>
          </Form.Item>
        )}

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              查询免打扰状态
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
            <strong>功能：</strong>查询指定会话的消息免打扰状态
          </li>
          <li>
            <strong>参数：</strong>conversationId (会话ID)
          </li>
          <li>
            <strong>返回值：</strong>boolean (true=已开启免打扰，false=未开启)
          </li>
          <li>
            <strong>用途：</strong>获取会话免打扰设置，支持所有会话类型
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
          <li>同步方法，直接从本地缓存获取状态</li>
          <li>需要确保数据已通过登录同步完成</li>
          <li>免打扰只影响提醒方式，不影响消息接收</li>
          <li>状态变更会通过相应的监听事件通知</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetConversationMuteStatusPage;
