import { Button, Card, Form, Space, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

// 持久化存储key
const storageKey = `V2NIMChatroomQueueService.queuePeek`;

const QueuePeekPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 表单提交: 触发 API 调用
  const handleQueuePeek = async () => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomQueueService.queuePeek execute');

    // 执行 API
    const [error, data] = await to(() => window.chatroomV2?.V2NIMChatroomQueueService.queuePeek());

    setLoading(false);

    if (error) {
      message.error(`查看队列头元素失败: ${error.toString()}`);
      console.error('查看队列头元素失败:', error.toString());
      setResult(null);
      return;
    }

    message.success('成功查看队列头元素');
    console.log('查看队列头元素成功, result:', data);
    setResult(data);
  };

  // 重置结果
  const handleReset = () => {
    setResult(null);
    message.success('已清空结果');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const callStatement = `await window.chatroomV2.V2NIMChatroomQueueService.queuePeek();`;

    console.log('V2NIMChatroomQueueService.queuePeek 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={handleQueuePeek}>
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/Dk5MjczOTQ#queuePeek"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              查看队列头元素
            </Button>
            <Button onClick={handleReset}>清空结果</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 返回结果展示 */}
      {result && (
        <Card title="队列头元素" style={{ marginTop: 16 }} size="small">
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}

      {/* 无数据提示 */}
      {!result && (
        <Card title="队列头元素" style={{ marginTop: 16 }} size="small">
          <p style={{ margin: 0, color: '#999', textAlign: 'center' }}>
            暂无数据，点击"查看队列头元素"按钮查询
          </p>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>查看队列的头元素
          </li>
          <li>
            <strong>参数：</strong>无
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;V2NIMChatroomQueueElement&gt; - 队列头元素
          </li>
          <li>
            <strong>回调：</strong>无
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
          <li>该接口只查看队列头元素，不会移除该元素</li>
          <li>如果需要取出并移除头元素，请使用 queuePoll 接口</li>
          <li>返回的元素包含 key 和 value 两个字段</li>
        </ul>
      </Card>
    </div>
  );
};

export default QueuePeekPage;
