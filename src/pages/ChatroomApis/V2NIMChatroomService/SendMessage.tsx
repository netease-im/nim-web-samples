import { UploadOutlined } from '@ant-design/icons';

import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
  Upload,
  UploadFile,
  message,
} from 'antd';
import { type V2NIMChatroomMessage } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomMessageService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../../APIs/nim.module.less';

const { Option } = Select;
const { TextArea } = Input;

// 消息类型枚举
const messageTypes = [
  { value: 'text', label: '文本消息' },
  { value: 'location', label: '位置消息' },
  { value: 'custom', label: '自定义消息' },
  { value: 'image', label: '图片消息' },
  { value: 'audio', label: '音频消息' },
  { value: 'video', label: '视频消息' },
  { value: 'file', label: '文件消息' },
];

interface CreateMessageFormValues {
  messageType: string;
  // 文本消息参数
  text?: string;
  // 位置消息参数
  latitude?: number;
  longitude?: number;
  address?: string;
  // 自定义消息参数
  rawAttachment?: string;
  // 文件相关参数
  file?: UploadFile[];
  fileName?: string;
  sceneName?: string;
  // 图片/视频相关参数
  width?: number;
  height?: number;
  // 音频/视频相关参数
  duration?: number;
}

interface SendMessageFormValues {
  enableAdvanced: boolean;
  params?: string;
}

const defaultCreateMessageFormValues: CreateMessageFormValues = {
  messageType: 'text',
  text: 'Hello, Chatroom!',
  latitude: 39.9042,
  longitude: 116.4074,
  address: '北京市朝阳区',
  rawAttachment: '{"type": "custom", "data": "test"}',
  fileName: '',
  sceneName: 'nim_default_im',
  width: 0,
  height: 0,
  duration: 0,
};

const defaultSendMessageFormValues: SendMessageFormValues = {
  enableAdvanced: false,
  params: JSON.stringify(
    {
      messageConfig: {
        historyEnabled: true, // 是否需要在服务端保存历史消息。默认为 true
        highPriority: false, // 是否为高优先级消息。默认为 false
      },
      routeConfig: {
        routeEnabled: true, // 是否需要路由消息（抄送）。默认为 true
      },
      antispamConfig: {
        antispamEnabled: true, // 指定消息是否需要经过安全通。默认为 true
      },
      locationInfo: {
        x: 0, // 空间位置 X 坐标
        y: 0, // 空间位置 Y 坐标
        z: 0, // 空间位置 Z 坐标
      },
    },
    null,
    2
  ),
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMChatroomService.sendMessage`;

const SendMessagePage = () => {
  // 表单数据
  const [createForm] = Form.useForm<CreateMessageFormValues>();
  const [sendForm] = Form.useForm<SendMessageFormValues>();

  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 创建的消息对象
  const [createdMessage, setCreatedMessage] = useState<V2NIMChatroomMessage | null>(null);

  // 选择的文件
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 创建消息
  const handleCreateMessage = async (values: CreateMessageFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { messageType } = values;
    let nimMessage: V2NIMChatroomMessage | null = null;

    try {
      switch (messageType) {
        case 'text':
          nimMessage = window.chatroomV2.V2NIMChatroomMessageCreator.createTextMessage(
            values.text || ''
          );
          break;
        case 'location':
          nimMessage = window.chatroomV2.V2NIMChatroomMessageCreator.createLocationMessage(
            values.latitude || 0,
            values.longitude || 0,
            values.address || ''
          );
          break;
        case 'custom':
          nimMessage = window.chatroomV2.V2NIMChatroomMessageCreator.createCustomMessage(
            values.rawAttachment || ''
          );
          break;
        case 'image':
          if (!selectedFile) {
            message.error('请选择图片文件');
            return;
          }
          nimMessage = window.chatroomV2.V2NIMChatroomMessageCreator.createImageMessage(
            selectedFile,
            values.fileName || selectedFile.name,
            values.sceneName || 'nim_default_im',
            values.width || 0,
            values.height || 0
          );
          break;
        case 'audio':
          if (!selectedFile) {
            message.error('请选择音频文件');
            return;
          }
          nimMessage = window.chatroomV2.V2NIMChatroomMessageCreator.createAudioMessage(
            selectedFile,
            values.fileName || selectedFile.name,
            values.sceneName || 'nim_default_im',
            values.duration || 0
          );
          break;
        case 'video':
          if (!selectedFile) {
            message.error('请选择视频文件');
            return;
          }
          nimMessage = window.chatroomV2.V2NIMChatroomMessageCreator.createVideoMessage(
            selectedFile,
            values.fileName || selectedFile.name,
            values.sceneName || 'nim_default_im',
            values.duration || 0,
            values.width || 0,
            values.height || 0
          );
          break;
        case 'file':
          if (!selectedFile) {
            message.error('请选择文件');
            return;
          }
          nimMessage = window.chatroomV2.V2NIMChatroomMessageCreator.createFileMessage(
            selectedFile,
            values.fileName || selectedFile.name,
            values.sceneName || 'nim_default_im'
          );
          break;
        default:
          message.error('暂不支持该消息类型的演示');
          return;
      }

      if (nimMessage) {
        setCreatedMessage(nimMessage);
        console.log('创建消息成功:', nimMessage);
        message.success(`${messageTypes.find(t => t.value === messageType)?.label}创建成功`);
      }
    } catch (error) {
      const err = error as Error;
      console.error('创建消息失败:', err.toString());
      message.error('创建消息失败');
    }
  };

  // 发送消息
  const handleSendMessage = async (values: SendMessageFormValues) => {
    if (!window.chatroomV2) {
      message.error('聊天室 SDK 尚未初始化');
      return;
    }

    if (!createdMessage) {
      message.error('请先创建消息');
      return;
    }

    const { enableAdvanced, params } = values;

    setLoading(true);

    let sendParams = undefined;
    try {
      if (enableAdvanced && params) {
        sendParams = JSON.parse(params);
      }
    } catch (error) {
      const err = error as Error;
      message.error('参数格式错误，请检查高级配置');
      console.error('参数解析失败:', err.toString());
      setLoading(false);
      return;
    }

    // 打印 API 入参
    console.log(
      'API V2NIMChatroomService.sendMessage execute, params:',
      createdMessage,
      sendParams
    );

    // 执行 API
    const [error, result] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.sendMessage(createdMessage, sendParams)
    );

    setLoading(false);

    if (error) {
      message.error(`发送消息失败: ${error.toString()}`);
      console.error('发送消息失败:', error.toString());
    } else {
      message.success('发送消息成功');
      console.log('发送消息成功, 结果:', result);
      // 存储最终执行的参数
      localStorage.setItem(
        storageKey,
        JSON.stringify({ createValues: createForm.getFieldsValue(), sendValues: values })
      );
    }
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    createForm.setFieldsValue(defaultCreateMessageFormValues);
    sendForm.setFieldsValue(defaultSendMessageFormValues);
    setCreatedMessage(null);
    setSelectedFile(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const createValues = createForm.getFieldsValue();
    const sendValues = sendForm.getFieldsValue();

    if (!createdMessage) {
      message.error('请先创建消息');
      return;
    }

    const { messageType } = createValues;

    let createStatement = '';
    switch (messageType) {
      case 'text':
        createStatement = `const message = chatroomV2.V2NIMChatroomMessageCreator.createTextMessage("${createValues.text}");`;
        break;
      case 'location':
        createStatement = `const message = chatroomV2.V2NIMChatroomMessageCreator.createLocationMessage(${createValues.latitude}, ${createValues.longitude}, "${createValues.address}");`;
        break;
      case 'custom':
        createStatement = `const message = chatroomV2.V2NIMChatroomMessageCreator.createCustomMessage('${createValues.rawAttachment}');`;
        break;
      case 'image':
        createStatement = `const message = chatroomV2.V2NIMChatroomMessageCreator.createImageMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}", ${createValues.width}, ${createValues.height});`;
        break;
      case 'audio':
        createStatement = `const message = chatroomV2.V2NIMChatroomMessageCreator.createAudioMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}", ${createValues.duration});`;
        break;
      case 'video':
        createStatement = `const message = chatroomV2.V2NIMChatroomMessageCreator.createVideoMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}", ${createValues.duration}, ${createValues.width}, ${createValues.height});`;
        break;
      case 'file':
        createStatement = `const message = chatroomV2.V2NIMChatroomMessageCreator.createFileMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}");`;
        break;
      default:
        createStatement = `// 创建${messageTypes.find(t => t.value === messageType)?.label}的代码`;
    }

    const sendStatement =
      sendValues.enableAdvanced && sendValues.params
        ? `const result = await chatroomV2.V2NIMChatroomService.sendMessage(message, ${sendValues.params});`
        : `const result = await chatroomV2.V2NIMChatroomService.sendMessage(message);`;

    const fullStatement = `${createStatement}\n${sendStatement}`;

    console.log('V2NIMChatroomService.sendMessage 调用语句:');
    console.log(fullStatement);
    message.success('调用语句已输出到控制台');
  };

  // 文件上传前的处理
  const beforeUpload = (file: File) => {
    setSelectedFile(file);
    const fileName = file.name;
    createForm.setFieldsValue({ fileName });

    // 根据文件类型自动填充一些参数
    if (file.type.startsWith('image/')) {
      // 对于图片，可以获取尺寸信息
      const img = new Image();
      img.onload = () => {
        createForm.setFieldsValue({
          width: img.width,
          height: img.height,
        });
      };
      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      // 对于视频，可以获取时长和尺寸信息
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        createForm.setFieldsValue({
          duration: Math.floor(video.duration * 1000), // 转换为毫秒
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('audio/')) {
      // 对于音频，可以获取时长信息
      const audio = document.createElement('audio');
      audio.onloadedmetadata = () => {
        createForm.setFieldsValue({
          duration: Math.floor(audio.duration * 1000), // 转换为毫秒
        });
      };
      audio.src = URL.createObjectURL(file);
    }

    return false; // 阻止自动上传
  };

  // 渲染消息类型对应的表单项
  const renderMessageTypeForm = (messageType: string) => {
    switch (messageType) {
      case 'text':
        return (
          <Form.Item
            label="文本内容"
            name="text"
            rules={[{ required: true, message: '请输入文本内容' }]}
          >
            <TextArea rows={3} placeholder="请输入要发送的文本内容" />
          </Form.Item>
        );
      case 'location':
        return (
          <>
            <Form.Item
              label="纬度"
              name="latitude"
              rules={[{ required: true, message: '请输入纬度' }]}
            >
              <Input type="number" placeholder="请输入纬度，如：39.9042" />
            </Form.Item>
            <Form.Item
              label="经度"
              name="longitude"
              rules={[{ required: true, message: '请输入经度' }]}
            >
              <Input type="number" placeholder="请输入经度，如：116.4074" />
            </Form.Item>
            <Form.Item
              label="地址"
              name="address"
              rules={[{ required: true, message: '请输入地址' }]}
            >
              <Input placeholder="请输入地址，如：北京市朝阳区" />
            </Form.Item>
          </>
        );
      case 'custom':
        return (
          <>
            <Form.Item
              label="附件数据"
              name="rawAttachment"
              rules={[{ required: true, message: '请输入附件数据' }]}
            >
              <TextArea rows={3} placeholder="请输入JSON格式的附件数据" />
            </Form.Item>
          </>
        );
      case 'image':
        return (
          <>
            <Form.Item
              label="选择图片"
              name="file"
              rules={[{ required: true, message: '请选择图片文件' }]}
            >
              <Upload
                beforeUpload={beforeUpload}
                maxCount={1}
                accept="image/*"
                fileList={
                  selectedFile ? [{ uid: '1', name: selectedFile.name, status: 'done' }] : []
                }
                onRemove={() => {
                  setSelectedFile(null);
                  createForm.setFieldsValue({ fileName: '', width: 0, height: 0 });
                }}
              >
                <Button icon={<UploadOutlined />}>选择图片文件</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="文件名" name="fileName">
              <Input placeholder="文件名（自动填充）" />
            </Form.Item>
            <Form.Item label="场景名称" name="sceneName">
              <Input placeholder="请输入场景名称，如：default" />
            </Form.Item>
            <Form.Item label="宽度" name="width">
              <Input type="number" placeholder="图片宽度（像素，自动获取）" />
            </Form.Item>
            <Form.Item label="高度" name="height">
              <Input type="number" placeholder="图片高度（像素，自动获取）" />
            </Form.Item>
          </>
        );
      case 'audio':
        return (
          <>
            <Form.Item
              label="选择音频"
              name="file"
              rules={[{ required: true, message: '请选择音频文件' }]}
            >
              <Upload
                beforeUpload={beforeUpload}
                maxCount={1}
                accept="audio/*"
                fileList={
                  selectedFile ? [{ uid: '1', name: selectedFile.name, status: 'done' }] : []
                }
                onRemove={() => {
                  setSelectedFile(null);
                  createForm.setFieldsValue({ fileName: '', duration: 0 });
                }}
              >
                <Button icon={<UploadOutlined />}>选择音频文件</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="文件名" name="fileName">
              <Input placeholder="文件名（自动填充）" />
            </Form.Item>
            <Form.Item label="场景名称" name="sceneName">
              <Input placeholder="请输入场景名称，如：default" />
            </Form.Item>
            <Form.Item label="时长（毫秒）" name="duration">
              <Input type="number" placeholder="音频时长（毫秒，自动获取）" />
            </Form.Item>
          </>
        );
      case 'video':
        return (
          <>
            <Form.Item
              label="选择视频"
              name="file"
              rules={[{ required: true, message: '请选择视频文件' }]}
            >
              <Upload
                beforeUpload={beforeUpload}
                maxCount={1}
                accept="video/*"
                fileList={
                  selectedFile ? [{ uid: '1', name: selectedFile.name, status: 'done' }] : []
                }
                onRemove={() => {
                  setSelectedFile(null);
                  createForm.setFieldsValue({ fileName: '', duration: 0, width: 0, height: 0 });
                }}
              >
                <Button icon={<UploadOutlined />}>选择视频文件</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="文件名" name="fileName">
              <Input placeholder="文件名（自动填充）" />
            </Form.Item>
            <Form.Item label="场景名称" name="sceneName">
              <Input placeholder="请输入场景名称，如：default" />
            </Form.Item>
            <Form.Item label="时长（毫秒）" name="duration">
              <Input type="number" placeholder="视频时长（毫秒，自动获取）" />
            </Form.Item>
            <Form.Item label="宽度" name="width">
              <Input type="number" placeholder="视频宽度（像素，自动获取）" />
            </Form.Item>
            <Form.Item label="高度" name="height">
              <Input type="number" placeholder="视频高度（像素，自动获取）" />
            </Form.Item>
          </>
        );
      case 'file':
        return (
          <>
            <Form.Item
              label="选择文件"
              name="file"
              rules={[{ required: true, message: '请选择文件' }]}
            >
              <Upload
                beforeUpload={beforeUpload}
                maxCount={1}
                fileList={
                  selectedFile ? [{ uid: '1', name: selectedFile.name, status: 'done' }] : []
                }
                onRemove={() => {
                  setSelectedFile(null);
                  createForm.setFieldsValue({ fileName: '' });
                }}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="文件名" name="fileName">
              <Input placeholder="文件名（自动填充）" />
            </Form.Item>
            <Form.Item label="场景名称" name="sceneName">
              <Input placeholder="请输入场景名称，如：default" />
            </Form.Item>
          </>
        );
      default:
        return (
          <div style={{ color: '#999', padding: '20px', textAlign: 'center' }}>未知的消息类型</div>
        );
    }
  };

  return (
    <div className={styles.formContainer}>
      <Form.Item key="api" label={null} className={styles.leftAligned}>
        <p className={styles.interfaceAPI}>
          <a
            href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/chatroom/index.html#V2NIMChatroomService`}
            target="_blank"
          >
            {storageKey}
          </a>
        </p>
      </Form.Item>

      {/* 第一个表单：创建消息 */}
      <Card title="第一步：创建消息" style={{ marginBottom: 16 }}>
        <Form
          form={createForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={handleCreateMessage}
          initialValues={defaultCreateMessageFormValues}
        >
          <Form.Item
            label="消息类型"
            name="messageType"
            rules={[{ required: true, message: '请选择消息类型' }]}
          >
            <Select placeholder="请选择要创建的消息类型">
              {messageTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.messageType !== currentValues.messageType
            }
          >
            {({ getFieldValue }) => {
              const messageType = getFieldValue('messageType');
              return renderMessageTypeForm(messageType);
            }}
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              创建消息
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 第二个表单：发送消息 */}
      <Card title="第二步：发送消息到当前聊天室" style={{ marginBottom: 16 }}>
        <Form
          form={sendForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={handleSendMessage}
          initialValues={defaultSendMessageFormValues}
        >
          <Form.Item
            label="高级配置"
            name="enableAdvanced"
            valuePropName="checked"
            tooltip="启用高级配置参数"
          >
            <Checkbox>启用高级配置（发送参数配置）</Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.enableAdvanced !== currentValues.enableAdvanced
            }
          >
            {({ getFieldValue }) => {
              const enableAdvanced = getFieldValue('enableAdvanced');
              return enableAdvanced ? (
                <Form.Item
                  label="发送参数"
                  name="params"
                  tooltip="JSON格式的发送参数，包含消息配置、路由配置等"
                >
                  <TextArea rows={10} placeholder="请输入JSON格式的发送参数" />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item label={null}>
            <Space size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ flex: 1 }}
                disabled={!createdMessage}
              >
                发送消息
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
      </Card>

      {/* 消息状态显示 */}
      {createdMessage && (
        <Card title="已创建的消息" style={{ marginBottom: 16 }} size="small">
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: 12,
              borderRadius: 4,
              fontFamily: 'monospace',
            }}
          >
            {JSON.stringify(createdMessage, null, 2)}
          </pre>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>创建并发送各种类型的消息到当前聊天室
          </li>
          <li>
            <strong>参数：</strong>message (消息对象), params (可选配置)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMChatroomMessage (发送成功的消息对象)
          </li>
          <li>
            <strong>用途：</strong>支持文本、图片、音频、视频、文件、位置、自定义等消息类型
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
          <li>需要先创建消息对象，再发送到当前聊天室</li>
          <li>文件类型消息会自动获取文件信息（尺寸、时长等）</li>
          <li>发送成功会触发聊天室消息相关事件</li>
          <li>高优先级消息用于重要通知场景（如管理员公告）</li>
          <li>空间音频位置信息用于元宇宙场景</li>
        </ul>
      </Card>
    </div>
  );
};

export default SendMessagePage;
