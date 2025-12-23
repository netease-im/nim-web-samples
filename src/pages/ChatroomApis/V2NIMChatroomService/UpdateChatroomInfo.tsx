import { Button, Card, Form, Input, Space, Switch, message } from 'antd';
import { V2NIMChatroomUpdateParams } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomInfoService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface UpdateChatroomInfoFormValues {
  roomName?: string;
  announcement?: string;
  serverExtension?: string;
  notificationEnabled: boolean;
  notificationExtension?: string;
}

const defaultFormValues: UpdateChatroomInfoFormValues = {
  roomName: '',
  announcement: '',
  serverExtension: '',
  notificationEnabled: true,
  notificationExtension: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.updateChatroomInfo`;

const UpdateChatroomInfoPage = () => {
  const [form] = Form.useForm<UpdateChatroomInfoFormValues>();
  const [loading, setLoading] = useState(false);

  // 获取初始值
  const getInitialValues = (): UpdateChatroomInfoFormValues => {
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
  const handleUpdateChatroomInfo = async (values: UpdateChatroomInfoFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { roomName, announcement, serverExtension, notificationEnabled, notificationExtension } =
      values;

    // 至少需要设置一个字段
    if (!roomName?.trim() && !announcement?.trim() && !serverExtension?.trim()) {
      message.error('至少需要设置聊天室名称、公告或扩展字段中的一个');
      return;
    }

    setLoading(true);

    // 构建更新参数
    const updateParams: V2NIMChatroomUpdateParams = {
      notificationEnabled,
    };

    if (roomName?.trim()) {
      updateParams.roomName = roomName.trim();
    }

    if (announcement?.trim()) {
      updateParams.announcement = announcement.trim();
    }

    if (serverExtension?.trim()) {
      updateParams.serverExtension = serverExtension.trim();
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.updateChatroomInfo execute, params:',
      updateParams
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.updateChatroomInfo(updateParams)
    );

    setLoading(false);

    if (error) {
      message.error(`更新聊天室信息失败: ${error.toString()}`);
      console.error('更新聊天室信息失败:', error.toString());
      return;
    }

    message.success('更新聊天室信息成功');
    console.log('更新聊天室信息成功');

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
    const { roomName, announcement, serverExtension, notificationEnabled, notificationExtension } =
      values;

    // 构建参数对象
    const updateParams: V2NIMChatroomUpdateParams = {
      notificationEnabled,
    };

    if (roomName?.trim()) {
      updateParams.roomName = roomName.trim();
    }

    if (announcement?.trim()) {
      updateParams.announcement = announcement.trim();
    }

    if (serverExtension?.trim()) {
      updateParams.serverExtension = serverExtension.trim();
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.updateChatroomInfo(${JSON.stringify(updateParams, null, 2)});`;

    console.log('V2NIMChatroomService.updateChatroomInfo 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleUpdateChatroomInfo}
        initialValues={getInitialValues()}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#updateChatroomInfo"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item label="聊天室名称" name="roomName" tooltip="更新后的聊天室名称">
          <Input placeholder="请输入聊天室名称" />
        </Form.Item>

        <Form.Item label="聊天室公告" name="announcement" tooltip="更新后的聊天室公告">
          <TextArea rows={3} placeholder="请输入聊天室公告" />
        </Form.Item>

        <Form.Item label="扩展字段" name="serverExtension" tooltip="聊天室的服务端扩展字段">
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

        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              更新聊天室信息
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
            <strong>功能：</strong>更新聊天室信息
          </li>
          <li>
            <strong>参数：</strong>updateParams (更新参数对象)
          </li>
          <li>
            <strong>必填字段：</strong>roomName、announcement、serverExtension 至少填一个
          </li>
          <li>
            <strong>权限：</strong>仅聊天室创建者或管理员可调用
          </li>
          <li>
            <strong>回调：</strong>更新成功后触发 onChatroomInfoUpdated 事件
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
          <li>只有聊天室创建者或管理员具有更新聊天室信息的权限</li>
          <li>至少需要设置 roomName、announcement、serverExtension 中的一个</li>
          <li>更新成功后，聊天室内所有成员会收到 onChatroomInfoUpdated 回调</li>
          <li>如果开启通知，聊天室内成员还会收到类型为 ROOM_INFO_UPDATED 的通知消息</li>
        </ul>
      </Card>
    </div>
  );
};

export default UpdateChatroomInfoPage;
