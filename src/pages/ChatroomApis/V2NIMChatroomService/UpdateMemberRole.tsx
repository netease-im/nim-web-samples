import { Button, Card, Form, Input, Select, Space, message } from 'antd';
import { V2NIMChatroomConst } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK';
import { V2NIMChatroomMemberRoleUpdateParams } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomMemberService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface UpdateMemberRoleFormValues {
  accountId: string;
  memberRole: V2NIMChatroomConst.V2NIMChatroomMemberRole;
  memberLevel?: number;
  notificationExtension?: string;
}

const defaultFormValues: UpdateMemberRoleFormValues = {
  accountId: '',
  memberRole: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_NORMAL,
  memberLevel: 0,
  notificationExtension: '',
};

// 成员角色选项 (排除不支持设置的角色)
const memberRoleOptions = [
  {
    label: '普通成员',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_NORMAL,
  },
  {
    label: '管理员',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_MANAGER,
  },
  {
    label: '普通游客',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_NORMAL_GUEST,
  },
];

// 持久化存储key
const storageKey = `V2NIMChatroomService.updateMemberRole`;

const UpdateMemberRolePage = () => {
  const [form] = Form.useForm<UpdateMemberRoleFormValues>();
  const [loading, setLoading] = useState(false);

  // 获取初始值
  const getInitialValues = (): UpdateMemberRoleFormValues => {
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
  const handleUpdateMemberRole = async (values: UpdateMemberRoleFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { accountId, memberRole, memberLevel, notificationExtension } = values;

    setLoading(true);

    // 构建更新参数
    const updateParams: V2NIMChatroomMemberRoleUpdateParams = {
      memberRole,
    };

    if (typeof memberLevel === 'number' && memberLevel > 0) {
      updateParams.memberLevel = memberLevel;
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.updateMemberRole execute, params:',
      accountId,
      updateParams
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.updateMemberRole(accountId, updateParams)
    );

    setLoading(false);

    if (error) {
      message.error(`更新成员角色失败: ${error.toString()}`);
      console.error('更新成员角色失败:', error.toString());
      return;
    }

    message.success('更新成员角色成功');
    console.log('更新成员角色成功');

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
    const { accountId, memberRole, memberLevel, notificationExtension } = values;

    // 构建参数对象
    const updateParams: V2NIMChatroomMemberRoleUpdateParams = {
      memberRole,
    };

    if (typeof memberLevel === 'number' && memberLevel > 0) {
      updateParams.memberLevel = memberLevel;
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.updateMemberRole("${accountId}", ${JSON.stringify(updateParams, null, 2)});`;

    console.log('V2NIMChatroomService.updateMemberRole 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleUpdateMemberRole}
        initialValues={getInitialValues()}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#updateMemberRole"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="用户账号"
          name="accountId"
          tooltip="被操作的聊天室用户账号 ID"
          rules={[{ required: true, message: '请输入用户账号' }]}
        >
          <Input placeholder="请输入用户账号 ID" />
        </Form.Item>

        <Form.Item
          label="成员角色"
          name="memberRole"
          tooltip="目标成员角色，不支持设置为创建者、匿名游客、虚构用户"
          rules={[{ required: true, message: '请选择成员角色' }]}
        >
          <Select placeholder="请选择成员角色">
            {memberRoleOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="成员等级" name="memberLevel" tooltip="成员等级，可选参数">
          <Input type="number" placeholder="请输入成员等级，如：1" />
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
              更新成员角色
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
            <strong>功能：</strong>更新聊天室成员角色类型
          </li>
          <li>
            <strong>参数：</strong>accountId (用户账号), updateParams (成员角色更新参数)
          </li>
          <li>
            <strong>必填字段：</strong>accountId, memberRole
          </li>
          <li>
            <strong>回调：</strong>更新成功后触发 onChatroomMemberRoleUpdated 事件
          </li>
          <li>
            <strong>权限：</strong>仅聊天室创建者和管理员可调用
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
          <li>
            如果变更为管理员、或将管理员变更为其他角色，则仅允许聊天室创建者操作，否则返回错误码
            109427
          </li>
          <li>不支持设置为创建者、匿名游客、虚构用户角色</li>
          <li>不允许操作虚构用户和匿名游客</li>
          <li>更新成功后，聊天室内所有成员会收到 onChatroomMemberRoleUpdated 回调</li>
          <li>同时会收到类型为 ROLE_UPDATE 的通知消息</li>
        </ul>
      </Card>
    </div>
  );
};

export default UpdateMemberRolePage;
