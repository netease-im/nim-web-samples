import { Button, Card, Form, Input, InputNumber, Space, Switch, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface SetTempChatBannedByTagFormValues {
  targetTag: string;
  duration: number;
  notificationEnabled: boolean;
  notifyTargetTags?: string;
  notificationExtension?: string;
}

const defaultFormValues: SetTempChatBannedByTagFormValues = {
  targetTag: '',
  duration: 60,
  notificationEnabled: true,
  notifyTargetTags: '',
  notificationExtension: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.setTempChatBannedByTag`;

const SetTempChatBannedByTagPage = () => {
  const [form] = Form.useForm<SetTempChatBannedByTagFormValues>();
  const [loading, setLoading] = useState(false);

  // 获取初始值
  const getInitialValues = (): SetTempChatBannedByTagFormValues => {
    try {
      const cachedValues = localStorage.getItem(storageKey);
      if (cachedValues) {
        return JSON.parse(cachedValues);
      }
    } catch (error) {
      console.warn('加载缓存配置失败:', error);
    }
    return defaultFormValues;
  };

  // 表单提交: 触发 API 调用
  const handleSetTempChatBannedByTag = async (values: SetTempChatBannedByTagFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { targetTag, duration, notificationEnabled, notifyTargetTags, notificationExtension } =
      values;

    setLoading(true);

    // 构建参数对象
    const params: any = {
      targetTag: targetTag.trim(),
      duration,
      notificationEnabled,
    };

    if (notifyTargetTags?.trim()) {
      params.notifyTargetTags = notifyTargetTags.trim();
    }

    if (notificationExtension?.trim()) {
      params.notificationExtension = notificationExtension.trim();
    }

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.setTempChatBannedByTag execute, params:',
      params
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.setTempChatBannedByTag(params)
    );

    setLoading(false);

    if (error) {
      message.error(`设置标签禁言失败: ${error.toString()}`);
      console.error('设置标签禁言失败:', error.toString());
      return;
    }

    message.success(duration === 0 ? '已解除标签禁言' : `已设置标签禁言 ${duration} 秒`);
    console.log('设置标签禁言成功');

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
    const { targetTag, duration, notificationEnabled, notifyTargetTags, notificationExtension } =
      values;

    const params: any = {
      targetTag: targetTag.trim(),
      duration,
      notificationEnabled,
    };

    if (notifyTargetTags?.trim()) {
      params.notifyTargetTags = notifyTargetTags.trim();
    }

    if (notificationExtension?.trim()) {
      params.notificationExtension = notificationExtension.trim();
    }

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.setTempChatBannedByTag(${JSON.stringify(params, null, 2)});`;

    console.log('V2NIMChatroomService.setTempChatBannedByTag 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleSetTempChatBannedByTag}
        initialValues={getInitialValues()}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#setTempChatBannedByTag"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="被禁言标签"
          name="targetTag"
          tooltip="被禁言的标签，必填字段"
          rules={[{ required: true, message: '请输入被禁言的标签' }]}
        >
          <Input placeholder="请输入被禁言的标签" />
        </Form.Item>

        <Form.Item
          label="禁言时长"
          name="duration"
          tooltip="禁言时长（秒），单次最大 30 天。设置为 0 表示解除禁言"
          rules={[
            { required: true, message: '请输入禁言时长' },
            {
              type: 'number',
              min: 0,
              max: 2592000,
              message: '时长必须在 0-2592000 秒之间（0-30 天）',
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入时长（秒），0 表示解除禁言"
            min={0}
            max={2592000}
          />
        </Form.Item>

        <Form.Item
          label="是否发送通知"
          name="notificationEnabled"
          tooltip="操作后是否需要发送通知消息"
          valuePropName="checked"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          label="接收通知的目标"
          name="notifyTargetTags"
          tooltip='接收通知的目标表达式，例如：{tag: "xxx"}'
        >
          <Input placeholder='例如：{tag: "xxx"}' />
        </Form.Item>

        <Form.Item
          label="通知扩展"
          name="notificationExtension"
          tooltip="本次操作生成的通知中的扩展字段"
        >
          <TextArea rows={2} placeholder="请输入通知扩展字段" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              设置标签禁言
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
            <strong>功能：</strong>根据标签设置临时禁言
          </li>
          <li>
            <strong>参数：</strong>targetTag (被禁言标签), duration (禁言时长), notificationEnabled
            (是否发送通知), notifyTargetTags (接收通知的目标), notificationExtension (通知扩展)
          </li>
          <li>
            <strong>必填字段：</strong>targetTag, duration, notificationEnabled
          </li>
          <li>
            <strong>禁言时长：</strong>单位为秒，单次最大 30 天 (2592000 秒)
          </li>
          <li>
            <strong>解除禁言：</strong>将 duration 设置为 0 即可解除临时禁言
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
          <li>targetTag 不能为空，否则返回参数错误</li>
          <li>禁言时长单次最大 30 天（2592000 秒）</li>
          <li>设置 duration 为 0 可立即解除标签禁言</li>
          <li>被禁言标签的成员无法在聊天室发送消息，但可以接收消息</li>
        </ul>
      </Card>
    </div>
  );
};

export default SetTempChatBannedByTagPage;
