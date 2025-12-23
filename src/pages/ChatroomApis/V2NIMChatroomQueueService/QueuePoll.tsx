import { Button, Card, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

interface QueuePollFormValues {
  elementKey?: string;
}

const defaultFormValues: QueuePollFormValues = {
  elementKey: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomQueueService.queuePoll`;

const QueuePollPage = () => {
  const [form] = Form.useForm<QueuePollFormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 从 localStorage 加载初始值
  useEffect(() => {
    try {
      const cachedValues = localStorage.getItem(storageKey);
      if (cachedValues) {
        const values = JSON.parse(cachedValues);
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue(defaultFormValues);
      }
    } catch (error) {
      console.warn('加载缓存配置失败:', error);
      form.setFieldsValue(defaultFormValues);
    }
  }, [form]);

  // 表单提交: 触发 API 调用
  const handleQueuePoll = async (values: QueuePollFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { elementKey } = values;

    setLoading(true);

    // 构建请求参数
    const key = elementKey?.trim() || undefined;

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomQueueService.queuePoll execute, params:', key);

    // 执行 API
    const [error, data] = await to(() =>
      window.chatroomV2?.V2NIMChatroomQueueService.queuePoll(key)
    );

    setLoading(false);

    if (error) {
      message.error(`取出队列元素失败: ${error.toString()}`);
      console.error('取出队列元素失败:', error.toString());
      setResult(null);
      return;
    }

    message.success('成功取出队列元素');
    console.log('取出队列元素成功, result:', data);
    setResult(data);

    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    form.setFieldsValue(defaultFormValues);
    setResult(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { elementKey } = values;
    const key = elementKey?.trim() || undefined;

    const callStatement = key
      ? `await window.chatroomV2.V2NIMChatroomQueueService.queuePoll("${key}");`
      : `await window.chatroomV2.V2NIMChatroomQueueService.queuePoll();`;

    console.log('V2NIMChatroomQueueService.queuePoll 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={handleQueuePoll}>
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/Dk5MjczOTQ#queuePoll"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="元素键"
          name="elementKey"
          tooltip="若为空，则表示取出队列的头元素；若不为空，则表示取出指定的队列元素"
        >
          <Input placeholder="留空则取出队列头元素" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              取出队列元素
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 返回结果展示 */}
      {result && (
        <Card title="返回结果" style={{ marginTop: 16 }} size="small">
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>在队列中取出指定元素
          </li>
          <li>
            <strong>参数：</strong>elementKey (元素键，可选)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;V2NIMChatroomQueueElement&gt; - 被取出的队列元素
          </li>
          <li>
            <strong>回调：</strong>操作成功后会触发 onChatroomQueuePolled 回调
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
          <li>需要先进入聊天室才能操作队列</li>
          <li>仅聊天室创建者或管理员才能进行取出（移除）操作</li>
          <li>若不指定 elementKey，则取出队列的头元素</li>
          <li>若指定 elementKey，则取出该指定的队列元素</li>
          <li>取出后元素会从队列中移除</li>
        </ul>
      </Card>
    </div>
  );
};

export default QueuePollPage;
