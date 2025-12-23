import { Button, Card, Form, InputNumber, Space, message } from 'antd';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

interface QueueInitFormValues {
  size: number;
}

// 持久化存储key
const storageKey = `V2NIMChatroomQueueService.queueInit`;

const QueueInitPage = () => {
  const [form] = Form.useForm<QueueInitFormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  // 从 localStorage 加载表单数据
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.setFieldsValue(parsedData);
      } catch (error) {
        console.error('Failed to parse saved form data:', error);
      }
    }
  }, [form]);

  // 表单提交: 触发 API 调用
  const handleQueueInit = async (values: QueueInitFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    // 保存表单数据到 localStorage
    localStorage.setItem(storageKey, JSON.stringify(values));

    setLoading(true);

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomQueueService.queueInit execute with params:', values);

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomQueueService.queueInit(values.size)
    );

    setLoading(false);

    if (error) {
      message.error(`初始化队列失败: ${error.toString()}`);
      console.error('初始化队列失败:', error.toString());
      setResult(`初始化队列失败: ${error.toString()}`);
      return;
    }

    message.success('成功初始化队列');
    console.log('初始化队列成功');
    setResult(`成功初始化队列，长度上限: ${values.size}`);
  };

  // 重置结果
  const handleReset = () => {
    setResult('');
    message.success('已清空结果');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const callStatement = `await window.chatroomV2.V2NIMChatroomQueueService.queueInit(${values.size});`;

    console.log('V2NIMChatroomQueueService.queueInit 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleQueueInit}
        initialValues={{
          size: 100,
        }}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/Dk5MjczOTQ#queueInit"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="队列长度"
          name="size"
          rules={[
            { required: true, message: '请输入队列长度' },
            {
              type: 'number',
              min: 0,
              max: 1000,
              message: '队列长度限制范围: 0 ~ 1000',
            },
          ]}
          tooltip="初始化队列的长度，限制范围：0 ~ 1000"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={1000}
            placeholder="请输入队列长度 (0-1000)"
          />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              初始化队列
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
            <strong>功能：</strong>初始化聊天室队列
          </li>
          <li>
            <strong>参数：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>size (number): 初始化队列的长度，限制范围：0 ~ 1000</li>
            </ul>
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;void&gt;
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
          border: '2px solid #1890ff',
          backgroundColor: '#e6f7ff',
        }}
        size="small"
        styles={{
          header: {
            backgroundColor: '#bae7ff',
            color: '#0050b3',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#0050b3' }}>
          <li>需要先进入聊天室才能操作队列</li>
          <li>可以对现有的聊天室队列进行初始化，以修改现有队列的长度上限</li>
          <li>若当前队列已超过新的上限，元素虽不会减少，但无法再新增新元素</li>
          <li>队列长度必须在 0 ~ 1000 范围内</li>
        </ul>
      </Card>
    </div>
  );
};

export default QueueInitPage;
