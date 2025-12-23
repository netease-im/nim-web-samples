import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../chatroom.module.less';

const { Text } = Typography;

const STORAGE_KEY = 'chatroomV2_V2NIMStorageService_shortUrlToLong_params';

interface FormValues {
  url: string;
}

const ShortUrlToLongPage = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): FormValues => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return {
          url: parsedStored.url || '',
        };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return {
      url: '',
    };
  };

  const initialValues = getInitialValues();

  // 表单提交: 触发 API 调用
  const onFinish = async (values: FormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('聊天室 SDK 尚未初始化和登录');
      return;
    }

    if (!values.url || !values.url.trim()) {
      message.error('请输入短链接地址');
      return;
    }

    setLoading(true);
    setResult(null);

    console.log('API V2NIMStorageService.shortUrlToLong execute with params:', values.url);

    // 调用短链接转长链接API
    const [error, apiResult] = await to(() =>
      window.chatroomV2?.V2NIMStorageService.shortUrlToLong(values.url.trim())
    );

    setLoading(false);

    if (error) {
      message.error(`短链接转长链接失败: ${error.toString()}`);
      console.error('短链接转长链接失败:', error.toString());
      return;
    }

    console.log('短链接转长链接成功:', apiResult);
    setResult(apiResult || null);
    message.success('短链接转长链接成功');

    // 保存参数到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    if (!values.url || !values.url.trim()) {
      message.error('请先输入短链接地址');
      return;
    }

    const statement = `const longUrl = await window.chatroomV2.V2NIMStorageService.shortUrlToLong("${values.url.trim()}");`;

    console.log('V2NIMStorageService.shortUrlToLong 调用语句:');
    console.log(statement);
    message.success('调用语句已输出到控制台');
  };

  // 重置结果
  const handleReset = () => {
    setResult(null);
    message.info('已重置结果');
  };

  // 填入示例短链接
  const handleFillExample = () => {
    const exampleUrl = 'https://nim.163.com/s/abc123';
    form.setFieldValue('url', exampleUrl);
    message.info('已填入示例短链接');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={onFinish}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMStorageService`}
              target="_blank"
            >
              V2NIMStorageService.shortUrlToLong
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="短链接地址"
          name="url"
          tooltip="要转换为长链接的短链接地址"
          rules={[{ required: true, message: '请输入短链接地址' }]}
        >
          <Input placeholder="请输入短链接地址" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%', flexWrap: 'wrap' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              {loading ? '转换中...' : '转换长链接'}
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
            <Button type="default" onClick={handleFillExample}>
              填入示例
            </Button>
            <Button type="default" onClick={handleReset}>
              重置结果
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 转换结果展示 */}
      {result && (
        <Card title="转换结果" style={{ marginTop: 16 }} size="small">
          <div style={{ marginBottom: 8 }}>
            <Text strong>原始短链接: </Text>
            <Text code style={{ wordBreak: 'break-all' }}>
              {form.getFieldValue('url')}
            </Text>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Text strong>转换后长链接: </Text>
            <Text code style={{ wordBreak: 'break-all' }}>
              {result}
            </Text>
          </div>
          <div>
            <Text strong>完整结果: </Text>
            <pre
              style={{
                background: '#f5f5f5',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '8px',
                overflow: 'auto',
                fontSize: '12px',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>将短链接转换为长链接
          </li>
          <li>
            <strong>参数：</strong>url (短链接地址)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;string&gt; (长链接地址)
          </li>
          <li>
            <strong>用途：</strong>解析云信存储服务生成的短链接，获得原始文件链接
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
          <li>只能转换云信存储服务生成的短链接</li>
          <li>短链接必须是有效的、未过期的链接</li>
          <li>转换后的长链接可直接用于文件访问</li>
          <li>某些短链接可能有访问权限限制</li>
        </ul>
      </Card>
    </div>
  );
};

export default ShortUrlToLongPage;
