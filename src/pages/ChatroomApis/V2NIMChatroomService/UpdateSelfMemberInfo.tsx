import { Button, Card, Form, Input, Space, Switch, message } from 'antd';
import { V2NIMChatroomSelfMemberUpdateParams } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomMemberService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface UpdateSelfMemberInfoFormValues {
  roomNick?: string;
  roomAvatar?: string;
  serverExtension?: string;
  notificationEnabled: boolean;
  notificationExtension?: string;
  persistence: boolean;
}

const defaultFormValues: UpdateSelfMemberInfoFormValues = {
  roomNick: '',
  roomAvatar: '',
  serverExtension: '',
  notificationEnabled: true,
  notificationExtension: '',
  persistence: false,
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.updateSelfMemberInfo`;

const UpdateSelfMemberInfoPage = () => {
  const [form] = Form.useForm<UpdateSelfMemberInfoFormValues>();
  const [loading, setLoading] = useState(false);

  // 获取初始值
  const getInitialValues = (): UpdateSelfMemberInfoFormValues => {
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
  const handleUpdateSelfMemberInfo = async (values: UpdateSelfMemberInfoFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const {
      roomNick,
      roomAvatar,
      serverExtension,
      notificationEnabled,
      notificationExtension,
      persistence,
    } = values;

    // 至少需要设置一个字段
    if (!roomNick?.trim() && !roomAvatar?.trim() && !serverExtension?.trim()) {
      message.error('至少需要设置昵称、头像或扩展字段中的一个');
      return;
    }

    setLoading(true);

    // 构建更新参数
    const updateParams: V2NIMChatroomSelfMemberUpdateParams = {
      notificationEnabled,
      persistence,
    };

    if (roomNick?.trim()) {
      updateParams.roomNick = roomNick.trim();
    }

    if (roomAvatar?.trim()) {
      updateParams.roomAvatar = roomAvatar.trim();
    }

    if (serverExtension?.trim()) {
      updateParams.serverExtension = serverExtension.trim();
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.updateSelfMemberInfo execute, params:',
      updateParams
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.updateSelfMemberInfo(updateParams)
    );

    setLoading(false);

    if (error) {
      message.error(`更新本人成员信息失败: ${error.toString()}`);
      console.error('更新本人成员信息失败:', error.toString());
      return;
    }

    message.success('更新本人成员信息成功');
    console.log('更新本人成员信息成功');

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
    const {
      roomNick,
      roomAvatar,
      serverExtension,
      notificationEnabled,
      notificationExtension,
      persistence,
    } = values;

    // 构建参数对象
    const updateParams: V2NIMChatroomSelfMemberUpdateParams = {
      notificationEnabled,
      persistence,
    };

    if (roomNick?.trim()) {
      updateParams.roomNick = roomNick.trim();
    }

    if (roomAvatar?.trim()) {
      updateParams.roomAvatar = roomAvatar.trim();
    }

    if (serverExtension?.trim()) {
      updateParams.serverExtension = serverExtension.trim();
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.updateSelfMemberInfo(${JSON.stringify(updateParams, null, 2)});`;

    console.log('V2NIMChatroomService.updateSelfMemberInfo 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleUpdateSelfMemberInfo}
        initialValues={getInitialValues()}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#updateSelfMemberInfo"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item label="聊天室昵称" name="roomNick" tooltip="在聊天室中显示的昵称">
          <Input placeholder="请输入聊天室昵称" />
        </Form.Item>

        <Form.Item label="聊天室头像" name="roomAvatar" tooltip="在聊天室中显示的头像 URL">
          <Input placeholder="请输入聊天室头像 URL" />
        </Form.Item>

        <Form.Item label="扩展字段" name="serverExtension" tooltip="成员的服务端扩展字段">
          <TextArea rows={2} placeholder="请输入扩展字段" />
        </Form.Item>

        <Form.Item
          label="通知成员"
          name="notificationEnabled"
          valuePropName="checked"
          tooltip="是否通知聊天室内成员"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item
          label="通知扩展"
          name="notificationExtension"
          tooltip="本次操作生成的通知中的扩展字段"
        >
          <TextArea rows={2} placeholder="请输入通知扩展字段" />
        </Form.Item>

        <Form.Item
          label="持久化存储"
          name="persistence"
          valuePropName="checked"
          tooltip="更新信息是否持久化，只针对固定成员身份生效"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              更新本人成员信息
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
            <strong>功能：</strong>更新本人的聊天室成员信息
          </li>
          <li>
            <strong>参数：</strong>updateParams (本人成员信息更新参数)
          </li>
          <li>
            <strong>必填字段：</strong>roomNick、roomAvatar、serverExtension 至少填一个
          </li>
          <li>
            <strong>回调：</strong>更新成功后触发 onChatroomMemberInfoUpdated 事件
          </li>
          <li>
            <strong>持久化：</strong>persistence 仅对固定成员身份生效
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
          <li>至少需要设置 roomNick、roomAvatar、serverExtension 中的一个</li>
          <li>更新成功后，聊天室内所有成员会收到 onChatroomMemberInfoUpdated 回调</li>
          <li>如果开启通知，聊天室内成员还会收到类型为 MEMBER_INFO_UPDATED 的通知消息</li>
          <li>persistence 设置为 true 时，更新信息会持久化，但只对固定成员身份生效</li>
          <li>普通聊天室成员退出后再进入，非持久化的信息会丢失</li>
        </ul>
      </Card>
    </div>
  );
};

export default UpdateSelfMemberInfoPage;
