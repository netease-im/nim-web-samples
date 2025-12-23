import { Button, Card, Form, Input, Select, Space, message } from 'antd';
import { V2NIMChatroomConst } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

const { Option } = Select;
const { TextArea } = Input;

interface GetMessageListByTagFormValues {
  tags: string;
  limit: number;
  direction: number;
  beginTime?: number;
  endTime?: number;
  messageTypes?: string;
}

const defaultFormValues: GetMessageListByTagFormValues = {
  tags: '',
  limit: 100,
  direction: V2NIMChatroomConst.V2NIMQueryDirection.V2NIM_QUERY_DIRECTION_DESC,
  beginTime: 0,
  endTime: 0,
  messageTypes: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.getMessageListByTag`;

const GetMessageListByTagPage = () => {
  const [form] = Form.useForm<GetMessageListByTagFormValues>();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 保存表单数据到 localStorage
  const saveFormData = (values: GetMessageListByTagFormValues) => {
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

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
  const handleGetMessageList = async (values: GetMessageListByTagFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    setLoading(true);

    // 解析 tags
    let tagsArray: string[];
    try {
      const tagsStr = values.tags.trim();
      if (tagsStr.startsWith('[')) {
        tagsArray = JSON.parse(tagsStr);
      } else {
        tagsArray = tagsStr
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag);
      }
    } catch (error) {
      message.error('tags 格式错误，请使用 JSON 数组或逗号分隔');
      setLoading(false);
      return;
    }

    if (tagsArray.length === 0) {
      message.error('tags 不能为空');
      setLoading(false);
      return;
    }

    // 解析 messageTypes (可选)
    let messageTypesArray: number[] | undefined;
    if (values.messageTypes) {
      try {
        const messageTypesStr = values.messageTypes.trim();
        if (messageTypesStr.startsWith('[')) {
          messageTypesArray = JSON.parse(messageTypesStr);
        } else {
          messageTypesArray = messageTypesStr
            .split(',')
            .map(type => parseInt(type.trim()))
            .filter(type => !isNaN(type));
        }
      } catch (error) {
        message.error('messageTypes 格式错误');
        setLoading(false);
        return;
      }
    }

    // 构建查询选项
    const messageOption: any = {
      tags: tagsArray,
      limit: values.limit,
      direction: values.direction,
    };

    if (values.beginTime) {
      messageOption.beginTime = values.beginTime;
    }

    if (values.endTime) {
      messageOption.endTime = values.endTime;
    }

    if (messageTypesArray && messageTypesArray.length > 0) {
      messageOption.messageTypes = messageTypesArray;
    }

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.getMessageListByTag execute, params:',
      messageOption
    );

    // 执行 API
    const [error, messages] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.getMessageListByTag(messageOption)
    );

    setLoading(false);

    if (error) {
      message.error(`获取消息列表失败: ${error.toString()}`);
      console.error('获取消息列表失败:', error.toString());
      return;
    }

    if (!messages) {
      message.error('获取消息列表失败, 没有返回值');
      console.error('获取消息列表失败, 没有返回值');
      return;
    }

    setResult(JSON.stringify(messages, null, 2));
    message.success(`获取到 ${messages.length} 条消息`);
    console.log('获取消息列表成功, 结果:', messages);

    // 存储最终执行的参数
    saveFormData(values);
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    form.setFieldsValue(defaultFormValues);
    setResult('');
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();

    let tagsArray: string[] = [];
    try {
      const tagsStr = values.tags.trim();
      if (tagsStr.startsWith('[')) {
        tagsArray = JSON.parse(tagsStr);
      } else {
        tagsArray = tagsStr
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag);
      }
    } catch {
      // ignore
    }

    // 解析 messageTypes
    let messageTypesArray: number[] | undefined;
    if (values.messageTypes) {
      try {
        const messageTypesStr = values.messageTypes.trim();
        if (messageTypesStr.startsWith('[')) {
          messageTypesArray = JSON.parse(messageTypesStr);
        } else {
          messageTypesArray = messageTypesStr
            .split(',')
            .map(type => parseInt(type.trim()))
            .filter(type => !isNaN(type));
        }
      } catch {
        // ignore
      }
    }

    // 构建参数对象
    const option: any = {
      tags: tagsArray,
      limit: values.limit,
      direction: values.direction,
    };

    if (values.beginTime) {
      option.beginTime = values.beginTime;
    }

    if (values.endTime) {
      option.endTime = values.endTime;
    }

    if (messageTypesArray && messageTypesArray.length > 0) {
      option.messageTypes = messageTypesArray;
    }

    const callStatement = `const messages = await window.chatroomV2.V2NIMChatroomService.getMessageListByTag(${JSON.stringify(option, null, 2)});`;

    console.log('V2NIMChatroomService.getMessageListByTag 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleGetMessageList}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#getMessageListByTag"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="标签列表"
          name="tags"
          tooltip="要查询的标签列表，支持 JSON 数组格式或逗号分隔"
          rules={[{ required: true, message: '请输入标签列表' }]}
        >
          <TextArea rows={2} placeholder='["tag1", "tag2"] 或 tag1, tag2' />
        </Form.Item>

        <Form.Item
          label="查询数量"
          name="limit"
          tooltip="每次查询的消息数量，建议 100"
          rules={[{ required: true, message: '请输入查询数量' }]}
        >
          <Input type="number" placeholder="建议 100" />
        </Form.Item>

        <Form.Item
          label="查询方向"
          name="direction"
          tooltip="消息查询方向：DESC-降序（从新到旧），ASC-升序（从旧到新）"
          rules={[{ required: true, message: '请选择查询方向' }]}
        >
          <Select placeholder="请选择查询方向">
            <Option value={V2NIMChatroomConst.V2NIMQueryDirection.V2NIM_QUERY_DIRECTION_DESC}>
              DESC - 降序（从新到旧）
            </Option>
            <Option value={V2NIMChatroomConst.V2NIMQueryDirection.V2NIM_QUERY_DIRECTION_ASC}>
              ASC - 升序（从旧到新）
            </Option>
          </Select>
        </Form.Item>

        <Form.Item label="开始时间" name="beginTime" tooltip="查询开始时间，首次传 0，单位毫秒">
          <Input type="number" placeholder="首次传 0，单位毫秒" />
        </Form.Item>

        <Form.Item
          label="结束时间"
          name="endTime"
          tooltip="查询结束时间，默认 0 表示当前时间，单位毫秒"
        >
          <Input type="number" placeholder="默认 0 表示当前时间，单位毫秒" />
        </Form.Item>

        <Form.Item
          label="消息类型"
          name="messageTypes"
          tooltip="要查询的消息类型列表，留空表示查询所有类型。支持 JSON 数组或逗号分隔的数字"
        >
          <TextArea rows={2} placeholder="[0, 1, 2] 或 0, 1, 2 (可选)" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              获取消息列表
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 查询结果 */}
      {result && (
        <Card title={`查询结果`} style={{ marginTop: 16 }} size="small">
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
            {result}
          </pre>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>按标签查询聊天室历史消息
          </li>
          <li>
            <strong>参数：</strong>tags (标签列表，必填), limit (查询数量), direction (查询方向)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMChatroomMessage[] (消息数组)
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
          <li>需要先进入聊天室才能查询消息</li>
          <li>tags 参数不能为空，否则返回参数错误</li>
          <li>调用前请确保指定标签存在，否则会返回错误</li>
          <li>beginTime 必须小于 endTime</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetMessageListByTagPage;
