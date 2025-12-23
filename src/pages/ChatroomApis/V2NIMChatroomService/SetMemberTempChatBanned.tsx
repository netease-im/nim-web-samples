import { Button, Card, Form, Input, InputNumber, Space, Switch, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface SetMemberTempChatBannedFormValues {
  accountId: string;
  tempChatBannedDuration: number;
  notificationEnabled: boolean;
  notificationExtension?: string;
}

const defaultFormValues: SetMemberTempChatBannedFormValues = {
  accountId: '',
  tempChatBannedDuration: 60,
  notificationEnabled: true,
  notificationExtension: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.setMemberTempChatBanned`;

const SetMemberTempChatBannedPage = () => {
  const [form] = Form.useForm<SetMemberTempChatBannedFormValues>();
  const [loading, setLoading] = useState(false);

  // 获取初始值
  const getInitialValues = (): SetMemberTempChatBannedFormValues => {
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
  const handleSetMemberTempChatBanned = async (values: SetMemberTempChatBannedFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { accountId, tempChatBannedDuration, notificationEnabled, notificationExtension } =
      values;

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.setMemberTempChatBanned execute, params:',
      accountId,
      tempChatBannedDuration,
      notificationEnabled,
      notificationExtension
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.setMemberTempChatBanned(
        accountId,
        tempChatBannedDuration,
        notificationEnabled,
        notificationExtension?.trim() || undefined
      )
    );

    setLoading(false);

    if (error) {
      message.error(`设置临时禁言失败: ${error.toString()}`);
      console.error('设置临时禁言失败:', error.toString());
      return;
    }

    message.success(
      tempChatBannedDuration === 0
        ? '已解除临时禁言'
        : `已设置临时禁言 ${tempChatBannedDuration} 秒`
    );
    console.log('设置临时禁言成功');

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
    const { accountId, tempChatBannedDuration, notificationEnabled, notificationExtension } =
      values;

    const notificationExtensionStr = notificationExtension?.trim()
      ? `, "${notificationExtension.trim()}"`
      : '';

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.setMemberTempChatBanned("${accountId}", ${tempChatBannedDuration}, ${notificationEnabled}${notificationExtensionStr});`;

    console.log('V2NIMChatroomService.setMemberTempChatBanned 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleSetMemberTempChatBanned}
        initialValues={getInitialValues()}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#setMemberTempChatBanned"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="用户账号"
          name="accountId"
          tooltip="被操作的聊天室用户账号 ID，不允许传入虚构用户和匿名游客"
          rules={[{ required: true, message: '请输入用户账号' }]}
        >
          <Input placeholder="请输入用户账号 ID" />
        </Form.Item>

        <Form.Item
          label="临时禁言时长"
          name="tempChatBannedDuration"
          tooltip="临时禁言时长（秒），不可超过 30 天。设置为 0 表示解除临时禁言"
          rules={[
            { required: true, message: '请输入临时禁言时长' },
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
          label="通知扩展"
          name="notificationExtension"
          tooltip="本次操作生成的通知中的扩展字段"
        >
          <TextArea rows={2} placeholder="请输入通知扩展字段" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              设置临时禁言
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
            <strong>功能：</strong>设置聊天室成员临时禁言状态
          </li>
          <li>
            <strong>参数：</strong>accountId (用户账号), tempChatBannedDuration (临时禁言时长),
            notificationEnabled (是否发送通知), notificationExtension (通知扩展)
          </li>
          <li>
            <strong>必填字段：</strong>accountId, tempChatBannedDuration, notificationEnabled
          </li>
          <li>
            <strong>临时禁言时长：</strong>单位为秒，不可超过 30 天 (2592000 秒)
          </li>
          <li>
            <strong>解除禁言：</strong>将 tempChatBannedDuration 设置为 0 即可解除临时禁言
          </li>
          <li>
            <strong>权限：</strong>仅聊天室创建者和管理员可调用
          </li>
        </ul>
      </Card>

      {/* 回调说明 */}
      <Card title="回调说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>被禁言成员：</strong>收到临时禁言状态变更回调{' '}
            <code>onSelfTempChatBannedUpdated</code>
          </li>
          <li style={{ marginTop: 8 }}>
            <strong>聊天室内所有成员：</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                收到成员信息变更回调 <code>onChatroomMemberInfoUpdated</code>
              </li>
              <li>
                设置临时禁言时（时长不为 0）收到通知消息类型{' '}
                <code>MEMBER_TEMP_CHAT_BANNED_ADDED(8)</code>
              </li>
              <li>
                解除临时禁言时（时长为 0）收到通知消息类型{' '}
                <code>MEMBER_TEMP_CHAT_BANNED_REMOVED(9)</code>
              </li>
            </ul>
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
          <li>仅允许聊天室创建者和管理员调用该接口，否则返回错误码 109432</li>
          <li>如果被操作方为管理员，则仅允许聊天室创建者操作，否则返回错误码 109427</li>
          <li>不允许操作虚构用户和匿名游客</li>
          <li>临时禁言时长不可超过 30 天（2592000 秒）</li>
          <li>被临时禁言的用户无法在聊天室发送消息，但可以接收消息</li>
          <li>临时禁言结束后，用户会自动恢复发送消息权限</li>
          <li>设置 tempChatBannedDuration 为 0 可立即解除临时禁言</li>
        </ul>
      </Card>
    </div>
  );
};

export default SetMemberTempChatBannedPage;
