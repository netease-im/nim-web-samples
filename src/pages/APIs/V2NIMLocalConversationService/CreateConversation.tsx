import { Button, Card, Form, Input, Space, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface CreateConversationFormValues {
  conversationId: string;
}

const defaultCreateConversationFormValues: CreateConversationFormValues = {
  conversationId: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMLocalConversationService.createConversation`;

const CreateConversationPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 获取初始值.
  const initialValues = defaultCreateConversationFormValues;

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
    console.log(conversationId);
    form.setFieldsValue({ conversationId });
  };

  // 表单提交: 触发 API 调用
  const handleCreateConversation = async (values: CreateConversationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { conversationId } = values;
    if (!conversationId) {
      message.error('请输入会话ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API V2NIMLocalConversationService.createConversation execute, params:',
      conversationId
    );

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMLocalConversationService.createConversation(conversationId)
    );
    if (error) {
      message.error(`创建会话失败: ${error.toString()}`);
      console.error('创建会话失败:', error.toString());
    } else {
      message.success('创建会话成功');
      console.log('创建会话成功, 结果:', result);
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

    const callStatement = `await window.nim.V2NIMLocalConversationService.createConversation("${conversationId}");`;

    console.log('V2NIMLocalConversationService.createConversation 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
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
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLocalConversationService`}
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
          tooltip="会话的唯一标识符，可以通过右侧按钮随机生成"
          rules={[{ required: true, message: '请输入会话ID' }]}
        >
          <Input
            // style={{ width: 'calc(100% - 120px)' }}
            placeholder="请输入会话ID或点击右侧按钮生成"
          />
        </Form.Item>

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
            <strong>功能：</strong>创建本地会话，用于开始聊天对话
          </li>
          <li>
            <strong>参数：</strong>conversationId (会话ID字符串)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMConversation (创建的会话对象)
          </li>
          <li>
            <strong>用途：</strong>建立P2P或群聊会话，为发送消息做准备
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
          <li>会话ID需要使用 V2NIMConversationIdUtil 工具类生成</li>
          <li>P2P会话ID格式：p2p|账号ID，群聊会话ID格式：team|群组ID</li>
          <li>创建会话后才能发送消息到该会话</li>
          <li>可以点击"随机生成"按钮快速生成测试用的会话ID</li>
        </ul>
      </Card>
    </div>
  );
};

export default CreateConversationPage;
