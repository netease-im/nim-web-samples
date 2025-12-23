import { Button, Card, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface KickMemberFormValues {
  accountId: string;
  notificationExtension?: string;
}

const defaultFormValues: KickMemberFormValues = {
  accountId: '',
  notificationExtension: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.kickMember`;

const KickMemberPage = () => {
  const [form] = Form.useForm<KickMemberFormValues>();
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
  const handleKickMember = async (values: KickMemberFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { accountId, notificationExtension } = values;

    setLoading(true);

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.kickMember execute, params:',
      accountId,
      notificationExtension
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.kickMember(
        accountId,
        notificationExtension?.trim() || undefined
      )
    );

    setLoading(false);

    if (error) {
      message.error(`踢出成员失败: ${error.toString()}`);
      console.error('踢出成员失败:', error.toString());
      return;
    }

    message.success(`成员 ${accountId} 已被踢出聊天室`);
    console.log('踢出成员成功');

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
    const { accountId, notificationExtension } = values;

    const notificationExtensionStr = notificationExtension?.trim()
      ? `, "${notificationExtension.trim()}"`
      : '';

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.kickMember("${accountId}"${notificationExtensionStr});`;

    console.log('V2NIMChatroomService.kickMember 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleKickMember}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#kickMember"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="成员账号"
          name="accountId"
          tooltip="要踢出的成员账号，不允许操作虚构用户和匿名游客"
          rules={[{ required: true, message: '请输入要踢出的成员账号' }]}
        >
          <Input placeholder="请输入要踢出的成员账号" />
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
              踢出成员
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
            <strong>功能：</strong>将指定成员踢出聊天室
          </li>
          <li>
            <strong>参数：</strong>accountId (成员账号), notificationExtension (通知扩展)
          </li>
          <li>
            <strong>必填字段：</strong>accountId
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
            <strong>被踢成员：</strong>收到 <code>onChatroomKicked</code> 和{' '}
            <code>onChatroomExited</code> 回调
          </li>
          <li style={{ marginTop: 8 }}>
            <strong>聊天室内其他成员：</strong>收到 <code>onChatroomMemberExit</code> 回调和类型为{' '}
            <code>MEMBER_KICKED</code> 的通知消息
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
          <li>仅聊天室创建者和管理员有权限调用此接口</li>
          <li>如果被踢方为管理员，则仅聊天室创建者有权限操作</li>
          <li>不允许操作虚构用户和匿名游客</li>
          <li>被踢成员会立即退出聊天室，可以重新进入</li>
        </ul>
      </Card>
    </div>
  );
};

export default KickMemberPage;
