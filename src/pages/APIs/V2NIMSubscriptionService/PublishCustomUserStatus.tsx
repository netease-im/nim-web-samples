import { Button, Card, Form, Input, InputNumber, Space, Switch, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface PublishCustomUserStatusFormValues {
  statusType: number;
  duration: number;
  extension: string;
  onlineOnly: boolean;
  multiSync: boolean;
}

const defaultPublishCustomUserStatusFormValues: PublishCustomUserStatusFormValues = {
  statusType: 10001,
  duration: 3000,
  extension: '{"test": 1}',
  onlineOnly: true,
  multiSync: true,
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMSubscriptionService.publishCustomUserStatus`;

const PublishCustomUserStatusPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): PublishCustomUserStatusFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultPublishCustomUserStatusFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultPublishCustomUserStatusFormValues;
  };

  const initialValues = getInitialValues();

  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 表单提交: 触发 API 调用
  const handlePublishCustomUserStatus = async (values: PublishCustomUserStatusFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { statusType, duration, extension, onlineOnly, multiSync } = values;

    const params = {
      statusType,
      duration,
      extension,
      onlineOnly,
      multiSync,
    };

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMSubscriptionService.publishCustomUserStatus execute, params:', params);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMSubscriptionService.publishCustomUserStatus(params)
    );
    if (error) {
      message.error(`发布用户自定义状态失败: ${error.toString()}`);
      console.error('发布用户自定义状态失败:', error.toString());
    } else {
      message.success('发布用户自定义状态成功');
      console.log('发布用户自定义状态成功, 结果:', result);
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
    form.setFieldsValue(defaultPublishCustomUserStatusFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { statusType, duration, extension, onlineOnly, multiSync } = values;

    const params = {
      statusType,
      duration,
      extension,
      onlineOnly,
      multiSync,
    };

    const callStatement = `await window.nim.V2NIMSubscriptionService.publishCustomUserStatus(${JSON.stringify(params, null, 2)});`;

    console.log('V2NIMSubscriptionService.publishCustomUserStatus 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handlePublishCustomUserStatus}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMSubscriptionService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="状态类型"
          name="statusType"
          tooltip="自定义状态类型，建议使用大于10000的数值"
          rules={[
            { required: true, message: '请输入状态类型' },
            { type: 'number', min: 1, message: '状态类型必须是正整数' },
          ]}
        >
          <InputNumber placeholder="请输入状态类型" min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="持续时间"
          name="duration"
          tooltip="状态的持续时间，单位为秒，最大值为 2592000 秒（30天）"
          rules={[
            { required: true, message: '请输入持续时间' },
            { type: 'number', min: 60, max: 2592000, message: '持续时间必须在 60-2592000 秒之间' },
          ]}
        >
          <InputNumber
            placeholder="请输入持续时间（秒）"
            min={60}
            max={2592000}
            style={{ width: '100%' }}
            addonAfter="秒"
          />
        </Form.Item>

        <Form.Item
          label="扩展信息"
          name="extension"
          tooltip="自定义状态的扩展信息，可以是任意字符串"
        >
          <Input.TextArea placeholder="请输入扩展信息" rows={3} maxLength={1024} showCount />
        </Form.Item>

        <Form.Item
          label="仅在线时有效"
          name="onlineOnly"
          tooltip="是否仅在在线时有效，如果为 true，离线后状态会被清除"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="多端同步"
          name="multiSync"
          tooltip="是否进行多端同步，如果为 true，会同步到其他登录设备"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              发布自定义状态
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
            <strong>功能：</strong>发布用户自定义状态
          </li>
          <li>
            <strong>参数 params：</strong>
            <ul style={{ marginTop: 4, marginBottom: 0 }}>
              <li>params.statusType: 自定义状态类型（建议大于10000）</li>
              <li>params.duration: 状态持续时间（秒），最大30天</li>
              <li>params.extension: 扩展信息字符串</li>
              <li>params.onlineOnly: 是否仅在线时有效</li>
              <li>params.multiSync: 是否多端同步</li>
            </ul>
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;void&gt;
          </li>
          <li>
            <strong>用途：</strong>发布自定义状态供其他用户订阅和监听
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
          <li>状态类型建议使用大于 10000 的数值，避免与系统状态冲突</li>
        </ul>
      </Card>
    </div>
  );
};

export default PublishCustomUserStatusPage;
