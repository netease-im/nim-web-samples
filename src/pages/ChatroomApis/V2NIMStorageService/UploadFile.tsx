import { ReloadOutlined, UploadOutlined } from '@ant-design/icons';

import {
  Button,
  Card,
  Form,
  Input,
  Progress,
  Select,
  Space,
  Steps,
  Typography,
  Upload,
  type UploadFile,
  message,
} from 'antd';
import {
  type V2NIMStorageScene,
  type V2NIMUploadFileTask,
} from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMStorageService';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../chatroom.module.less';

const { Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const STORAGE_KEY = 'chatroomV2_V2NIMStorageService_uploadFile_params';

interface FormValues {
  file: UploadFile[];
  fileName: string;
  sceneName: string;
}

const UploadFilePage = () => {
  const [form] = Form.useForm<FormValues>();
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadTask, setUploadTask] = useState<V2NIMUploadFileTask | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [sceneList, setSceneList] = useState<V2NIMStorageScene[]>([]);
  const [sceneListLoading, setSceneListLoading] = useState(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): FormValues => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedStored = JSON.parse(stored);
      return {
        file: [],
        fileName: parsedStored.fileName || '',
        sceneName: parsedStored.sceneName || 'nim_default_im',
      };
    }
    return {
      file: [],
      fileName: '',
      sceneName: 'nim_default_im',
    };
  };

  const initialValues = getInitialValues();

  // 获取场景列表
  const fetchSceneList = async () => {
    if (!window.chatroomV2) {
      message.warning('聊天室 SDK 尚未初始化');
      return;
    }

    setSceneListLoading(true);

    const [error, result] = await to(() =>
      window.chatroomV2?.V2NIMStorageService.getStorageSceneList()
    );

    setSceneListLoading(false);

    if (error) {
      console.error('获取场景列表失败:', error);
      message.error('获取场景列表失败');
      return;
    }

    if (result && Array.isArray(result)) {
      console.log('获取场景列表成功:', result);
      setSceneList(result);
      message.success(`获取到 ${result.length} 个存储场景`);
    }
  };

  // 组件加载时获取场景列表
  useEffect(() => {
    fetchSceneList();
  }, []);

  // 文件上传前的检查
  const beforeUpload = (file: File) => {
    // 这里不实际上传文件，只是检查文件
    const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB限制
    if (!isValidSize) {
      message.error('文件大小不能超过 100MB!');
      return false;
    }

    return false; // 阻止自动上传，我们会在提交时处理文件
  };

  // 文件选择变化处理
  const handleFileChange = (info: any) => {
    const { fileList } = info;

    // 只保留必要的文件信息，避免循环引用警告
    const cleanFileList = fileList.map((file: UploadFile) => ({
      uid: file.uid,
      name: file.name,
      status: file.status,
      originFileObj: file.originFileObj,
    }));

    form.setFieldValue('file', cleanFileList);

    // 如果选择了文件且未设置文件名，自动设置文件名
    if (fileList.length > 0) {
      form.setFieldValue('fileName', fileList[0].name);
    }

    // 重置状态
    setUploadTask(null);
    setUploadResult('');
    setUploadProgress(0);
    setCurrentStep(0);
  };

  // 第一步：创建上传任务
  const createUploadTask = async (values: FormValues) => {
    if (!window.chatroomV2) {
      message.error('聊天室 SDK 尚未初始化');
      return null;
    }

    if (!window.chatroomV2.getChatroomInfo()) {
      message.error('用户尚未登录');
      return null;
    }

    if (!values.file || values.file.length === 0) {
      message.error('请选择要上传的文件');
      return null;
    }

    const file = values.file[0].originFileObj as File;
    if (!file) {
      message.error('无法获取文件对象');
      return null;
    }

    setCreateTaskLoading(true);

    // 构建参数
    const params = {
      file,
      fileName: values.fileName || file.name,
      sceneName: values.sceneName,
    };

    console.log('API V2NIMStorageService.createUploadFileTask execute with params:', params);

    // 调用创建上传任务API
    const [error, result] = await to(() =>
      window.chatroomV2?.V2NIMStorageService.createUploadFileTask({
        fileObj: params.file,
        sceneName: params.sceneName,
      })
    );

    setCreateTaskLoading(false);

    if (error) {
      message.error(`创建上传任务失败: ${error.toString()}`);
      console.error('创建上传任务失败:', error.toString());
      return null;
    }

    if (result) {
      console.log('创建上传任务成功:', result);
      setUploadTask(result);
      setCurrentStep(1);
      message.success('创建上传任务成功');

      // 保存参数到 localStorage
      const paramsToStore = {
        fileName: params.fileName,
        sceneName: params.sceneName,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paramsToStore));

      return result;
    }
  };

  // 第二步：上传文件
  const uploadFile = async (task: any) => {
    if (!window.chatroomV2) {
      message.error('聊天室 SDK 尚未初始化');
      return;
    }

    if (!task) {
      message.error('上传任务信息无效');
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);

    console.log('API V2NIMStorageService.uploadFile execute with task:', task);

    // 创建进度回调函数
    const onProgress = (progress: number) => {
      setUploadProgress(progress);
      console.log('上传进度:', progress + '%');
    };

    // 调用上传文件API
    const [error, result] = await to(() =>
      window.chatroomV2?.V2NIMStorageService.uploadFile(task, onProgress)
    );

    setUploadLoading(false);

    if (error) {
      message.error(`文件上传失败: ${error.toString()}`);
      console.error('文件上传失败:', error.toString());
      setCurrentStep(1); // 保持在第一步
      return;
    }

    if (result) {
      console.log('文件上传成功:', result);
      setUploadResult(result);
      setCurrentStep(2);
      setUploadProgress(100);
      message.success('文件上传成功');
    }
  };

  // 取消上传文件
  const cancelUploadFile = async () => {
    if (!window.chatroomV2) {
      message.error('聊天室 SDK 尚未初始化');
      return;
    }

    if (!uploadTask) {
      message.error('没有正在进行的上传任务');
      return;
    }

    console.log('API V2NIMStorageService.cancelUploadFile execute with task:', uploadTask);

    // 调用取消上传API
    const [error, result] = await to(() =>
      window.chatroomV2?.V2NIMStorageService.cancelUploadFile(uploadTask)
    );

    if (error) {
      message.error(`取消上传失败: ${error.toString()}`);
      console.error('取消上传失败:', error.toString());
      return;
    }

    console.log('取消上传成功:', result);
    message.success('已取消上传');

    // 重置上传相关状态
    setUploadLoading(false);
    setUploadProgress(0);
    setCurrentStep(1); // 回到创建任务完成状态
  };

  // 完整流程：创建任务并上传
  const onFinish = async (values: FormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }
    // 第一步：创建上传任务
    const task = await createUploadTask(values);

    if (task) {
      // 第二步：上传文件
      await uploadFile(task);
    }
  };

  // 仅上传文件（当已有任务时）
  const handleUploadOnly = () => {
    if (uploadTask) {
      uploadFile(uploadTask);
    } else {
      message.error('请先创建上传任务');
    }
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();

    if (!values.file || values.file.length === 0) {
      message.error('请先选择文件');
      return;
    }

    const createTaskStatement = `const uploadTask = await window.chatroomV2.V2NIMStorageService.createUploadFileTask({
  fileObj: file,
  sceneName: "${values.sceneName}"
});`;

    const uploadStatement = `const result = await window.chatroomV2.V2NIMStorageService.uploadFile(uploadTask, (progress) => {
  console.log('进度:', progress + '%');
});`;

    const fullCode = `// 第一步：创建上传任务\n${createTaskStatement}\n\n// 第二步：上传文件\n${uploadStatement}`;

    console.log('V2NIMStorageService.uploadFile 完整调用语句:');
    console.log(fullCode);
    message.success('调用语句已输出到控制台');
  };

  // 重置所有状态
  const handleReset = () => {
    setUploadTask(null);
    setUploadResult('');
    setUploadProgress(0);
    setCurrentStep(0);
    form.setFieldValue('file', []);
    message.info('已重置所有状态');
  };

  return (
    <div className={styles.formContainer}>
      {/* 步骤指示器 */}
      <Card title="上传流程" style={{ marginBottom: 16 }} size="small">
        <Steps current={currentStep}>
          <Step title="选择文件" description="选择要上传的文件" />
          <Step title="创建任务" description="创建上传任务" />
          <Step title="上传完成" description="文件上传成功" />
        </Steps>
      </Card>

      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={onFinish}
        initialValues={initialValues}
        style={{ marginTop: 24 }}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMStorageService`}
              target="_blank"
            >
              V2NIMStorageService.uploadFile
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="选择文件"
          name="file"
          rules={[{ required: true, message: '请选择要上传的文件' }]}
          valuePropName="fileList"
          getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            maxCount={1}
            accept="*/*"
            showUploadList={{
              showPreviewIcon: false,
              showRemoveIcon: true,
            }}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="文件名" name="fileName" tooltip="上传后的文件名，为空时使用原始文件名">
          <Input placeholder="请输入文件名（可选）" />
        </Form.Item>

        <Form.Item
          label="场景名称"
          name="sceneName"
          tooltip="文件存储场景名称"
          rules={[{ required: true, message: '请选择场景名称' }]}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Select placeholder="请选择场景名称" style={{ flex: 1 }}>
              {sceneList.map(scene => (
                <Option key={scene.sceneName} value={scene.sceneName}>
                  {scene.sceneName}
                  {scene.expireTime !== undefined && scene.expireTime > 0
                    ? ` (过期时间: ${scene.expireTime}秒)`
                    : ' (永不过期)'}
                </Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSceneList}
              loading={sceneListLoading}
              title="刷新场景列表"
            >
              刷新
            </Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={createTaskLoading || uploadLoading}
              style={{ flex: 1 }}
            >
              {createTaskLoading ? '创建任务中...' : uploadLoading ? '上传中...' : '创建任务并上传'}
            </Button>
            {uploadTask && !uploadResult && (
              <Button type="default" onClick={handleUploadOnly} loading={uploadLoading}>
                仅上传文件
              </Button>
            )}
            {uploadTask && uploadLoading && (
              <Button type="default" onClick={cancelUploadFile} danger>
                取消上传
              </Button>
            )}
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
            <Button type="default" onClick={handleReset}>
              重置状态
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 上传任务信息 */}
      {uploadTask && (
        <Card title="上传任务信息" style={{ marginTop: 16 }} size="small">
          <div style={{ marginBottom: 8 }}>
            <Text strong>任务ID: </Text>
            <Text code>{uploadTask.taskId || '无'}</Text>
          </div>
        </Card>
      )}

      {/* 上传进度 */}
      {(uploadLoading || uploadProgress > 0) && (
        <Card title="上传进度" style={{ marginTop: 16 }} size="small">
          <Progress
            percent={uploadProgress}
            status={uploadLoading ? 'active' : uploadProgress === 100 ? 'success' : 'normal'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
            {uploadLoading ? '正在上传文件...' : uploadProgress === 100 ? '上传完成' : '等待上传'}
          </Text>
        </Card>
      )}

      {/* 上传结果展示 */}
      {uploadResult && (
        <Card title="上传结果" style={{ marginTop: 16 }} size="small">
          <div style={{ marginBottom: 8 }}>
            <Text strong>文件URL: </Text>
            <Text code style={{ wordBreak: 'break-all' }}>
              {uploadResult || '无'}
            </Text>
          </div>
          <div>
            <Text strong>完整信息: </Text>
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
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>执行文件上传操作
          </li>
          <li>
            <strong>参数：</strong>uploadTask (上传任务对象来自 createUploadFileTask API),
            onProgress (进度回调函数)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;UploadResult&gt; (上传结果对象)
          </li>
          <li>
            <strong>用途：</strong>将文件实际上传到云信存储服务
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
          <li>必须先调用 createUploadFileTask 创建上传任务</li>
          <li>
            对于 createUploadFileTask 补充说明: 浏览器环境输入 File 对象, uniapp/小程序输入 filePath
            即可
          </li>
          <li>上传过程中会显示实时进度</li>
          <li>支持上传进度回调监听</li>
          <li>网络异常时, 同一实例里重试上传, 会保留任务信息进行断点续传</li>
        </ul>
      </Card>
    </div>
  );
};

export default UploadFilePage;
