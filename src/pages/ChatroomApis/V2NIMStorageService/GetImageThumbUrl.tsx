import { Button, Card, Form, Input, InputNumber, Space, Typography, message } from 'antd';
import { V2NIMGetMediaResourceInfoResult } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMStorageService';
import React, { useState } from 'react';

import { to } from '@/utils/errorHandle';

const { Text } = Typography;

const STORAGE_KEY = 'chatroomV2_V2NIMStorageService_getImageThumbUrl_params';

interface FormValues {
  attachment: string;
  enableThumbSize: boolean;
  width: number;
  height: number;
}

const getInitialValues = (): Partial<FormValues> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedStored = JSON.parse(stored);
      return {
        attachment:
          parsedStored.attachment ||
          JSON.stringify(
            {
              url: 'https://nim.nosdn.127.net/MTAxMTAwMjY=/bmltYV8xNDc5OTNfMTczNDA2NjI2NF85NDU=',
              name: 'image.jpg',
              ext: 'jpg',
              size: 123456,
              w: 800,
              h: 600,
            },
            null,
            2
          ),
        enableThumbSize: parsedStored.enableThumbSize || false,
        width: parsedStored.width || 100,
        height: parsedStored.height || 100,
      };
    }
  } catch (error) {
    console.error('Failed to parse stored values:', error);
  }
  return {
    attachment: JSON.stringify(
      {
        url: 'https://nim.nosdn.127.net/MTAxMTAwMjY=/bmltYV8xNDc5OTNfMTczNDA2NjI2NF85NDU=',
        name: 'image.jpg',
        ext: 'jpg',
        size: 123456,
        w: 800,
        h: 600,
      },
      null,
      2
    ),
    enableThumbSize: false,
    width: 100,
    height: 100,
  };
};

const GetImageThumbUrlPage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<V2NIMGetMediaResourceInfoResult | null>(null);

  const onFinish = async (values: FormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }
    setLoading(true);
    setResult(null);

    // 解析附件信息
    let attachmentObj;
    try {
      attachmentObj = JSON.parse(values.attachment.trim());
    } catch (parseError) {
      console.error('JSON 解析错误:', parseError);
      message.error('attachment 参数格式错误，请检查 JSON 格式');
      setLoading(false);
      return;
    }

    // 准备缩略图尺寸参数
    let thumbSizeObj = undefined;
    if (values.enableThumbSize) {
      thumbSizeObj = {
        width: values.width,
        height: values.height,
      };
    }

    console.log(
      'API V2NIMStorageService.getImageThumbUrl execute with params:',
      attachmentObj,
      thumbSizeObj
    );

    // 调用生成缩略图链接API
    const [error, apiResult] = await to(() =>
      thumbSizeObj
        ? window.chatroomV2?.V2NIMStorageService.getImageThumbUrl(attachmentObj, thumbSizeObj)
        : window.chatroomV2?.V2NIMStorageService.getImageThumbUrl(attachmentObj, {
            width: 100,
            height: 100,
          })
    );

    if (error) {
      console.error('生成缩略图链接失败:', error.toString());
      message.error(`生成失败: ${error.message || error}`);
    } else {
      console.log('生成缩略图链接成功:', apiResult);
      message.success('生成缩略图链接成功');
      setResult(apiResult || null);

      // 保存参数到 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    }

    setLoading(false);
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    if (!values.attachment || !values.attachment.trim()) {
      message.error('请先输入图片附件信息');
      return;
    }

    try {
      const attachmentObj = JSON.parse(values.attachment.trim());
      let statement;

      if (values.enableThumbSize) {
        const thumbSizeObj = {
          width: values.width,
          height: values.height,
        };
        statement = `const thumbUrl = await window.chatroomV2.V2NIMStorageService.getImageThumbUrl(${JSON.stringify(attachmentObj, null, 2)}, ${JSON.stringify(thumbSizeObj, null, 2)});`;
      } else {
        statement = `const thumbUrl = await window.chatroomV2.V2NIMStorageService.getImageThumbUrl(${JSON.stringify(attachmentObj, null, 2)});`;
      }

      console.log('V2NIMStorageService.getImageThumbUrl 调用语句:');
      console.log(statement);
      message.success('调用语句已输出到控制台');
    } catch (error) {
      message.error('附件信息 JSON 格式错误');
    }
  };

  // 重置结果
  const handleReset = () => {
    setResult(null);
    message.info('已重置结果');
  };

  // 填入示例附件信息
  const handleFillExample = () => {
    const exampleAttachment = {
      url: 'https://nim.nosdn.127.net/MTAxMTAwMjY=/bmltYV8xNDc5OTNfMTczNDA2NjI2NF85NDU=',
      name: 'sample-image.jpg',
      ext: 'jpg',
      size: 256000,
      w: 1200,
      h: 800,
    };
    form.setFieldValue('attachment', JSON.stringify(exampleAttachment, null, 2));
    message.info('已填入示例图片附件信息');
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={getInitialValues()}>
        <Form.Item
          label="图片附件信息"
          name="attachment"
          tooltip="图片附件的详细信息，JSON格式"
          rules={[{ required: true, message: '请输入图片附件信息' }]}
        >
          <Input.TextArea
            rows={8}
            placeholder="请输入图片附件信息的JSON格式数据"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          label="自定义尺寸"
          name="enableThumbSize"
          valuePropName="checked"
          tooltip="是否指定缩略图尺寸"
        >
          <input type="checkbox" />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.enableThumbSize !== currentValues.enableThumbSize
          }
        >
          {({ getFieldValue }) => {
            return getFieldValue('enableThumbSize') ? (
              <>
                <Form.Item label="缩略图宽度" name="width" tooltip="缩略图宽度（像素）">
                  <InputNumber
                    min={10}
                    max={2000}
                    placeholder="请输入宽度"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="缩略图高度" name="height" tooltip="缩略图高度（像素）">
                  <InputNumber
                    min={10}
                    max={2000}
                    placeholder="请输入高度"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </>
            ) : null;
          }}
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%', flexWrap: 'wrap' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              {loading ? '生成中...' : '生成缩略图链接'}
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

      {/* 生成结果展示 */}
      {result && (
        <Card title="操作结果" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>✅ 缩略图链接生成成功</Text>
          </div>

          {result.url && (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text>缩略图链接: </Text>
                <Text code style={{ wordBreak: 'break-all' }}>
                  {result.url}
                </Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>预览: </Text>
                <div style={{ marginTop: 8 }}>
                  <img
                    src={result.url}
                    alt="缩略图预览"
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

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>为图片附件生成缩略图链接
          </li>
          <li>
            <strong>参数：</strong>attachment (图片附件信息), thumbSize? (缩略图尺寸)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;string&gt; (缩略图链接)
          </li>
          <li>
            <strong>用途：</strong>生成图片的缩略图版本，用于快速预览和节省带宽
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
          <li>只能为 NOS 上传的图片资源附件生成缩略图</li>
          <li>附件信息必须包含有效的图片链接</li>
          <li>缩略图尺寸建议设置合理范围（10-2000像素）</li>
        </ul>
      </Card>
    </>
  );
};

export default GetImageThumbUrlPage;
