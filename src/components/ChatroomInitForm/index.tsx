import {
  Button,
  Card,
  Collapse,
  Form,
  Input,
  List,
  Select,
  Space,
  Switch,
  Tag,
  message,
} from 'antd';
import V2NIMChatroomClient from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK';
import {
  DebugLevel,
  V2NIMChatroomEnterParams,
} from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

interface ChatroomInstance {
  instanceId: number;
  appkey: string;
  debugLevel: string;
  roomId?: string;
  accountId?: string;
}

interface CreateInstanceFormValues {
  appkey: string;
  debugLevel: DebugLevel;
  // 开关配置
  enableCloudStorage: boolean;
  enableReporter: boolean;
  enableAbtest: boolean;
  enableLogger: boolean;
  enableClientAntispam: boolean;
}

interface EnterFormValues {
  accountId: string;
  token: string;
  roomNick?: string;
  roomAvatar?: string;
  serverExtension?: string;
  notificationExtension?: string;
  authType: number;
  linkProvider?: string;
  tokenProvider?: string;
  loginExtensionProvider?: string;
}

// 默认实例参数1
const defaultInstanceParam1 = {
  appkey: '45c6a******************5d0bdd6e',
  debugLevel: 'debug' as DebugLevel,
};

// 默认实例参数2
const defaultInstanceParam2 = {
  cloudStorageConfig: {
    isNeedToGetUploadPolicyFromServer: true,
  },
  reporterConfig: {
    enableCompass: true,
    isDataReportEnable: true,
  },
  abtestConfig: {
    isAbtestEnable: true,
  },
  loggerConfig: {
    storageEnable: true,
    storageName: 'chatroom-logs',
  },
  V2NIMClientAntispamUtilConfig: {
    enable: true,
  },
};

// localStorage key 定义
const STORAGE_KEY_PARAMS1 = 'ChatroomV2Instance-new-params1';
const STORAGE_KEY_PARAMS2 = 'ChatroomV2Instance-new-params2';
const STORAGE_KEY_ENTER = 'ChatroomV2Instance-enter';

// 默认表单值
const getDefaultFormValues = (): CreateInstanceFormValues => ({
  appkey: defaultInstanceParam1.appkey,
  debugLevel: defaultInstanceParam1.debugLevel,
  enableCloudStorage: true,
  enableReporter: true,
  enableAbtest: true,
  enableLogger: true,
  enableClientAntispam: false,
});

const ChatroomInitForm = () => {
  const [createForm] = Form.useForm<CreateInstanceFormValues>();
  const [enterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<ChatroomInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<ChatroomInstance | null>(null);

  // 构建实例参数1
  const buildInstanceParam1 = (values: CreateInstanceFormValues) => {
    return {
      appkey: values.appkey,
      debugLevel: values.debugLevel,
    };
  };

  // 构建实例参数2
  const buildInstanceParam2 = (values: CreateInstanceFormValues) => {
    const param2: any = {};

    // 根据开关添加对应配置
    if (values.enableCloudStorage) {
      param2.cloudStorageConfig = defaultInstanceParam2.cloudStorageConfig;
    }

    if (values.enableReporter) {
      param2.reporterConfig = defaultInstanceParam2.reporterConfig;
    }

    if (values.enableAbtest) {
      param2.abtestConfig = defaultInstanceParam2.abtestConfig;
    }

    if (values.enableLogger) {
      param2.loggerConfig = defaultInstanceParam2.loggerConfig;
    }

    if (values.enableClientAntispam) {
      param2.V2NIMClientAntispamUtilConfig = defaultInstanceParam2.V2NIMClientAntispamUtilConfig;
    }

    return param2;
  };

  // 从localStorage恢复表单值
  const getInitialFormValues = (): CreateInstanceFormValues => {
    try {
      const param1Cache = localStorage.getItem(STORAGE_KEY_PARAMS1);
      const param2Cache = localStorage.getItem(STORAGE_KEY_PARAMS2);

      if (param1Cache && param2Cache) {
        const param1 = JSON.parse(param1Cache);
        const param2 = JSON.parse(param2Cache);

        return {
          appkey: param1.appkey || defaultInstanceParam1.appkey,
          debugLevel: param1.debugLevel || defaultInstanceParam1.debugLevel,
          enableCloudStorage: !!param2.cloudStorageConfig,
          enableReporter: !!param2.reporterConfig,
          enableAbtest: !!param2.abtestConfig,
          enableLogger: !!param2.loggerConfig,
          enableClientAntispam: !!param2.V2NIMClientAntispamUtilConfig,
        };
      }
    } catch (error) {
      console.warn('加载缓存配置失败:', error);
    }

    return getDefaultFormValues();
  };

  // 创建实例
  const handleCreateInstance = async (values: CreateInstanceFormValues) => {
    setLoading(true);

    // 构建参数
    const instanceParam1 = buildInstanceParam1(values);
    const instanceParam2 = buildInstanceParam2(values);

    console.log('创建聊天室实例:', { instanceParam1, instanceParam2 });

    // 调用 newInstance 创建实例
    const [error, instance] = await to(() =>
      V2NIMChatroomClient.newInstance(instanceParam1, instanceParam2)
    );

    setLoading(false);

    if (error) {
      console.error('创建实例失败:', error.toString());
      message.error(`创建实例失败: ${error.toString()}`);
      return;
    }

    if (!instance) {
      console.error('创建实例失败, 没有返回值');
      message.error(`创建实例失败, 没有返回值`);
      return;
    }

    const instanceId = instance.getInstanceId();
    console.log('聊天室实例创建成功, instanceId:', instanceId);

    // 保存到全局，供后续 API 调用
    window.chatroomV2 = instance;

    // 更新实例列表
    const newInstance: ChatroomInstance = {
      instanceId,
      appkey: values.appkey,
      debugLevel: values.debugLevel,
    };
    setInstances(prev => [...prev, newInstance]);

    // 默认选中最新创建的实例
    setSelectedInstance(newInstance);

    // 保存配置到 localStorage
    localStorage.setItem(STORAGE_KEY_PARAMS1, JSON.stringify(instanceParam1));
    localStorage.setItem(STORAGE_KEY_PARAMS2, JSON.stringify(instanceParam2));

    message.success(`实例创建成功 (ID: ${instanceId})，已自动选中`);
  };

  // 输出调用语句
  const handleOutputCreateCode = () => {
    const values = createForm.getFieldsValue();
    const instanceParam1 = buildInstanceParam1(values);
    const instanceParam2 = buildInstanceParam2(values);
    message.success('已输出到控制台');
    console.log(
      `const instance = V2NIMChatroomClient.newInstance(${JSON.stringify(instanceParam1, null, 2)}, ${JSON.stringify(instanceParam2, null, 2)})`
    );
  };

  // 重置创建表单
  const handleResetCreateForm = () => {
    localStorage.removeItem(STORAGE_KEY_PARAMS1);
    localStorage.removeItem(STORAGE_KEY_PARAMS2);
    createForm.setFieldsValue(getDefaultFormValues());
    message.success('已重置为默认配置');
  };

  // 输出所有实例
  const handleGetInstanceList = async () => {
    const [error, instanceList] = await to(() => V2NIMChatroomClient.getInstanceList());

    if (error) {
      console.error('获取实例列表失败:', error.toString());
      message.error(`获取实例列表失败: ${error.toString()}`);
      return;
    }

    if (!instanceList) {
      console.error('获取实例列表失败, 没有返回值');
      message.error(`获取实例列表失败, 没有返回值`);
      return;
    }

    console.log('所有聊天室实例:', instanceList);

    // 更新实例列表
    const updatedInstances: ChatroomInstance[] = instanceList.map((inst: any) => ({
      instanceId: inst.getInstanceId(),
      appkey: inst.options?.appkey || '未知',
      debugLevel: inst.options?.debugLevel || '未知',
      roomId: inst.V2NIMChatroom?.model?.chatroomInfo?.roomId,
      accountId: inst.V2NIMChatroomLoginService?.accountId,
    }));

    setInstances(updatedInstances);
    message.success(`共 ${instanceList.length} 个实例`);
  };

  // 选中实例
  const handleSelectInstance = async (instance: ChatroomInstance) => {
    const [error, inst] = await to(() => V2NIMChatroomClient.getInstance(instance.instanceId));

    if (error) {
      console.error('获取实例失败:', error.toString());
      message.error(`获取实例失败: ${error.toString()}`);
      return;
    }

    if (inst) {
      window.chatroomV2 = inst;
      setSelectedInstance(instance);
      message.info(`已选中实例 ${instance.instanceId}`);
    }
  };

  // 从localStorage恢复进入聊天室表单值
  const getInitialEnterFormValues = () => {
    try {
      const enterCache = localStorage.getItem(STORAGE_KEY_ENTER);
      if (enterCache) {
        return JSON.parse(enterCache);
      }
    } catch (error) {
      console.warn('加载进入聊天室缓存失败:', error);
    }
    return {
      authType: 0,
      linkProvider: '() => Promise.resolve(["weblink.netease.im:443"])',
    };
  };

  // 进入聊天室
  const handleEnter = async (values: EnterFormValues & { roomId: string }) => {
    if (!window.chatroomV2) {
      message.error('请先选择一个聊天室实例');
      return;
    }

    const {
      roomId,
      accountId,
      token,
      roomNick,
      roomAvatar,
      serverExtension,
      notificationExtension,
      authType,
      linkProvider,
      tokenProvider,
      loginExtensionProvider,
    } = values;

    setLoading(true);

    // 构建进入聊天室参数
    const enterParams: V2NIMChatroomEnterParams = {
      accountId,
      token,
      loginOption: {
        authType, // 使用表单选择的鉴权方式
      },
      // 默认写的连接地址
      linkProvider: () => Promise.resolve(['weblink.netease.im:443']),
    };

    if (roomNick) enterParams.roomNick = roomNick;
    if (roomAvatar) enterParams.roomAvatar = roomAvatar;
    if (serverExtension) enterParams.serverExtension = serverExtension;
    if (notificationExtension) enterParams.notificationExtension = notificationExtension;

    // 处理 linkProvider：将字符串转换为真正的函数
    if (linkProvider) {
      try {
        const funcStr = linkProvider.trim();
        const linkProviderFunc = new Function(`return ${funcStr}`)();
        enterParams.linkProvider = linkProviderFunc;
        console.log('linkProvider 已设置:', linkProviderFunc);
      } catch (error) {
        console.error('linkProvider 解析失败:', error);
        message.error(`linkProvider 解析失败: ${error}`);
        setLoading(false);
        return;
      }
    }

    // 处理 tokenProvider：将字符串转换为真正的函数
    if (tokenProvider && enterParams.loginOption) {
      try {
        const funcStr = tokenProvider.trim();
        const tokenProviderFunc = new Function(`return ${funcStr}`)();
        enterParams.loginOption.tokenProvider = tokenProviderFunc;
        console.log('tokenProvider 已设置:', tokenProviderFunc);
      } catch (error) {
        console.error('tokenProvider 解析失败:', error);
        message.error(`tokenProvider 解析失败: ${error}`);
        setLoading(false);
        return;
      }
    }

    // 处理 loginExtensionProvider：将字符串转换为真正的函数
    if (loginExtensionProvider && enterParams.loginOption) {
      try {
        const funcStr = loginExtensionProvider.trim();
        const loginExtensionProviderFunc = new Function(`return ${funcStr}`)();
        enterParams.loginOption.loginExtensionProvider = loginExtensionProviderFunc;
        console.log('loginExtensionProvider 已设置:', loginExtensionProviderFunc);
      } catch (error) {
        console.error('loginExtensionProvider 解析失败:', error);
        message.error(`loginExtensionProvider 解析失败: ${error}`);
        setLoading(false);
        return;
      }
    }

    console.log('进入聊天室, roomId:', roomId, 'params:', enterParams);

    // 调用 enter 方法
    const [error, result] = await to(() => window.chatroomV2?.enter(roomId, enterParams));

    setLoading(false);

    if (error) {
      console.error('进入聊天室失败:', error.toString());
      message.error(`进入聊天室失败: ${error.toString()}`);
      return;
    }

    if (!result) {
      console.error('进入聊天室失败, 没有返回值');
      message.error(`进入聊天室失败, 没有返回值`);
      return;
    }

    console.log('进入聊天室成功:', result);
    message.success(`成功进入聊天室 ${roomId}`);

    // 保存进入聊天室参数到 localStorage
    localStorage.setItem(STORAGE_KEY_ENTER, JSON.stringify(values));

    // 更新实例信息
    setInstances(prev =>
      prev.map(inst =>
        inst.instanceId === selectedInstance?.instanceId ? { ...inst, roomId, accountId } : inst
      )
    );
  };

  // 退出聊天室
  const handleExit = async () => {
    if (!window.chatroomV2) {
      message.error('请先选择一个聊天室实例');
      return;
    }

    // 检查是否已进入聊天室
    const chatroomInfo = window.chatroomV2.getChatroomInfo();
    if (!chatroomInfo) {
      message.warning('当前实例未进入任何聊天室');
      return;
    }

    setLoading(true);

    console.log('退出聊天室, roomId:', chatroomInfo.roomId);

    // 调用 exit 方法退出聊天室
    const [error] = await to(() => window.chatroomV2?.exit());

    setLoading(false);

    if (error) {
      console.error('退出聊天室失败:', error.toString());
      message.error(`退出聊天室失败: ${error.toString()}`);
      return;
    }

    console.log('退出聊天室成功');
    message.success(`成功退出聊天室 ${chatroomInfo.roomId}`);

    // 更新实例信息，清除 roomId 和 accountId
    setInstances(prev =>
      prev.map(inst =>
        inst.instanceId === selectedInstance?.instanceId
          ? { ...inst, roomId: undefined, accountId: undefined }
          : inst
      )
    );
  };

  // 获取聊天室信息
  const handleGetChatroom = async () => {
    if (!window.chatroomV2) {
      message.error('请先选择一个聊天室实例');
      return;
    }

    // 检查是否已进入聊天室
    const chatroomInfo = window.chatroomV2.getChatroomInfo();
    if (!chatroomInfo) {
      message.warning('当前实例未进入任何聊天室');
      return;
    }

    console.log('聊天室信息, roomId:', chatroomInfo.roomId);
    console.log('聊天室信息:', chatroomInfo);
    message.success('聊天室信息已输出到控制台');
  };

  // 销毁实例
  const handleDestroyInstance = async (instanceId: number, event: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发列表项的选中事件
    event.stopPropagation();

    console.log('销毁实例, instanceId:', instanceId);

    // 调用 destroyInstance 方法销毁实例
    const [error] = await to(() => V2NIMChatroomClient.destroyInstance(instanceId));

    if (error) {
      console.error('销毁实例失败:', error.toString());
      message.error(`销毁实例失败: ${error.toString()}`);
      return;
    }

    console.log('销毁实例成功');
    message.success(`成功销毁实例 ${instanceId}`);

    // 从列表中移除该实例
    setInstances(prev => prev.filter(inst => inst.instanceId !== instanceId));

    // 如果销毁的是当前选中的实例，清除选中状态
    if (selectedInstance?.instanceId === instanceId) {
      setSelectedInstance(null);
      window.chatroomV2 = undefined;
    }
  };

  // 输出进入聊天室调用语句
  const handleOutputEnterCode = () => {
    const values = enterForm.getFieldsValue();
    const {
      roomId,
      accountId,
      token,
      roomNick,
      roomAvatar,
      serverExtension,
      notificationExtension,
      authType,
      linkProvider,
      tokenProvider,
      loginExtensionProvider,
    } = values;

    // 构建进入聊天室参数
    const enterParams: any = {
      accountId,
      token,
      loginOption: {
        authType,
      },
    };

    if (roomNick) enterParams.roomNick = roomNick;
    if (roomAvatar) enterParams.roomAvatar = roomAvatar;
    if (serverExtension) enterParams.serverExtension = serverExtension;
    if (notificationExtension) enterParams.notificationExtension = notificationExtension;

    if (linkProvider) {
      enterParams.linkProvider = linkProvider;
    }

    if (tokenProvider) {
      enterParams.loginOption.tokenProvider = tokenProvider;
    }

    if (loginExtensionProvider) {
      enterParams.loginOption.loginExtensionProvider = loginExtensionProvider;
    }

    const callStatement = `const result = await window.chatroomV2.enter("${roomId || '{roomId}'}", ${JSON.stringify(enterParams, null, 2)});`;

    console.log('进入聊天室调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <>
      {/* 1. 创建实例 */}
      <Card title="1. 创建聊天室实例" size="small" style={{ marginBottom: 16 }}>
        <Form
          form={createForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={handleCreateInstance}
          initialValues={getInitialFormValues()}
        >
          {/* 基础配置 */}
          <Form.Item
            name="appkey"
            label="AppKey"
            rules={[{ required: true, message: '请输入 AppKey' }]}
          >
            <Input placeholder="请输入 AppKey" />
          </Form.Item>

          <Form.Item
            name="debugLevel"
            label="调试级别"
            rules={[{ required: true, message: '请选择调试级别' }]}
          >
            <Select placeholder="请选择调试级别">
              <Select.Option value="off">off</Select.Option>
              <Select.Option value="debug">debug</Select.Option>
              <Select.Option value="info">info</Select.Option>
              <Select.Option value="warn">warn</Select.Option>
              <Select.Option value="error">error</Select.Option>
              <Select.Option value="log">log</Select.Option>
            </Select>
          </Form.Item>

          {/* 功能开关 */}
          <Form.Item name="enableCloudStorage" label="融合存储" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="enableReporter" label="数据上报" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="enableAbtest" label="A/B测试" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="enableLogger" label="持久日志" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="enableClientAntispam" label="本地反垃圾" valuePropName="checked">
            <Switch />
          </Form.Item>

          {/* 操作按钮 */}
          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                创建实例
              </Button>
              <Button onClick={handleResetCreateForm}>重置</Button>
              <Button onClick={handleOutputCreateCode}>输出调用语句</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 2. 输出所有实例 */}
      <Card title="2. 实例列表" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleGetInstanceList}>输出所有实例</Button>

          {instances.length > 0 && (
            <List
              size="small"
              bordered
              dataSource={instances}
              renderItem={instance => (
                <List.Item
                  onClick={() => handleSelectInstance(instance)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedInstance?.instanceId === instance.instanceId ? '#e6f7ff' : undefined,
                  }}
                  extra={
                    <Space>
                      {selectedInstance?.instanceId === instance.instanceId && (
                        <Tag color="blue">已选中</Tag>
                      )}
                      <Button
                        danger
                        size="small"
                        onClick={e => handleDestroyInstance(instance.instanceId, e)}
                      >
                        销毁
                      </Button>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    title={`实例 ID: ${instance.instanceId}`}
                    description={
                      <div>
                        <div>AppKey: {instance.appkey}</div>
                        <div>调试级别: {instance.debugLevel}</div>
                        {instance.roomId && <div>聊天室 ID: {instance.roomId}</div>}
                        {instance.accountId && <div>账号: {instance.accountId}</div>}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>

      {/* 3. 进入聊天室 */}
      {selectedInstance && (
        <Card title="3. 进入聊天室" size="small">
          <Form
            form={enterForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleEnter}
            initialValues={getInitialEnterFormValues()}
          >
            <Form.Item
              name="roomId"
              label="聊天室 ID"
              rules={[{ required: true, message: '请输入聊天室 ID' }]}
              tooltip="要进入的聊天室 ID"
            >
              <Input placeholder="请输入聊天室 ID" />
            </Form.Item>

            <Form.Item
              name="accountId"
              label="账号 ID"
              rules={[{ required: true, message: '请输入账号 ID' }]}
              tooltip="用户账号 ID"
            >
              <Input placeholder="请输入账号 ID" />
            </Form.Item>

            <Form.Item
              name="token"
              label="Token"
              rules={[{ required: true, message: '请输入 Token' }]}
              tooltip="用户身份验证 Token"
            >
              <Input.Password placeholder="请输入 Token" />
            </Form.Item>

            <Form.Item
              name="linkProvider"
              label="Link Provider"
              tooltip="自定义连接提供函数，用于指定聊天室连接地址"
            >
              <Input.TextArea
                rows={3}
                placeholder='() => Promise.resolve(["weblink.netease.im:443"])'
              />
            </Form.Item>

            <Collapse
              ghost
              items={[
                {
                  key: 'optional',
                  label: '可选参数',
                  children: (
                    <>
                      <Form.Item name="roomNick" label="昵称" tooltip="进入聊天室时使用的昵称">
                        <Input placeholder="请输入昵称（可选）" />
                      </Form.Item>

                      <Form.Item
                        name="roomAvatar"
                        label="头像"
                        tooltip="进入聊天室时使用的头像 URL"
                      >
                        <Input placeholder="请输入头像 URL（可选）" />
                      </Form.Item>

                      <Form.Item
                        name="serverExtension"
                        label="扩展字段"
                        tooltip="开发者自定义的扩展字段"
                      >
                        <Input.TextArea rows={2} placeholder="请输入扩展字段（可选）" />
                      </Form.Item>

                      <Form.Item
                        name="notificationExtension"
                        label="通知扩展字段"
                        tooltip="进入聊天室通知的扩展字段"
                      >
                        <Input.TextArea rows={2} placeholder="请输入通知扩展字段（可选）" />
                      </Form.Item>

                      <Form.Item
                        name="authType"
                        label="鉴权方式"
                        tooltip="聊天室登录鉴权方式：0-默认, 1-动态Token, 2-第三方回调"
                      >
                        <Select placeholder="请选择鉴权方式">
                          <Select.Option value={0}>0 - 默认鉴权</Select.Option>
                          <Select.Option value={1}>1 - 动态Token鉴权</Select.Option>
                          <Select.Option value={2}>2 - 第三方回调鉴权</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="tokenProvider"
                        label="Token Provider"
                        tooltip="动态Token提供函数，用于动态鉴权模式"
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder='() => Promise.resolve("dynamic_token_string")'
                        />
                      </Form.Item>

                      <Form.Item
                        name="loginExtensionProvider"
                        label="Login Extension Provider"
                        tooltip="登录扩展信息提供函数，用于传递自定义登录参数"
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder='() => Promise.resolve("custom_extension_data")'
                        />
                      </Form.Item>
                    </>
                  ),
                },
              ]}
            />

            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <Space wrap>
                <Button type="primary" htmlType="submit" loading={loading}>
                  进入聊天室
                </Button>
                <Button danger onClick={handleExit} loading={loading}>
                  退出聊天室
                </Button>
                <Button onClick={handleGetChatroom} loading={loading}>
                  输出该聊天室信息
                </Button>
                <Button onClick={handleOutputEnterCode}>输出调用语句</Button>
                <Button onClick={() => enterForm.resetFields()}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" size="small" style={{ marginTop: 16 }}>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>创建实例：</strong>填写 AppKey，点击"创建实例"按钮调用 newInstance
            创建聊天室实例
          </li>
          <li>
            <strong>查看实例：</strong>点击"输出所有实例"按钮查看所有已创建的实例
          </li>
          <li>
            <strong>选择实例：</strong>点击列表中的实例进行选中，选中后会挂载到 window.chatroomV2
          </li>
          <li>
            <strong>进入聊天室：</strong>选中实例后，填写进入聊天室的参数，点击"进入聊天室"按钮
          </li>
          <li>
            <strong>退出聊天室：</strong>进入聊天室后，可点击"退出聊天室"按钮退出当前聊天室
          </li>
          <li>
            <strong>获取聊天室信息：</strong>
            进入聊天室后，可点击"输出该聊天室信息"按钮查看当前聊天室详细信息
          </li>
          <li>
            <strong>输出调用语句：</strong>点击"输出调用语句"按钮可在控制台查看进入聊天室的完整代码
          </li>
          <li>
            <strong>销毁实例：</strong>点击实例列表右侧的"销毁"按钮可销毁对应的实例
          </li>
        </ol>
      </Card>

      {/* 重要提醒 */}
      <Card
        title="⚠️ 重要提醒"
        size="small"
        style={{
          marginTop: 16,
          border: '2px solid #ff9c6e',
          backgroundColor: '#fff7e6',
        }}
        styles={{
          header: {
            backgroundColor: '#ffe7ba',
            color: '#d46b08',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#d46b08' }}>
          <li>支持多实例，可以创建多个聊天室客户端实例</li>
          <li>每次创建的实例会挂载到 window.chatroomV2 供后续 API 调用</li>
          <li>选中实例后才能进入聊天室</li>
          <li>进入聊天室需要先在云信控制台创建聊天室</li>
          <li>Token 应从应用服务器动态获取，请勿硬编码</li>
        </ul>
      </Card>
    </>
  );
};

export default ChatroomInitForm;
