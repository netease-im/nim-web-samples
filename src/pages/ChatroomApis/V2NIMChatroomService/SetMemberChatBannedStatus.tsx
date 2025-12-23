import { Button, Card, Form, Input, Radio, Space, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface SetMemberChatBannedStatusFormValues {
  accountId: string;
  chatBanned: boolean;
  notificationExtension?: string;
}

const defaultFormValues: SetMemberChatBannedStatusFormValues = {
  accountId: '',
  chatBanned: true,
  notificationExtension: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.setMemberChatBannedStatus`;

const SetMemberChatBannedStatusPage = () => {
  const [form] = Form.useForm<SetMemberChatBannedStatusFormValues>();
  const [loading, setLoading] = useState(false);

  // 获取初始值
  const getInitialValues = (): SetMemberChatBannedStatusFormValues => {
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
  const handleSetMemberChatBannedStatus = async (values: SetMemberChatBannedStatusFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { accountId, chatBanned, notificationExtension } = values;

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.setMemberChatBannedStatus execute, params:',
      accountId,
      chatBanned,
      notificationExtension
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.setMemberChatBannedStatus(
        accountId,
        chatBanned,
        notificationExtension?.trim() || ''
      )
    );

    setLoading(false);

    if (error) {
      message.error(`设置禁言状态失败: ${error.toString()}`);
      console.error('设置禁言状态失败:', error.toString());
      return;
    }

    message.success(chatBanned ? '已将成员设置为禁言' : '已解除成员禁言');
    console.log('设置禁言状态成功');

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
    const { accountId, chatBanned, notificationExtension } = values;

    const notificationExtensionStr = notificationExtension?.trim()
      ? `, "${notificationExtension.trim()}"`
      : ', ""';

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.setMemberChatBannedStatus("${accountId}", ${chatBanned}${notificationExtensionStr});`;

    console.log('V2NIMChatroomService.setMemberChatBannedStatus 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleSetMemberChatBannedStatus}
        initialValues={getInitialValues()}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#setMemberChatBannedStatus"
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
          label="禁言状态"
          name="chatBanned"
          tooltip="true：禁言；false：解除禁言"
          rules={[{ required: true, message: '请选择禁言状态' }]}
        >
          <Radio.Group>
            <Radio value={true}>设置为禁言</Radio>
            <Radio value={false}>解除禁言</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="通知扩展"
          name="notificationExtension"
          tooltip="本次操作生成的通知中的扩展字段"
        >
          <TextArea rows={2} placeholder="请输入通知扩展字段" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              设置禁言状态
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
            <strong>功能：</strong>设置聊天室成员禁言状态
          </li>
          <li>
            <strong>参数：</strong>accountId (用户账号), chatBanned (禁言状态),
            notificationExtension (通知扩展)
          </li>
          <li>
            <strong>必填字段：</strong>accountId, chatBanned
          </li>
          <li>
            <strong>禁言效果：</strong>用户无法在聊天室发送消息，但可以接收消息
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
            <strong>被禁言成员：</strong>收到禁言状态变更回调 <code>onSelfChatBannedUpdated</code>
          </li>
          <li style={{ marginTop: 8 }}>
            <strong>聊天室内所有成员：</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                收到成员信息变更回调 <code>onChatroomMemberInfoUpdated</code>
              </li>
              <li>
                禁言时收到通知消息类型 <code>MEMBER_CHAT_BANNED_ADDED(4)</code>
              </li>
              <li>
                解除禁言时收到通知消息类型 <code>MEMBER_CHAT_BANNED_REMOVED(5)</code>
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
          <li>被禁言的用户无法在聊天室发送消息，但可以接收消息</li>
          <li>禁言状态为永久禁言，除非主动调用接口解除</li>
        </ul>
      </Card>
    </div>
  );
};

export default SetMemberChatBannedStatusPage;
