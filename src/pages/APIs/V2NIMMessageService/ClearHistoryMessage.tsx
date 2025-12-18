import { Alert, Button, Card, Checkbox, Form, Input, Select, Space, message } from 'antd';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;
const { TextArea } = Input;

interface ClearHistoryMessageFormValues {
  conversationId: string;
  deleteRoam: boolean;
  onlineSync: boolean;
  serverExtension: string;
}

const defaultClearHistoryMessageFormValues: ClearHistoryMessageFormValues = {
  conversationId: '',
  deleteRoam: true,
  onlineSync: false,
  serverExtension: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMMessageService.clearHistoryMessage`;

const ClearHistoryMessagePage = () => {
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

  // 获取初始值
  const initialValues = defaultClearHistoryMessageFormValues;

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
  const handleClearHistoryMessage = async (values: ClearHistoryMessageFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { conversationId, deleteRoam, onlineSync, serverExtension } = values;

    setLoading(true);

    // 构建清空历史消息参数
    const clearOption: any = {
      conversationId,
      deleteRoam,
      onlineSync,
    };

    if (serverExtension.trim()) {
      clearOption.serverExtension = serverExtension;
    }

    // 打印 API 入参
    console.log('API V2NIMMessageService.clearHistoryMessage execute, params:', clearOption);

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMMessageService.clearHistoryMessage(clearOption)
    );

    if (error) {
      message.error(`清空历史消息失败: ${error.toString()}`);
      console.error('清空历史消息失败:', error.toString());
    } else {
      message.success('清空历史消息成功');

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
    form.setFieldsValue(defaultClearHistoryMessageFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationId, deleteRoam, onlineSync, serverExtension } = values;

    // 构建参数对象
    const clearOption: any = {
      conversationId,
      deleteRoam,
      onlineSync,
    };

    if (serverExtension.trim()) {
      clearOption.serverExtension = serverExtension;
    }

    const callStatement = `await window.nim.V2NIMMessageService.clearHistoryMessage(${JSON.stringify(clearOption, null, 2)});`;

    console.log('V2NIMMessageService.clearHistoryMessage 调用语句:');
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

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleClearHistoryMessage}
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
          tooltip="选择要清空历史消息的会话"
          rules={[{ required: true, message: '请选择会话' }]}
        >
          <Select
            placeholder="请选择会话"
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
          label="删除漫游消息"
          name="deleteRoam"
          tooltip="是否需要删除漫游消息，默认为 true（仅P2P会话时有效）"
          valuePropName="checked"
        >
          <Checkbox>删除漫游消息（仅P2P会话时有效）</Checkbox>
        </Form.Item>

        <Form.Item
          label="多端同步"
          name="onlineSync"
          tooltip="是否需要通知其它多端同步账户，默认不同步"
          valuePropName="checked"
        >
          <Checkbox>通知其它多端同步</Checkbox>
        </Form.Item>

        <Form.Item
          label="扩展字段"
          name="serverExtension"
          tooltip="扩展字段，多端同步时会同步到其它端"
        >
          <TextArea rows={2} placeholder="扩展字段，多端同步时会同步到其它端" />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }} danger>
              清空历史消息
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
            <strong>功能：</strong>清空指定会话的所有历史消息
          </li>
          <li>
            <strong>参数：</strong>清空选项对象 (会话ID、删除配置、同步配置等)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，清空成功后触发相关事件
          </li>
          <li>
            <strong>用途：</strong>清除会话历史记录，支持多端同步
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
        <Alert
          message="危险操作警告"
          description="清空历史消息是不可逆操作，请谨慎使用！"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <ul style={{ margin: 0, paddingLeft: 20, color: '#d46b08' }}>
          <li>此操作会清空选定会话中的所有历史消息，操作不可逆</li>
          <li>"删除漫游消息" 选项仅在P2P会话中有效</li>
          <li>"多端同步" 选项用于控制是否通知其他登录端</li>
          <li>清空成功会触发相关的消息监听事件</li>
        </ul>
      </Card>
    </div>
  );
};

export default ClearHistoryMessagePage;
