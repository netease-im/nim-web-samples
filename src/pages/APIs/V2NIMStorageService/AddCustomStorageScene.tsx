import { Button, Card, Form, Input, InputNumber, Typography, message } from 'antd';
import { V2NIMStorageScene } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMStorageService';
import React, { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { Text } = Typography;

const STORAGE_KEY = 'nim_V2NIMStorageService_addCustomStorageScene_params';

interface FormValues {
  sceneName: string;
  expireTime: number;
}

const getInitialValues = (): Partial<FormValues> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const AddCustomStorageScene: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<V2NIMStorageScene | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    setResult(null);
    setIsSuccess(false);

    const [error, result] = await to(() =>
      window.nim?.V2NIMStorageService.addCustomStorageScene(values.sceneName, values.expireTime)
    );

    if (error) {
      console.error('添加存储场景失败:', error.toString());
      message.error(`添加失败: ${error.message || error}`);
      setIsSuccess(false);
    } else {
      console.log('添加存储场景成功:', result);
      message.success('添加存储场景成功');
      setResult(result || null);
      setIsSuccess(true);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    }

    setLoading(false);
  };

  const fillExample = () => {
    form.setFieldsValue({
      sceneName: 'custom_scene_example',
      expireTime: 7200, // 2小时，单位秒
    });
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          expireTime: 86400, // 默认24小时
          ...getInitialValues(),
        }}
      >
        <Form.Item
          name="sceneName"
          label="场景名称"
          rules={[{ required: true, message: '请输入场景名称' }]}
        >
          <Input placeholder="请输入自定义场景名称" />
        </Form.Item>

        <Form.Item
          name="expireTime"
          label="过期时间"
          rules={[{ required: true, message: '请输入过期时间' }]}
        >
          <InputNumber
            placeholder="过期时间（秒）"
            min={1}
            style={{ width: '100%' }}
            addonAfter="秒"
          />
        </Form.Item>

        <Button type="link" onClick={fillExample} style={{ marginBottom: 16 }}>
          填入示例数据
        </Button>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            添加存储场景
          </Button>
        </Form.Item>
      </Form>

      {isSuccess && (
        <Card title="操作结果" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>✅ 存储场景添加成功</Text>
          </div>

          {result && (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text>场景名称: </Text>
                <Text code>{result.sceneName}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text>过期时间: </Text>
                <Text code>{result.expireTime} 秒</Text>
              </div>

              <Text strong>完整返回数据:</Text>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  marginTop: '8px',
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </>
          )}

          {!result && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">API 调用成功，但未返回场景信息</Text>
            </div>
          )}
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>添加自定义存储场景, 内存态的
          </li>
          <li>
            <strong>参数：</strong>sceneName (场景名称), expireTime (过期时间，秒)
          </li>
          <li>
            <strong>用途：</strong>为文件存储创建具有特定过期时间的自定义场景
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
          <li>场景名称需要全局唯一</li>
          <li>过期时间单位为秒</li>
          <li>添加后的场景可用于文件上传</li>
        </ul>
      </Card>
    </>
  );
};

export default AddCustomStorageScene;
