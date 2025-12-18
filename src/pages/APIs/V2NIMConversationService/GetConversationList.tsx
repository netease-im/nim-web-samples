import { Button, Card, Form, InputNumber, Space, Typography, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Text } = Typography;

interface GetConversationListFormValues {
  offset: number;
  limit: number;
}

const defaultGetConversationListFormValues: GetConversationListFormValues = {
  offset: 0,
  limit: 10,
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMConversationService.getConversationList`;

const GetConversationListPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): GetConversationListFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultGetConversationListFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultGetConversationListFormValues;
  };

  const initialValues = getInitialValues();

  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 查询结果
  const [conversationResult, setConversationResult] = useState<any>(null);

  // 表单提交: 触发 API 调用
  const handleGetConversationList = async (values: GetConversationListFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    const { offset, limit } = values;

    setLoading(true);
    setConversationResult(null);

    // 打印 API 入参
    console.log('API V2NIMConversationService.getConversationList execute, params:', {
      offset,
      limit,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationService.getConversationList(offset, limit)
    );
    if (error) {
      message.error(`获取会话列表失败: ${error.toString()}`);
      console.error('获取会话列表失败:', error.toString());
    } else {
      message.success('获取会话列表成功');
      console.log('获取会话列表成功, 结果:', result);
      setConversationResult(result);
    }
    // finally
    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultGetConversationListFormValues);
    setConversationResult(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { offset, limit } = values;

    const callStatement = `const result = await window.nim.V2NIMConversationService.getConversationList(${offset}, ${limit});`;

    console.log('V2NIMConversationService.getConversationList 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化会话类型
  const formatConversationType = (type: number) => {
    const typeMap: { [key: number]: string } = {
      1: 'P2P',
      2: '群聊',
      3: '超大群',
    };
    return typeMap[type] || '未知';
  };

  // 格式化会话结果显示
  const formatConversationResult = (result: any) => {
    if (!result) {
      return <Text type="secondary">无会话数据</Text>;
    }

    const { conversationList, finished } = result;

    if (!conversationList || conversationList.length === 0) {
      return <Text type="secondary">暂无会话记录</Text>;
    }

    return (
      <div>
        <div style={{ marginBottom: 8 }}>
          <Text strong>总计: {conversationList.length} 个会话</Text>
          {finished !== undefined && (
            <Text type={finished ? 'success' : 'warning'} style={{ marginLeft: 8 }}>
              {finished ? '已加载完所有会话' : '还有更多会话'}
            </Text>
          )}
        </div>
        {conversationList.map((conversation: any, index: number) => (
          <div
            key={index}
            style={{ marginBottom: 8, padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}
          >
            <div>
              <Text strong>会话ID:</Text> {conversation.conversationId}
            </div>
            <div>
              <Text strong>类型:</Text> {formatConversationType(conversation.type)}
            </div>
            <div>
              <Text strong>未读数:</Text> {conversation.unreadCount || 0}
            </div>
            <div>
              <Text strong>置顶:</Text> {conversation.stickTop ? '是' : '否'}
            </div>
            <div>
              <Text strong>免打扰:</Text> {conversation.mute ? '是' : '否'}
            </div>
            {conversation.updateTime && (
              <div>
                <Text strong>更新时间:</Text> {new Date(conversation.updateTime).toLocaleString()}
              </div>
            )}
            {conversation.serverExtension && (
              <div>
                <Text strong>服务端扩展:</Text> {conversation.serverExtension}
              </div>
            )}
            {conversation.localExtension && (
              <div>
                <Text strong>本地扩展:</Text> {conversation.localExtension}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetConversationList}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMConversationService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="起始位置"
          name="offset"
          tooltip="分页查询的起始位置，从0开始"
          rules={[
            { required: true, message: '请输入起始位置' },
            { type: 'number', min: 0, message: '起始位置不能小于0' },
          ]}
        >
          <InputNumber placeholder="请输入起始位置" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="获取数量"
          name="limit"
          tooltip="单次获取的会话数量，建议不超过100"
          rules={[
            { required: true, message: '请输入获取数量' },
            { type: 'number', min: 1, max: 100, message: '获取数量必须在1-100之间' },
          ]}
        >
          <InputNumber placeholder="请输入获取数量" min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        {conversationResult && (
          <Form.Item label="查询结果">{formatConversationResult(conversationResult)}</Form.Item>
        )}

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              获取会话列表
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>分页获取会话列表
          </li>
          <li>
            <strong>参数：</strong>
            <ul style={{ marginTop: 4, marginBottom: 0 }}>
              <li>offset: 起始位置，从0开始</li>
              <li>limit: 获取数量，建议不超过100</li>
            </ul>
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;V2NIMConversationResult&gt;
          </li>
          <li>
            <strong>用途：</strong>获取当前用户的会话列表，支持分页加载
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
          <li>会话列表按 sortOrder 降序排列</li>
          <li>建议根据finished字段判断是否需要继续分页加载</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetConversationListPage;
