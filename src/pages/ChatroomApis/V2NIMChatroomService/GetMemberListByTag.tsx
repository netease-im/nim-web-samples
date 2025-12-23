import { Button, Card, Form, Input, Space, message } from 'antd';
import type { V2NIMChatroomMemberListResult } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomMemberService';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

interface GetMemberListByTagFormValues {
  tag: string;
  limit: number;
  pageToken?: string;
}

const defaultFormValues: GetMemberListByTagFormValues = {
  tag: '',
  limit: 100,
  pageToken: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.getMemberListByTag`;

const GetMemberListByTagPage = () => {
  const [form] = Form.useForm<GetMemberListByTagFormValues>();
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
  const handleGetMemberList = async (values: GetMemberListByTagFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { tag, limit, pageToken } = values;

    setLoading(true);

    // 构建查询选项
    const option: any = {
      tag: tag.trim(),
      limit,
    };

    // 添加可选参数
    if (pageToken?.trim()) {
      option.pageToken = pageToken.trim();
    }

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomService.getMemberListByTag execute, params:', option);

    // 执行 API
    const [error, apiResult] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.getMemberListByTag(option)
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
    const { tag, limit, pageToken } = values;

    const option: any = {
      tag: tag.trim(),
      limit,
    };

    if (pageToken?.trim()) {
      option.pageToken = pageToken.trim();
    }

    const callStatement = `const result = await window.chatroomV2.V2NIMChatroomService.getMemberListByTag(${JSON.stringify(option, null, 2)});`;

    console.log('V2NIMChatroomService.getMemberListByTag 调用语句:');
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
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#getMemberListByTag"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="标签"
          name="tag"
          tooltip="聊天室标签信息，必填字段"
          rules={[{ required: true, message: '请输入标签' }]}
        >
          <Input placeholder="请输入标签" />
        </Form.Item>

        <Form.Item
          label="查询数量"
          name="limit"
          tooltip="每次查询的成员数量，默认 100"
          rules={[{ required: true, message: '请输入查询数量' }]}
        >
          <Input type="number" placeholder="请输入查询数量，默认 100" />
        </Form.Item>

        <Form.Item
          label="分页标识"
          name="pageToken"
          tooltip="分页标识，首页传空字符串，下一页传上次返回的 pageToken"
        >
          <Input placeholder="首页传空，下一页传上次返回的 pageToken" />
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
          title={`查询结果 (共 ${result.memberList.length} 个成员${result.finished ? ', 已全部加载' : ', 还有更多'})`}
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
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>根据标签查询聊天室成员列表
          </li>
          <li>
            <strong>参数：</strong>tag (标签, 必填), limit (查询数量), pageToken (分页标识)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMChatroomMemberListResult
            (包含成员列表、是否结束、下一页标识)
          </li>
          <li>
            <strong>分页查询：</strong>首页传空 pageToken，下一页传上次返回的 pageToken
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
          <li>tag 不能为空，否则返回参数错误</li>
          <li>limit 必须大于 0，否则返回参数错误</li>
          <li>如果 finished 为 false，说明还有更多数据，需要继续分页查询</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetMemberListByTagPage;
