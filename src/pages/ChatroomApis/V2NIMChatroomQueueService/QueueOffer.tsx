import { Button, Card, Form, Input, Space, Switch, message } from 'antd';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

interface QueueOfferFormValues {
  elementKey: string;
  elementValue: string;
  transient?: boolean;
  elementOwnerAccountId?: string;
}

const defaultFormValues: QueueOfferFormValues = {
  elementKey: '',
  elementValue: '',
  transient: false,
  elementOwnerAccountId: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomQueueService.queueOffer`;

const QueueOfferPage = () => {
  const [form] = Form.useForm<QueueOfferFormValues>();
  const [loading, setLoading] = useState(false);

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
  const handleQueueOffer = async (values: QueueOfferFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { elementKey, elementValue, transient, elementOwnerAccountId } = values;

    setLoading(true);

    // 构建请求参数
    const params: any = {
      elementKey: elementKey.trim(),
      elementValue: elementValue.trim(),
    };

    // 添加可选参数
    if (typeof transient === 'boolean') {
      params.transient = transient;
    }

    if (elementOwnerAccountId?.trim()) {
      params.elementOwnerAccountId = elementOwnerAccountId.trim();
    }

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomQueueService.queueOffer execute, params:', params);

    // 执行 API
    const [error] = await to(() => window.chatroomV2?.V2NIMChatroomQueueService.queueOffer(params));

    setLoading(false);

    if (error) {
      message.error(`新增/更新队列元素失败: ${error.toString()}`);
      console.error('新增/更新队列元素失败:', error.toString());
      return;
    }

    message.success('成功新增/更新队列元素');
    console.log('新增/更新队列元素成功');

    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    form.setFieldsValue(defaultFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { elementKey, elementValue, transient, elementOwnerAccountId } = values;

    const params: any = {
      elementKey: elementKey.trim(),
      elementValue: elementValue.trim(),
    };

    if (typeof transient === 'boolean') {
      params.transient = transient;
    }

    if (elementOwnerAccountId?.trim()) {
      params.elementOwnerAccountId = elementOwnerAccountId.trim();
    }

    const callStatement = `await window.chatroomV2.V2NIMChatroomQueueService.queueOffer(${JSON.stringify(params, null, 2)});`;

    console.log('V2NIMChatroomQueueService.queueOffer 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleQueueOffer}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/Dk5MjczOTQ#queueOffer"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="元素键"
          name="elementKey"
          tooltip="队列元素的唯一标识键"
          rules={[{ required: true, message: '请输入元素键' }]}
        >
          <Input placeholder="请输入元素键" />
        </Form.Item>

        <Form.Item
          label="元素值"
          name="elementValue"
          tooltip="队列元素的值"
          rules={[{ required: true, message: '请输入元素值' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入元素值" />
        </Form.Item>

        <Form.Item
          label="瞬态元素"
          name="transient"
          tooltip="true: 瞬态元素，成员退出或掉线时自动删除；false: 持久元素，会被保留"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="元素所有者"
          name="elementOwnerAccountId"
          tooltip="元素所属账号，默认为当前操作者。管理员可指定其他合法账号"
        >
          <Input placeholder="请输入元素所有者账号 ID（可选）" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              新增/更新队列元素
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>在队列中新增或更新元素
          </li>
          <li>
            <strong>参数：</strong>elementKey (元素键), elementValue (元素值), transient (是否瞬态),
            elementOwnerAccountId (元素所有者)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;void&gt;
          </li>
          <li>
            <strong>回调：</strong>操作成功后会触发 onChatroomQueueOffered 回调
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
          <li>瞬态元素：当成员退出或掉线时会自动删除</li>
          <li>持久元素：即使成员退出也会保留在队列中</li>
          <li>管理员可以指定元素所有者为其他合法账号</li>
          <li>如果 key 已存在则更新其 value，不存在则新增</li>
        </ul>
      </Card>
    </div>
  );
};

export default QueueOfferPage;
