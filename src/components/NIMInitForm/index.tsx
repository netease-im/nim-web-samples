import { Button, Form, Input, Select, Switch, message } from 'antd';
import NIM from 'nim-web-sdk-ng';
import { NIMOtherOptions } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/NIMInterface';
import { useState } from 'react';

import styles from './index.module.less';

interface NIMInitFormProps {
  onInitComplete?: () => void;
}

interface InitFormValues {
  // 基础配置
  appkey: string;
  debugLevel: string;
  // 连接配置
  lbsUrls: string;
  linkUrl: string;
  // 开关配置
  enableReporter: boolean;
  enableAbtest: boolean;
  enableLogger: boolean;
  enableCloudStorage: boolean;
  enableCloudConversation: boolean;
}

const defaultInstanceParam1 = {
  appkey: '45c6a******************5d0bdd6e',
  debugLevel: 'log',
  apiVersion: 'v2',
};

const defaultInstanceParam2 = {
  V2NIMLoginServiceConfig: {
    lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'],
    linkUrl: 'weblink.netease.im:443',
  },
  reporterConfig: {
    enableCompass: true,
    compassDataEndpoint: 'https://statistic.live.126.net',
    isDataReportEnable: true,
  },
  abtestConfig: {
    isAbtestEnable: true,
    abtestUrl: 'https://abt-online.netease.im/v1/api/abt/client/getExperimentInfo',
  },
  loggerConfig: {
    storageEnable: true,
    storageName: 'nim-logs',
  },
  cloudStorageConfig: {
    commonUploadHost: 'https://fileup.chatnos.com',
    commonUploadHostBackupList: ['https://oss.chatnos.com'],
    chunkUploadHost: 'https://wannos-web.127.net',
    chunkUploadHostBackupList: ['https://fileup.chatnos.com', 'https://oss.chatnos.com'],
    isNeedToGetUploadPolicyFromServer: true,
  },
};

// 默认表单值
const getDefaultFormValues = (): InitFormValues => ({
  appkey: defaultInstanceParam1.appkey,
  debugLevel: defaultInstanceParam1.debugLevel,
  lbsUrls: defaultInstanceParam2.V2NIMLoginServiceConfig.lbsUrls.join(','),
  linkUrl: defaultInstanceParam2.V2NIMLoginServiceConfig.linkUrl,
  enableReporter: true,
  enableAbtest: true,
  enableLogger: true,
  enableCloudStorage: true,
  enableCloudConversation: false,
});

const NIMInitForm = ({ onInitComplete }: NIMInitFormProps) => {
  const [form] = Form.useForm<InitFormValues>();
  const [loading, setLoading] = useState(false);

  // 构建实例参数1
  const buildInstanceParam1 = (values: InitFormValues) => {
    return {
      appkey: values.appkey,
      debugLevel: values.debugLevel,
      apiVersion: 'v2',
      enableV2CloudConversation: values.enableCloudConversation,
    };
  };

  // 构建实例参数2
  const buildInstanceParam2 = (values: InitFormValues) => {
    const param2: NIMOtherOptions = {};

    if (values.lbsUrls) {
      param2.V2NIMLoginServiceConfig = param2.V2NIMLoginServiceConfig || {};
      param2.V2NIMLoginServiceConfig.lbsUrls = values.lbsUrls.split(',').map(url => url.trim());
    }

    if (values.linkUrl) {
      param2.V2NIMLoginServiceConfig = param2.V2NIMLoginServiceConfig || {};
      param2.V2NIMLoginServiceConfig.linkUrl = values.linkUrl;
    }

    // 根据开关添加对应配置
    if (values.enableReporter) {
      param2.reporterConfig = defaultInstanceParam2.reporterConfig;
    }

    if (values.enableAbtest) {
      param2.abtestConfig = defaultInstanceParam2.abtestConfig;
    }

    if (values.enableLogger) {
      param2.loggerConfig = defaultInstanceParam2.loggerConfig;
    }

    if (values.enableCloudStorage) {
      // @ts-ignore
      param2.cloudStorageConfig = defaultInstanceParam2.cloudStorageConfig;
    }
    return param2;
  };

  // 从localStorage恢复表单值
  const getInitialFormValues = (): InitFormValues => {
    try {
      const param1Cache = localStorage.getItem('V2NIM-getInstance-param1');
      const param2Cache = localStorage.getItem('V2NIM-getInstance-param2');

      if (param1Cache && param2Cache) {
        const param1 = JSON.parse(param1Cache);
        const param2 = JSON.parse(param2Cache);

        return {
          appkey: param1.appkey || defaultInstanceParam1.appkey,
          debugLevel: param1.debugLevel || defaultInstanceParam1.debugLevel,
          lbsUrls:
            param2.V2NIMLoginServiceConfig?.lbsUrls?.join(',') ||
            defaultInstanceParam2.V2NIMLoginServiceConfig.lbsUrls.join(','),
          linkUrl:
            param2.V2NIMLoginServiceConfig?.linkUrl ||
            defaultInstanceParam2.V2NIMLoginServiceConfig.linkUrl,
          enableReporter: !!param2.reporterConfig,
          enableAbtest: !!param2.abtestConfig,
          enableLogger: !!param2.loggerConfig,
          enableCloudStorage: !!param2.cloudStorageConfig,
          enableCloudConversation: !!param1.enableV2CloudConversation,
        };
      }
    } catch (error) {
      console.warn('Failed to load cached config:', error);
    }

    return getDefaultFormValues();
  };

  const addEvent = (nim: NIM) => {
    const eventMap = {
      V2NIMLoginService: [
        'onLoginStatus',
        'onLoginFailed',
        'onKickedOffline',
        'onLoginClientChanged',
        'onDisconnected',
        'onConnectFailed',
        'onDataSync',
      ],
      V2NIMLocalConversationService: [
        'onSyncStarted',
        'onSyncFinished',
        'onSyncFailed',
        'onConversationCreated',
        'onConversationDeleted',
        'onConversationChanged',
        'onTotalUnreadCountChanged',
        'onUnreadCountChangedByFilter',
        'onConversationReadTimeUpdated',
      ],
      V2NIMConversationService: [
        'onSyncStarted',
        'onSyncFinished',
        'onSyncFailed',
        'onConversationCreated',
        'onConversationDeleted',
        'onConversationChanged',
        'onTotalUnreadCountChanged',
        'onUnreadCountChangedByFilter',
        'onConversationReadTimeUpdated',
      ],
      V2NIMConversationGroupService: [
        'onConversationGroupCreated',
        'onConversationGroupDeleted',
        'onConversationGroupChanged',
        'onConversationsAddedToGroup',
        'onConversationsRemovedFromGroup',
      ],
      V2NIMMessageService: [
        'onSendMessage',
        'onReceiveMessages',
        'onReceiveP2PMessageReadReceipts',
        'onReceiveTeamMessageReadReceipts',
        'onMessageRevokeNotifications',
        'onMessageCollectedNotification',
        'onMessageCommentedNotification',
        'onMessageDeletedNotifications',
        'onMessagePinNotification',
        'onMessageQuickCommentNotification',
        'onClearHistoryNotification',
        'onReceiveMessagesModified',
      ],
      V2NIMNotificationService: ['onReceiveCustomNotifications', 'onReceiveBroadcastNotifications'],
      V2NIMTeamService: [
        'onSyncStarted',
        'onSyncFinished',
        'onSyncFailed',
        'onTeamCreated',
        'onTeamDismissed',
        'onTeamJoined',
        'onTeamLeft',
        'onTeamInfoUpdated',
        'onTeamMemberJoined',
        'onTeamMemberKicked',
        'onTeamMemberLeft',
        'onTeamMemberInfoUpdated',
        'onReceiveTeamJoinActionInfo',
      ],
      V2NIMSettingService: ['onTeamMessageMuteModeChanged', 'onP2PMessageMuteModeChanged'],
      V2NIMUserService: ['onUserProfileChanged', 'onBlockListAdded', 'onBlockListRemoved'],
      V2NIMFriendService: [
        'onSyncStarted',
        'onSyncFinished',
        'onSyncFailed',
        'onFriendAdded',
        'onFriendDeleted',
        'onFriendAddApplication',
        'onFriendAddRejected',
        'onFriendInfoChanged',
      ],
      V2NIMAIService: ['onProxyAIModelCall', 'onProxyAIModelStreamCall'],
      V2NIMSignallingService: [
        'onOnlineEvent',
        'onOfflineEvent',
        'onMultiClientEvent',
        'onSyncRoomInfoList',
      ],
      V2NIMSubscriptionService: ['onUserStatusChanged'],
      YSFService: ['onSendMessage', 'onReceiveMessages', 'onReceiveCustomNotifications'],
      V2NIMPassthroughService: ['onProxyNotify'],
    };
    for (const key in eventMap) {
      const serviceName = key as keyof typeof eventMap;
      eventMap[serviceName].forEach(event => {
        if (!(nim[serviceName] && nim[serviceName].on)) return;

        // @ts-expect-error
        nim[serviceName].on(
          event,

          (...rest: any) => {
            console.log(`收到 ${serviceName} 模块的 ${event} 事件：`, ...rest);
          }
        );
      });
    }
  };

  const handleRun = async (values: InitFormValues) => {
    setLoading(true);
    try {
      // 构建参数
      const instanceParam1 = buildInstanceParam1(values);
      const instanceParam2 = buildInstanceParam2(values);

      console.log('初始化NIM SDK:', { instanceParam1, instanceParam2 });

      // 避免初始化多次, 维持单例模式
      if (window.nim) {
        console.log('已经初始化过了');
        message.success('已经初始化过了');
        return;
      } else {
        const nim = NIM.getInstance(instanceParam1, instanceParam2);
        addEvent(nim);
        window.nim = nim;
      }

      message.success('NIM SDK初始化成功');
      // 保存到localStorage
      localStorage.setItem('V2NIM-getInstance-param1', JSON.stringify(instanceParam1));
      localStorage.setItem('V2NIM-getInstance-param2', JSON.stringify(instanceParam2));

      if (onInitComplete) {
        onInitComplete();
      }
    } catch (error) {
      console.error('初始化失败:', error);
      message.error('NIM SDK初始化失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('V2NIM-getInstance-param1');
    localStorage.removeItem('V2NIM-getInstance-param2');
    form.setFieldsValue(getDefaultFormValues());
  };

  const handleOutput = () => {
    const values = form.getFieldsValue();
    const instanceParam1 = buildInstanceParam1(values);
    const instanceParam2 = buildInstanceParam2(values);
    message.success('已输出到控制台');
    console.log(
      `window.nim = NIM.getInstance(${JSON.stringify(instanceParam1, null, 2)}, ${JSON.stringify(instanceParam2, null, 2)})`
    );
  };

  const handleDestroy = async () => {
    if (window.nim) {
      // @ts-ignore
      await window.nim.destroy();
      window.nim = undefined;
      message.success('反初始化成功');
    }
  };

  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      onFinish={handleRun}
      initialValues={getInitialFormValues()}
      layout="horizontal"
    >
      {/* 基础配置 */}
      <Form.Item name="appkey" label="AppKey" rules={[{ required: true, message: '请输入AppKey' }]}>
        <Input placeholder="请输入AppKey" />
      </Form.Item>

      <Form.Item
        name="debugLevel"
        label="调试级别"
        rules={[{ required: false, message: '请选择调试级别' }]}
      >
        <Select placeholder="请选择调试级别">
          <Select.Option value="off">off</Select.Option>
          <Select.Option value="debug">debug</Select.Option>
          <Select.Option value="info">info</Select.Option>
          <Select.Option value="warn">warn</Select.Option>
          <Select.Option value="error">error</Select.Option>
        </Select>
      </Form.Item>

      {/* <Divider orientation="left">高级配置</Divider> */}

      {/* 连接配置 */}
      <Form.Item name="lbsUrls" label="负载均衡 LBS 地址">
        <Input placeholder="多个地址用逗号分隔" />
      </Form.Item>

      <Form.Item name="linkUrl" label="WebSocket 连接地址">
        <Input placeholder="请输入连接地址" />
      </Form.Item>

      {/* 功能开关 */}
      <Form.Item
        name="enableReporter"
        label="数据上报"
        valuePropName="checked"
        className={styles.switchItem}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="enableAbtest"
        label="A/B测试"
        valuePropName="checked"
        className={styles.switchItem}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="enableLogger"
        label="日志持久化"
        valuePropName="checked"
        className={styles.switchItem}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="enableCloudStorage"
        label="云存储"
        valuePropName="checked"
        className={styles.switchItem}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="enableCloudConversation"
        label="云端会话"
        valuePropName="checked"
        className={styles.switchItem}
      >
        <Switch />
      </Form.Item>

      <Form.Item label={null} className={styles.optBar}>
        <Button type="primary" htmlType="submit" loading={loading} className={styles.optBarBtn}>
          初始化SDK
        </Button>
        <Button type="default" onClick={handleReset} className={styles.optBarBtn}>
          重置
        </Button>
        <Button type="default" onClick={handleOutput} className={styles.optBarBtn}>
          输出调用语句
        </Button>
        <Button type="default" danger onClick={handleDestroy}>
          反初始化
        </Button>
      </Form.Item>
    </Form>
  );
};

export default NIMInitForm;
