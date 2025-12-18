import { Button, Card, Form, Radio, Select, Space, message } from 'antd';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;

interface StickTopConversationFormValues {
  conversationId: string;
  stickTop: boolean;
}

const defaultStickTopConversationFormValues: StickTopConversationFormValues = {
  conversationId: '',
  stickTop: true,
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMLocalConversationService.stickTopConversation`;

const StickTopConversationPage = () => {
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

  // 获取初始值.
  const initialValues = defaultStickTopConversationFormValues;

  // 获取会话列表
  const getConversationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setConversationsLoading(true);
    try {
      console.log('API V2NIMLocalConversationService.getConversationList execute');
      const result = await window.nim.V2NIMLocalConversationService.getConversationList(0, 50);
      console.log('获取到的会话列表:', result);
      setConversations(result.conversationList || []);

      if (!result.conversationList || result.conversationList.length === 0) {
        message.info('当前没有会话记录');
      } else {
        message.success(`获取到 ${result.conversationList.length} 个会话`);
      }
    } catch (error) {
      message.error(`获取会话列表失败: ${error}`);
      console.error('获取会话列表失败:', (error as Error).toString());
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  // 页面加载时自动获取会话列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleStickTopConversation = async (values: StickTopConversationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { conversationId, stickTop } = values;
    if (!conversationId) {
      message.error('请选择要操作的会话');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API V2NIMLocalConversationService.stickTopConversation execute, params:',
      conversationId,
      stickTop
    );

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMLocalConversationService.stickTopConversation(conversationId, stickTop)
    );
    if (error) {
      message.error(`${stickTop ? '置顶' : '取消置顶'}会话失败: ${error.toString()}`);
      console.error('置顶会话操作失败:', error.toString());
    } else {
      message.success(`${stickTop ? '置顶' : '取消置顶'}会话成功`);
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
    form.setFieldsValue(defaultStickTopConversationFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationId, stickTop } = values;

    if (!conversationId) {
      message.error('请先选择要操作的会话');
      return;
    }

    const callStatement = `await window.nim.V2NIMLocalConversationService.stickTopConversation("${conversationId}", ${stickTop});`;

    console.log('V2NIMLocalConversationService.stickTopConversation 调用语句:');
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

    // 显示置顶状态
    const stickTopStatus = conversation.stickTop ? '📌 ' : '';

    return `${stickTopStatus}${conversationType} - ${conversation.conversationId} - ${lastMessageTime}`;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleStickTopConversation}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLocalConversationService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>
        <Form.Item
          label="选择会话"
          name="conversationId"
          tooltip="选择要进行置顶/取消置顶操作的会话"
          rules={[{ required: true, message: '请选择要操作的会话' }]}
        >
          <Select
            placeholder="请选择要操作的会话"
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
          label="操作类型"
          name="stickTop"
          tooltip="选择要执行的操作：置顶或取消置顶"
          rules={[{ required: true, message: '请选择操作类型' }]}
        >
          <Radio.Group>
            <Radio value={true}>置顶会话</Radio>
            <Radio value={false}>取消置顶</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              执行操作
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
            <strong>功能：</strong>设置或取消会话的置顶状态
          </li>
          <li>
            <strong>参数：</strong>conversationId (会话ID), stickTop (是否置顶)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，操作成功后触发相关事件
          </li>
          <li>
            <strong>用途：</strong>管理会话优先级，置顶重要会话便于快速访问
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
          <li>置顶操作会将会话固定在会话列表的顶部</li>
          <li>置顶状态会影响会话列表的排序，置顶会话排在前面</li>
          <li>操作成功会触发 onConversationChanged 事件</li>
        </ul>
      </Card>
    </div>
  );
};

export default StickTopConversationPage;
