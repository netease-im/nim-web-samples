import { Button, Card, Checkbox, Form, Input, InputNumber, Typography, message } from 'antd';
import { V2NIMGetMediaResourceInfoResult } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMStorageService';
import React, { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;
const { Text } = Typography;

const STORAGE_KEY = 'nim_V2NIMStorageService_getVideoCoverUrl_params';

interface FormValues {
  attachment: string;
  width: number;
  height: number;
}

const getInitialValues = (): Partial<FormValues> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          width: 100,
          height: 100,
        };
  } catch {
    return {
      width: 100,
      height: 100,
    };
  }
};

const GetVideoCoverUrl: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<V2NIMGetMediaResourceInfoResult | null>(null);
  const [useThumbSize, setUseThumbSize] = useState(false);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    setResult(null);

    // Parse attachment JSON
    let attachment;
    try {
      attachment = JSON.parse(values.attachment);
    } catch (parseError) {
      console.error('JSON 解析错误:', parseError);
      message.error('attachment 参数格式错误，请检查 JSON 格式');
      setLoading(false);
      return;
    }

    // Prepare thumbSize parameter
    const thumbSize = useThumbSize
      ? {
          width: values.width,
          height: values.height,
        }
      : {
          width: 100,
          height: 100,
        };

    console.log(
      'API V2NIMStorageService.getVideoCoverUrl execute with params:',
      attachment,
      thumbSize
    );

    const [error, apiResult] = await to(() =>
      window.nim?.V2NIMStorageService.getVideoCoverUrl(attachment, thumbSize)
    );

    if (error) {
      console.error('获取视频封面图链接失败:', error.toString());
      message.error(`获取失败: ${error.message || error}`);
    } else {
      console.log('获取视频封面图链接成功:', apiResult);
      message.success('获取视频封面图链接成功');
      setResult(apiResult || null);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    }

    setLoading(false);
  };

  const fillExample = () => {
    form.setFieldsValue({
      attachment: JSON.stringify(
        {
          url: 'https://nim-nosdn.netease.im/MjYxNjY0MzM=/bmltYV8zMzM1NjIyMzc3NjVfMTc2NjAyODkxODAyNF8yMzQ0YTEwMi03ZTMwLTRjZWUtOTJkYS1jOTRkNGVmOTVlYTk=',
          name: '1726022548869_web.mov',
          size: 6030592,
          ext: 'mov',
          md5: '337cb3a5254fc820c3b95827b628472d',
          height: 1920,
          width: 1080,
          duration: 6198,
          audioCodec: 'aac (mp4a / 0x6134706d)',
          videoCodec: 'hevc (Main) (hvc1 / 0x31637668)',
          container: 'mov,mp4,m4a,3gp,3g2,mj2',
        },
        null,
        2
      ),
    });
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          width: 100,
          height: 100,
          ...getInitialValues(),
        }}
      >
        <Form.Item
          name="attachment"
          label="视频附件信息"
          rules={[{ required: true, message: '请输入视频附件 JSON' }]}
        >
          <TextArea rows={6} placeholder="请输入视频附件 JSON 格式数据" />
        </Form.Item>

        <Button type="link" onClick={fillExample} style={{ marginBottom: 16 }}>
          填入示例数据
        </Button>

        <Form.Item>
          <Checkbox checked={useThumbSize} onChange={e => setUseThumbSize(e.target.checked)}>
            指定封面图尺寸
          </Checkbox>
        </Form.Item>

        {useThumbSize && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <Form.Item name="width" label="宽度">
              <InputNumber min={1} placeholder="宽度" />
            </Form.Item>
            <Form.Item name="height" label="高度">
              <InputNumber min={1} placeholder="高度" />
            </Form.Item>
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            获取视频封面图链接
          </Button>
        </Form.Item>
      </Form>

      {/* 生成结果展示 */}
      {result && (
        <Card title="操作结果" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>✅ 视频封面图链接生成成功</Text>
          </div>

          {result.url && (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text>封面图链接: </Text>
                <Text code copyable style={{ wordBreak: 'break-all' }}>
                  {result.url}
                </Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>预览: </Text>
                <div style={{ marginTop: 8 }}>
                  <img
                    src={result.url}
                    alt="视频封面图预览"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '300px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                    }}
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </>
          )}

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
        </Card>
      )}
    </>
  );
};

export default GetVideoCoverUrl;
