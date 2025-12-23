import { Button, Card, Checkbox, Form, Input, Select, Space, message } from 'antd';
import { V2NIMChatroomConst } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK';
import { type V2NIMChatroomMessage } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomMessageService';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

const { Option } = Select;

interface GetMessageListFormValues {
  beginTime: number;
  limit: number;
  direction: V2NIMChatroomConst.V2NIMQueryDirection;
  enableMessageTypes: boolean;
  messageTypes?: number[];
}

const defaultFormValues: GetMessageListFormValues = {
  beginTime: 0,
  limit: 100,
  direction: V2NIMChatroomConst.V2NIMQueryDirection.V2NIM_QUERY_DIRECTION_DESC,
  enableMessageTypes: false,
  messageTypes: [],
};

// 消息类型选项
const messageTypeOptions = [
  { label: '文本消息', value: 0 },
  { label: '图片消息', value: 1 },
  { label: '音频消息', value: 2 },
  { label: '视频消息', value: 3 },
  { label: '文件消息', value: 6 },
  { label: '位置消息', value: 4 },
  { label: '通知消息', value: 10 },
  { label: '提示消息', value: 1000 },
  { label: '自定义消息', value: 100 },
];

// 持久化存储key
const storageKey = `V2NIMChatroomService.getMessageList`;

const GetMessageListPage = () => {
  const [form] = Form.useForm<GetMessageListFormValues>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<V2NIMChatroomMessage[]>([]);

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
  const handleGetMessageList = async (values: GetMessageListFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { beginTime, limit, direction, enableMessageTypes, messageTypes } = values;

    setLoading(true);

    // 构建查询选项
    const option: any = {
      beginTime,
      limit,
      direction,
    };

    // 如果启用了消息类型过滤且有选择类型
    if (enableMessageTypes && messageTypes && messageTypes.length > 0) {
      option.messageTypes = messageTypes;
    }

    // 打印 API 入参
    console.log('API chatroomV2.V2NIMChatroomService.getMessageList execute, params:', option);

    // 执行 API
    const [error, result] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.getMessageList(option)
    );

    setLoading(false);

    if (error) {
      message.error(`获取消息列表失败: ${error.toString()}`);
      console.error('获取消息列表失败:', error.toString());
      return;
    }

    if (!result) {
      message.error('获取消息列表失败, 没有返回值');
      console.error('获取消息列表失败, 没有返回值');
      return;
    }

    setMessages(result);
    message.success(`获取到 ${result.length} 条消息`);
    console.log('获取消息列表成功, 结果:', result);

    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    form.setFieldsValue(defaultFormValues);
    setMessages([]);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { beginTime, limit, direction, enableMessageTypes, messageTypes } = values;

    // 构建参数对象
    const option: any = {
      beginTime,
      limit,
      direction,
    };

    if (enableMessageTypes && messageTypes && messageTypes.length > 0) {
      option.messageTypes = messageTypes;
    }

    const callStatement = `const messages = await window.chatroomV2.V2NIMChatroomService.getMessageList(${JSON.stringify(option, null, 2)});`;

    console.log('V2NIMChatroomService.getMessageList 调用语句:');
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
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#getMessageList"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="查询起始时间"
          name="beginTime"
          tooltip="消息查询的起始时间，单位毫秒，0 表示从最新消息开始查询"
          rules={[{ required: true, message: '请输入起始时间' }]}
        >
          <Input type="number" placeholder="请输入起始时间（毫秒），0 表示最新" />
        </Form.Item>

        <Form.Item
          label="查询数量"
          name="limit"
          tooltip="本次查询的消息数量上限，最大 100"
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

        <Form.Item
          label="过滤消息类型"
          name="enableMessageTypes"
          valuePropName="checked"
          tooltip="是否启用消息类型过滤"
        >
          <Checkbox>启用消息类型过滤</Checkbox>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.enableMessageTypes !== currentValues.enableMessageTypes
          }
        >
          {({ getFieldValue }) => {
            const enableMessageTypes = getFieldValue('enableMessageTypes');
            return enableMessageTypes ? (
              <Form.Item
                label="消息类型"
                name="messageTypes"
                tooltip="选择要查询的消息类型，不选则查询所有类型"
              >
                <Checkbox.Group options={messageTypeOptions} />
              </Form.Item>
            ) : null;
          }}
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
      {messages.length > 0 && (
        <Card
          title={`查询结果 (共 ${messages.length} 条消息)`}
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
            {JSON.stringify(messages, null, 2)}
          </pre>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>查询聊天室历史消息
          </li>
          <li>
            <strong>参数：</strong>option (消息查询选项)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMChatroomMessage[] (消息数组)
          </li>
          <li>
            <strong>查询方向：</strong>DESC 从最新消息向历史查询，ASC 从历史消息向最新查询
          </li>
          <li>
            <strong>消息类型：</strong>可选择特定类型的消息，不选则查询所有类型
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
          <li>beginTime 为 0 表示从最新消息开始查询</li>
          <li>单次查询最多返回 100 条消息</li>
          <li>查询方向 DESC（降序）常用于首次加载最新消息</li>
          <li>查询方向 ASC（升序）常用于查看历史消息上下文</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetMessageListPage;
