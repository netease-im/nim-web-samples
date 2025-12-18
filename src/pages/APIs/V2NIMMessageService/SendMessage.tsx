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
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;
const { TextArea } = Input;

// 消息类型枚举
const messageTypes = [
  { value: 'text', label: '文本消息' },
  { value: 'image', label: '图片消息' },
  { value: 'audio', label: '音频消息' },
  { value: 'video', label: '视频消息' },
  { value: 'file', label: '文件消息' },
  { value: 'location', label: '位置消息' },
  { value: 'custom', label: '自定义消息' },
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
  customText?: string;
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
  conversationId: string;
  enableAdvanced: boolean;
  params?: string;
}

const defaultCreateMessageFormValues: CreateMessageFormValues = {
  messageType: 'text',
  text: 'Hello, this is a test message!',
  latitude: 39.9042,
  longitude: 116.4074,
  address: '北京市朝阳区',
  customText: 'Custom message',
  rawAttachment: '{"type": "custom", "data": "test"}',
  fileName: '',
  sceneName: 'nim_default_im',
  width: 0,
  height: 0,
  duration: 0,
};

const defaultSendMessageFormValues: SendMessageFormValues = {
  conversationId: '',
  enableAdvanced: false,
  params: JSON.stringify(
    {
      messageConfig: {
        readReceiptEnabled: false, // 是否需要消息(群消息)已读回执。默认为 false
        historyEnabled: true, // 是否需要在服务端保存历史消息。默认为 true
        roamingEnabled: true, // 是否需要漫游消息。默认为 true
        onlineSyncEnabled: true, // 是否需要发送方多端在线同步消息。默认为 true
        offlineEnabled: true, // 是否需要存离线消息。默认为 true
        lastMessageUpdateEnabled: true, // 是否需要计算会话的最后一条消息属性。默认为 true
        unreadEnabled: true, // 是否需要计算未读数。默认为 true
      },
      routeConfig: {
        routeEnabled: true, // 是否需要路由消息（抄送）。默认为 true
        // routeEnvironment: 'TestEnv', // 环境变量，用于指向不同的抄送，第三方回调等配置
      },
      pushConfig: {
        pushEnabled: true, // 是否需要推送消息。默认为 true
        pushNickEnabled: true, // 是否需要推送消息发送者昵称。默认 true
        // pushContent: '您有新的消息请注意查收', // 推送文案
        // pushPayload: '', // 推送自定义 pushPayload
        forcePush: false, // 是否需要强制推送，忽略用户消息提醒相关设置。该设置仅在群聊时有效。默认为 false
        // forcePushContent?: string, // 强制推送文案。该设置仅在群聊时有效
        // forcePushAccountIds?: string[], // 强制推送目标账号列表。该设置仅在群聊时有效
      },
      antispamConfig: {
        antispamEnabled: true, // 指定消息是否需要经过安全通。默认为 true
        // antispamBusinessId?: string; // 指定易盾业务id
        // antispamCustomMessage?: string; // 自定义消息中需要反垃圾的内容，仅当消息类型为自定义消息时有效
        // antispamCheating?: string; // 易盾反作弊，辅助检测数据，json格式
        // antispamExtension?: string; // 易盾反垃圾，增强检测数据，json格式
      },
      clientAntispamEnabled: false, // 是否启用本地反垃圾. 默认 false.
      clientAntispamReplace: '******', // 本地反垃圾命中后的替换文本
    },
    null,
    2
  ),
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMMessageService.sendMessage`;

const SendMessagePage = () => {
  // 表单数据
  const [createForm] = Form.useForm();
  const [sendForm] = Form.useForm();

  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 会话列表
  const [conversations, setConversations] = useState<V2NIMLocalConversation[]>([]);
  // 获取会话列表的加载状态
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // 创建的消息对象
  const [createdMessage, setCreatedMessage] = useState<V2NIMMessage | null>(null);

  // 选择的文件
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取会话列表
  const getConversationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setConversationsLoading(true);
    console.log('API V2NIMLocalConversationService.getConversationList execute');
    const [error, result] = await to(() =>
      window.nim?.V2NIMLocalConversationService.getConversationList(0, 50)
    );
    setConversationsLoading(false);
    if (error) {
      message.error(`获取会话列表失败: ${error}`);
      console.error('获取会话列表失败:', error.toString());
      setConversations([]);
      return;
    }
    if (result) {
      console.log('获取到的会话列表:', result);
      setConversations(result.conversationList || []);

      if (!result.conversationList || result.conversationList.length === 0) {
        message.info('当前没有会话记录');
      } else {
        message.success(`获取到 ${result.conversationList.length} 个会话`);
      }
    }
  };

  // 页面加载时自动获取会话列表
  useEffect(() => {
    // 防止重复加载
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationList();
    }
  }, []);

  // 创建消息
  const handleCreateMessage = async (values: CreateMessageFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { messageType } = values;
    let nimMessage: V2NIMMessage | null = null;

    try {
      switch (messageType) {
        case 'text':
          nimMessage = window.nim.V2NIMMessageCreator.createTextMessage(values.text || '');
          break;
        case 'location':
          nimMessage = window.nim.V2NIMMessageCreator.createLocationMessage(
            values.latitude || 0,
            values.longitude || 0,
            values.address || ''
          );
          break;
        case 'custom':
          nimMessage = window.nim.V2NIMMessageCreator.createCustomMessage(
            values.customText || '',
            values.rawAttachment || ''
          );
          break;
        case 'image':
          if (!selectedFile) {
            message.error('请选择图片文件');
            return;
          }
          nimMessage = window.nim.V2NIMMessageCreator.createImageMessage(
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
          nimMessage = window.nim.V2NIMMessageCreator.createAudioMessage(
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
          nimMessage = window.nim.V2NIMMessageCreator.createVideoMessage(
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
          nimMessage = window.nim.V2NIMMessageCreator.createFileMessage(
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
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    if (!createdMessage) {
      message.error('请先创建消息');
      return;
    }

    const { conversationId, enableAdvanced, params } = values;
    if (!conversationId) {
      message.error('请选择会话');
      return;
    }

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
    } finally {
      setLoading(false);
    }

    // 打印 API 入参
    console.log(
      'API V2NIMMessageService.sendMessage execute, params:',
      createdMessage,
      conversationId,
      sendParams
    );

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMMessageService.sendMessage(createdMessage, conversationId, sendParams)
    );

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

    if (!sendValues.conversationId) {
      message.error('请先选择会话');
      return;
    }

    let createStatement = '';
    const { messageType } = createValues;

    switch (messageType) {
      case 'text':
        createStatement = `const message = nim.V2NIMMessageCreator.createTextMessage("${createValues.text}");`;
        break;
      case 'location':
        createStatement = `const message = nim.V2NIMMessageCreator.createLocationMessage(${createValues.latitude}, ${createValues.longitude}, "${createValues.address}");`;
        break;
      case 'custom':
        createStatement = `const message = nim.V2NIMMessageCreator.createCustomMessage("${createValues.customText}", '${createValues.rawAttachment}');`;
        break;
      case 'image':
        createStatement = `const message = nim.V2NIMMessageCreator.createImageMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}", ${createValues.width}, ${createValues.height});`;
        break;
      case 'audio':
        createStatement = `const message = nim.V2NIMMessageCreator.createAudioMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}", ${createValues.duration});`;
        break;
      case 'video':
        createStatement = `const message = nim.V2NIMMessageCreator.createVideoMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}", ${createValues.duration}, ${createValues.width}, ${createValues.height});`;
        break;
      case 'file':
        createStatement = `const message = nim.V2NIMMessageCreator.createFileMessage(fileObject, "${createValues.fileName}", "${createValues.sceneName}");`;
        break;
      default:
        createStatement = `// 创建${messageTypes.find(t => t.value === messageType)?.label}的代码`;
    }

    const sendStatement =
      sendValues.enableAdvanced && sendValues.params
        ? `const result = await nim.V2NIMMessageService.sendMessage(message, "${sendValues.conversationId}", ${sendValues.params});`
        : `const result = await nim.V2NIMMessageService.sendMessage(message, "${sendValues.conversationId}");`;

    const fullStatement = `${createStatement}\n${sendStatement}`;

    console.log('V2NIMMessageService.sendMessage 调用语句:');
    console.log(fullStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化会话显示信息
  const formatConversationLabel = (conversation: V2NIMLocalConversation) => {
    const typeMap: { [key: number]: string } = {
      1: 'P2P',
      2: '群聊',
      3: '超大群',
    };

    const conversationType = typeMap[conversation.type] || '未知';
    const lastMessageTime = conversation.updateTime
      ? new Date(conversation.updateTime).toLocaleString()
      : '无消息';

    return `${conversationType} - ${conversation.conversationId} - ${lastMessageTime}`;
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
              label="自定义文本"
              name="customText"
              rules={[{ required: true, message: '请输入自定义文本' }]}
            >
              <Input placeholder="请输入自定义消息的文本内容" />
            </Form.Item>
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
            href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMMessageService`}
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
      <Card title="第二步：发送消息" style={{ marginBottom: 16 }}>
        <Form
          form={sendForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={handleSendMessage}
          initialValues={defaultSendMessageFormValues}
        >
          <Form.Item
            label="选择会话"
            name="conversationId"
            tooltip="选择要发送消息的会话"
            rules={[{ required: true, message: '请选择要发送消息的会话' }]}
          >
            <Select
              placeholder="请选择要发送消息的会话"
              loading={conversationsLoading}
              notFoundContent={conversationsLoading ? '获取中...' : '暂无会话记录'}
              dropdownRender={menu => (
                <div>
                  {menu}
                  <div style={{ padding: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      type="link"
                      onClick={getConversationList}
                      loading={conversationsLoading}
                      style={{ padding: 0 }}
                    >
                      刷新会话列表
                    </Button>
                  </div>
                </div>
              )}
            >
              {conversations.map(conversation => (
                <Option key={conversation.conversationId} value={conversation.conversationId}>
                  {formatConversationLabel(conversation)}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
            <strong>功能：</strong>创建并发送各种类型的消息到指定会话
          </li>
          <li>
            <strong>参数：</strong>message (消息对象), conversationId (会话ID), params (可选配置)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMMessage (发送成功的消息对象)
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
          <li>需要先创建消息对象，再发送到指定会话</li>
          <li>文件类型消息会自动获取文件信息（尺寸、时长等）</li>
          <li>发送成功会触发 onSendMessage 事件</li>
          <li>小程序/uniapp 中文件参数传入 filePath 字符串</li>
        </ul>
      </Card>
    </div>
  );
};

export default SendMessagePage;
