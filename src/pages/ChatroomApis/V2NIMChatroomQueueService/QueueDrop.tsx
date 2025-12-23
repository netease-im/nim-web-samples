import { Button, Card, Form, Space, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

// 持久化存储key
const storageKey = `V2NIMChatroomQueueService.queueDrop`;

const QueueDropPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  // 表单提交: 触发 API 调用
  const handleQueueDrop = async () => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomQueueService.queueDrop execute');

    // 执行 API
    const [error] = await to(() => window.chatroomV2?.V2NIMChatroomQueueService.queueDrop());

    setLoading(false);

    if (error) {
      message.error(`清空队列失败: ${error.toString()}`);
      console.error('清空队列失败:', error.toString());
      setResult(`清空队列失败: ${error.toString()}`);
      return;
    }

    message.success('成功清空队列');
    console.log('清空队列成功');
    setResult('清空队列成功');
  };

  // 重置结果
  const handleReset = () => {
    setResult('');
    message.success('已清空结果');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const callStatement = `await window.chatroomV2.V2NIMChatroomQueueService.queueDrop();`;

    console.log('V2NIMChatroomQueueService.queueDrop 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={handleQueueDrop}>
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/Dk5MjczOTQ#queueDrop"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading} danger>
              清空队列
            </Button>
            <Button onClick={handleReset}>清空结果</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 返回结果展示 */}
      {result && (
        <Card title="执行结果" style={{ marginTop: 16 }} size="small">
          <p style={{ margin: 0 }}>{result}</p>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>清空聊天室队列中的所有元素
          </li>
          <li>
            <strong>参数：</strong>无
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;void&gt;
          </li>
          <li>
            <strong>回调：</strong>清空成功后，会触发 onChatroomQueueDropped 回调
          </li>
        </ul>
      </Card>

      {/* 重要提醒 */}
      <Card
        title="⚠️ 重要提醒"
        style={{
          marginTop: 16,
          border: '2px solid #ff4d4f',
          backgroundColor: '#fff1f0',
        }}
        size="small"
        styles={{
          header: {
            backgroundColor: '#ffccc7',
            color: '#cf1322',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#cf1322' }}>
          <li>
            <strong>仅聊天室创建者或管理员</strong>才能进行清空操作
          </li>
          <li>此操作会清空队列中的所有元素，请谨慎使用</li>
          <li>清空成功后会触发 onChatroomQueueDropped 回调通知</li>
        </ul>
      </Card>
    </div>
  );
};

export default QueueDropPage;
