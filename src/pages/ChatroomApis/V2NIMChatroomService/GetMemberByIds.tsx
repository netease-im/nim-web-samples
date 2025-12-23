import { Button, Card, Form, Input, Space, message } from 'antd';
import type { V2NIMChatroomMember } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomMemberService';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

interface GetMemberByIdsFormValues {
  accountIds: string;
}

const defaultFormValues: GetMemberByIdsFormValues = {
  accountIds: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.getMemberByIds`;

const GetMemberByIdsPage = () => {
  const [form] = Form.useForm<GetMemberByIdsFormValues>();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<V2NIMChatroomMember[]>([]);

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
  const handleGetMembers = async (values: GetMemberByIdsFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    // 解析账号ID列表
    const accountIdsText = values.accountIds.trim();
    if (!accountIdsText) {
      message.error('请输入账号ID');
      return;
    }

    // 支持多种分隔符: 逗号、分号、空格、换行
    const accountIds = accountIdsText
      .split(/[,;，；\s\n]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (accountIds.length === 0) {
      message.error('请输入至少一个账号ID');
      return;
    }

    if (accountIds.length > 200) {
      message.error('单次查询数量不能超过 200 个账号');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomService.getMemberByIds execute, params:', accountIds);

    // 执行 API
    const [error, result] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.getMemberByIds(accountIds)
    );

    setLoading(false);

    if (error) {
      message.error(`获取成员信息失败: ${error.toString()}`);
      console.error('获取成员信息失败:', error.toString());
      return;
    }

    if (!result) {
      message.error('获取成员信息失败, 没有返回值');
      console.error('获取成员信息失败, 没有返回值');
      return;
    }

    setMembers(result);
    message.success(`获取到 ${result.length} 个成员信息`);
    console.log('获取成员信息成功, 结果:', result);

    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    form.setFieldsValue(defaultFormValues);
    setMembers([]);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const accountIdsText = values.accountIds.trim();

    if (!accountIdsText) {
      message.warning('请先输入账号ID');
      return;
    }

    const accountIds = accountIdsText
      .split(/[,;，；\s\n]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);

    const callStatement = `const members = await window.chatroomV2.V2NIMChatroomService.getMemberByIds(${JSON.stringify(accountIds)});`;

    console.log('V2NIMChatroomService.getMemberByIds 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleGetMembers}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#getMemberByIds"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="账号ID列表"
          name="accountIds"
          tooltip="要查询的账号ID列表，支持多种分隔符(逗号、分号、空格、换行)，单次查询上限200个"
          rules={[{ required: true, message: '请输入账号ID列表' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请输入账号ID，支持多种分隔符&#10;例如: user1, user2, user3&#10;或: user1;user2;user3&#10;或: user1 user2 user3&#10;或每行一个ID"
          />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              获取成员信息
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 查询结果 */}
      {members.length > 0 && (
        <Card
          title={`查询结果 (共 ${members.length} 个成员)`}
          style={{ marginTop: 16 }}
          size="small"
        >
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: 12,
              borderRadius: 4,
              maxHeight: 400,
              overflow: 'auto',
              fontFamily: 'monospace',
            }}
          >
            {JSON.stringify(members, null, 2)}
          </pre>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>批量获取指定账号的聊天室成员信息
          </li>
          <li>
            <strong>参数：</strong>accountIds (账号ID数组)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMChatroomMember[] (成员信息数组)
          </li>
          <li>
            <strong>输入格式：</strong>支持逗号、分号、空格、换行等多种分隔符
          </li>
          <li>
            <strong>返回顺序：</strong>返回的成员信息按照输入 accountIds 的顺序排序
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
          <li>需要先进入聊天室才能查询成员信息</li>
          <li>单次查询数量上限为 200 个账号</li>
          <li>如果输入为空、数量为 0 或超过 200，将返回参数错误(191004)</li>
          <li>返回的成员信息按照输入 accountIds 的顺序排序</li>
          <li>如果某个账号不存在或不在聊天室中，该账号不会出现在返回结果中</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetMemberByIdsPage;
