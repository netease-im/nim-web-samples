import { Button, Card, Checkbox, Form, Input, Space, message } from 'antd';
import { V2NIMChatroomConst } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK';
import type {
  V2NIMChatroomMemberListResult,
  V2NIMChatroomMemberQueryOption,
} from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomMemberService';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

interface GetMemberListByOptionFormValues {
  limit: number;
  pageToken?: string;
  onlyOnline: boolean;
  onlyChatBanned: boolean;
  onlyBlocked: boolean;
  enableMemberRoles: boolean;
  memberRoles?: V2NIMChatroomConst.V2NIMChatroomMemberRole[];
}

const defaultFormValues: GetMemberListByOptionFormValues = {
  limit: 100,
  pageToken: '',
  onlyOnline: false,
  onlyChatBanned: false,
  onlyBlocked: false,
  enableMemberRoles: false,
  memberRoles: [],
};

// 成员角色选项
const memberRoleOptions = [
  {
    label: '普通成员',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_NORMAL,
  },
  {
    label: '创建者',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_CREATOR,
  },
  {
    label: '管理员',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_MANAGER,
  },
  {
    label: '游客',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_NORMAL_GUEST,
  },
  {
    label: '匿名游客',
    value: V2NIMChatroomConst.V2NIMChatroomMemberRole.V2NIM_CHATROOM_MEMBER_ROLE_ANONYMOUS_GUEST,
  },
];

// 持久化存储key
const storageKey = `V2NIMChatroomService.getMemberListByOption`;

const GetMemberListByOptionPage = () => {
  const [form] = Form.useForm<GetMemberListByOptionFormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<V2NIMChatroomMemberListResult | null>(null);

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
  const handleGetMemberList = async (values: GetMemberListByOptionFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const {
      limit,
      pageToken,
      onlyOnline,
      onlyChatBanned,
      onlyBlocked,
      enableMemberRoles,
      memberRoles,
    } = values;

    setLoading(true);

    // 构建查询选项
    const option: V2NIMChatroomMemberQueryOption = {
      limit,
      onlyOnline,
      onlyChatBanned,
      onlyBlocked,
      pageToken: '',
    };

    // 添加可选参数
    if (pageToken) {
      option.pageToken = pageToken;
    }

    // 如果启用了成员角色过滤且有选择角色
    if (enableMemberRoles && memberRoles && memberRoles.length > 0) {
      option.memberRoles = memberRoles;
    }

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.getMemberListByOption execute, params:',
      option
    );

    // 执行 API
    const [error, apiResult] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.getMemberListByOption(option)
    );

    setLoading(false);

    if (error) {
      message.error(`获取成员列表失败: ${error.toString()}`);
      console.error('获取成员列表失败:', error.toString());
      return;
    }

    if (!apiResult) {
      message.error('获取成员列表失败, 没有返回值');
      console.error('获取成员列表失败, 没有返回值');
      return;
    }

    setResult(apiResult);
    message.success(
      `获取到 ${apiResult.memberList.length} 个成员, ${apiResult.finished ? '已全部加载' : '还有更多'}`
    );
    console.log('获取成员列表成功, 结果:', apiResult);

    // 如果有下一页,自动填充 pageToken
    if (!apiResult.finished && apiResult.pageToken) {
      form.setFieldValue('pageToken', apiResult.pageToken);
    }

    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    form.setFieldsValue(defaultFormValues);
    setResult(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const {
      limit,
      pageToken,
      onlyOnline,
      onlyChatBanned,
      onlyBlocked,
      enableMemberRoles,
      memberRoles,
    } = values;

    // 构建参数对象
    const option: V2NIMChatroomMemberQueryOption = {
      limit,
      onlyOnline,
      onlyChatBanned,
      onlyBlocked,
      pageToken: '',
    };

    if (pageToken) {
      option.pageToken = pageToken;
    }

    if (enableMemberRoles && memberRoles && memberRoles.length > 0) {
      option.memberRoles = memberRoles;
    }

    const callStatement = `const result = await window.chatroomV2.V2NIMChatroomService.getMemberListByOption(${JSON.stringify(option, null, 2)});`;

    console.log('V2NIMChatroomService.getMemberListByOption 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleGetMemberList}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#getMemberListByOption"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="查询数量"
          name="limit"
          tooltip="本次查询的成员数量上限"
          rules={[
            { required: true, message: '请输入查询数量' },
            {
              type: 'number',
              min: 1,
              max: 100,
              transform: value => Number(value),
              message: '查询数量必须在 1-100 之间',
            },
          ]}
        >
          <Input type="number" placeholder="请输入查询数量（1-100）" />
        </Form.Item>

        <Form.Item
          label="分页标记"
          name="pageToken"
          tooltip="分页查询的标记，首次查询时不填，后续查询使用上次返回的 pageToken"
        >
          <Input placeholder="首次查询不填，后续查询使用上次返回的 pageToken" />
        </Form.Item>

        <Form.Item
          label="只查询在线成员"
          name="onlyOnline"
          valuePropName="checked"
          tooltip="是否只返回在线成员"
        >
          <Checkbox>只查询在线成员</Checkbox>
        </Form.Item>

        <Form.Item
          label="只查询禁言成员"
          name="onlyChatBanned"
          valuePropName="checked"
          tooltip="是否只返回禁言成员"
        >
          <Checkbox>只查询禁言成员</Checkbox>
        </Form.Item>

        <Form.Item
          label="只查询黑名单成员"
          name="onlyBlocked"
          valuePropName="checked"
          tooltip="是否只返回黑名单成员"
        >
          <Checkbox>只查询黑名单成员</Checkbox>
        </Form.Item>

        <Form.Item
          label="过滤成员角色"
          name="enableMemberRoles"
          valuePropName="checked"
          tooltip="是否启用成员角色过滤"
        >
          <Checkbox>启用成员角色过滤</Checkbox>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.enableMemberRoles !== currentValues.enableMemberRoles
          }
        >
          {({ getFieldValue }) => {
            const enableMemberRoles = getFieldValue('enableMemberRoles');
            return enableMemberRoles ? (
              <Form.Item
                label="成员角色"
                name="memberRoles"
                tooltip="选择要查询的成员角色，不选则查询所有角色"
              >
                <Checkbox.Group options={memberRoleOptions} />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              获取成员列表
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 查询结果 */}
      {result && (
        <Card
          title={`查询结果 (共 ${result.memberList.length} 个成员)`}
          extra={
            <span style={{ color: result.finished ? '#52c41a' : '#fa8c16' }}>
              {result.finished ? '✓ 已全部加载' : '⚠ 还有更多数据'}
            </span>
          }
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
            {JSON.stringify(result, null, 2)}
          </pre>
          {!result.finished && result.pageToken && (
            <div style={{ marginTop: 12, padding: 8, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
              <strong>下一页 pageToken:</strong> {result.pageToken}
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                (已自动填充到表单中，可直接点击"获取成员列表"继续查询)
              </span>
            </div>
          )}
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>分页获取聊天室成员列表
          </li>
          <li>
            <strong>参数：</strong>option (成员查询选项)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMChatroomMemberListResult (包含成员列表和分页信息)
          </li>
          <li>
            <strong>分页查询：</strong>首次查询不填 pageToken，后续使用返回的 pageToken 继续查询
          </li>
          <li>
            <strong>成员角色：</strong>可选择特定角色的成员，不选则查询所有角色
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
          <li>需要先进入聊天室才能查询成员列表</li>
          <li>首次查询时 pageToken 留空，后续查询使用上次返回的 pageToken</li>
          <li>finished 为 true 表示已查询完所有数据</li>
          <li>各种筛选条件可以组合使用</li>
          <li>成员角色过滤可选择一个或多个角色</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetMemberListByOptionPage;
