import { Button, Card, Form, Input, Space, Switch, message } from 'antd';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

interface QueueElement {
  key: string;
  value: string;
}

interface QueueBatchUpdateFormValues {
  elementsJson: string;
  notificationEnabled: boolean;
  notificationExtension?: string;
}

const defaultFormValues: QueueBatchUpdateFormValues = {
  elementsJson: JSON.stringify([{ key: 'key1', value: 'value1' }], null, 2),
  notificationEnabled: true,
  notificationExtension: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomQueueService.queueBatchUpdate`;

const QueueBatchUpdatePage = () => {
  const [form] = Form.useForm<QueueBatchUpdateFormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);

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
  const handleQueueBatchUpdate = async (values: QueueBatchUpdateFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    // 解析 JSON
    let parsedElements: QueueElement[];
    try {
      parsedElements = JSON.parse(values.elementsJson);
    } catch (e) {
      message.error('JSON 格式错误，请检查输入');
      return;
    }

    // 验证数据格式
    if (!Array.isArray(parsedElements)) {
      message.error('队列元素必须是数组格式');
      return;
    }

    // 过滤掉空的元素
    const validElements = parsedElements.filter(item => item.key?.trim() && item.value?.trim());

    if (validElements.length === 0) {
      message.error('请至少添加一个有效的队列元素');
      return;
    }

    if (validElements.length > 100) {
      message.error('队列元素数量不能超过 100 个');
      return;
    }

    setLoading(true);

    // 构建请求参数
    const elements = validElements.map(item => ({
      key: item.key.trim(),
      value: item.value.trim(),
    }));

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomQueueService.queueBatchUpdate execute, params:', {
      elements,
      notificationEnabled: values.notificationEnabled,
      notificationExtension: values.notificationExtension,
    });

    // 执行 API
    const [error, invalidKeys] = await to(() =>
      window.chatroomV2?.V2NIMChatroomQueueService.queueBatchUpdate(
        elements,
        values.notificationEnabled,
        values.notificationExtension?.trim() || undefined
      )
    );

    setLoading(false);

    if (error) {
      message.error(`批量更新队列元素失败: ${error.toString()}`);
      console.error('批量更新队列元素失败:', error.toString());
      setResult(null);
      return;
    }

    message.success('成功批量更新队列元素');
    console.log('批量更新队列元素成功, 不存在的元素 key 列表:', invalidKeys);
    setResult(invalidKeys || []);

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

    let parsedElements: QueueElement[];
    try {
      parsedElements = JSON.parse(values.elementsJson);
    } catch (e) {
      message.error('JSON 格式错误，无法输出');
      return;
    }

    const validElements = parsedElements.filter(item => item.key?.trim() && item.value?.trim());

    const elements = validElements.map(item => ({
      key: item.key.trim(),
      value: item.value.trim(),
    }));

    const callStatement = `await window.chatroomV2.V2NIMChatroomQueueService.queueBatchUpdate(
  ${JSON.stringify(elements, null, 2)},
  ${values.notificationEnabled},
  ${values.notificationExtension?.trim() ? `"${values.notificationExtension.trim()}"` : 'undefined'}
);`;

    console.log('V2NIMChatroomQueueService.queueBatchUpdate 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleQueueBatchUpdate}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/Dk5MjczOTQ#queueBatchUpdate"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        {/* 队列元素 JSON 输入 */}
        <Form.Item
          label="队列元素"
          name="elementsJson"
          rules={[{ required: true, message: '请输入队列元素 JSON' }]}
          tooltip='输入 JSON 数组格式，如: [{"key": "key1", "value": "value1"}]'
        >
          <Input.TextArea
            placeholder='[{"key": "key1", "value": "value1"}, {"key": "key2", "value": "value2"}]'
            rows={8}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          label="发送广播通知"
          name="notificationEnabled"
          tooltip="是否发送广播通知，默认为 true"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="通知扩展字段"
          name="notificationExtension"
          tooltip="本次操作生成的通知扩展字段，字段长度限制为 2048 字节"
        >
          <Input.TextArea rows={2} placeholder="请输入通知扩展字段（可选）" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              批量更新队列元素
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 返回结果展示 */}
      {result !== null && (
        <Card title="不存在的元素 key 列表" style={{ marginTop: 16 }} size="small">
          {result.length > 0 ? (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p style={{ margin: 0, color: '#52c41a' }}>✓ 所有元素均已成功更新，没有不存在的 key</p>
          )}
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>批量更新队列中已存在的元素
          </li>
          <li>
            <strong>参数：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                elements (V2NIMChatroomQueueElement[]): 需要更新的队列元素列表，数量限制 1-100
              </li>
              <li>notificationEnabled (boolean): 是否发送广播通知，默认 true</li>
              <li>notificationExtension (string): 通知扩展字段，最大 2048 字节</li>
            </ul>
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;string[]&gt; - 不存在的元素 key 列表
          </li>
          <li>
            <strong>回调：</strong>批量更新成功后，会触发 onChatroomQueueBatchUpdated 回调
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
          <li>此接口只能更新已存在的元素，不存在的 key 会被返回在结果中</li>
          <li>元素数量限制：1-100 个</li>
          <li>key 字段限制 128 字节，value 字段限制 4096 字节</li>
          <li>如果需要新增元素，请使用 queueOffer 接口</li>
        </ul>
      </Card>
    </div>
  );
};

export default QueueBatchUpdatePage;
