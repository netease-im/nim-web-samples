import { Button, Card, Form, Space, Typography, message } from 'antd';
import {
  V2NIMClearHistoryNotification,
  V2NIMMessage,
  V2NIMMessageDeletedNotification,
  V2NIMMessagePinNotification,
  V2NIMMessageQuickCommentNotification,
  V2NIMMessageRevokeNotification,
  V2NIMP2PMessageReadReceipt,
  V2NIMTeamMessageReadReceipt,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMMessageService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 发送消息状态回调
  const onSendMessage = (msg: V2NIMMessage) => {
    message.success(`收到 V2NIMMessageService 模块的 onSendMessage 事件, 详情见控制台`);
    console.log('消息发送状态更新:', msg);
  };

  // 收到新消息
  const onReceiveMessages = (messages: V2NIMMessage[]) => {
    message.info(`收到 V2NIMMessageService 模块的 onReceiveMessages 事件, 详情见控制台`);
    console.log('收到新消息:', messages);
  };

  // 收到点对点消息的已读回执
  const onReceiveP2PMessageReadReceipts = (readReceipts: V2NIMP2PMessageReadReceipt[]) => {
    message.info(
      `收到 V2NIMMessageService 模块的 onReceiveP2PMessageReadReceipts 事件, 详情见控制台`
    );
    console.log('收到P2P已读回执:', readReceipts);
  };

  // 收到高级群消息的已读回执
  const onReceiveTeamMessageReadReceipts = (readReceipts: V2NIMTeamMessageReadReceipt[]) => {
    message.info(
      `收到 V2NIMMessageService 模块的 onReceiveTeamMessageReadReceipts 事件, 详情见控制台`
    );
    console.log('收到群消息已读回执:', readReceipts);
  };

  // 收到消息撤回回调
  const onMessageRevokeNotifications = (notifications: V2NIMMessageRevokeNotification[]) => {
    message.warning(
      `收到 V2NIMMessageService 模块的 onMessageRevokeNotifications 事件, 详情见控制台`
    );
    console.log('收到消息撤回通知:', notifications);
  };

  // 收到消息被删除通知
  const onMessageDeletedNotifications = (notifications: V2NIMMessageDeletedNotification[]) => {
    message.warning(
      `收到 V2NIMMessageService 模块的 onMessageDeletedNotifications 事件, 详情见控制台`
    );
    console.log('收到消息删除通知:', notifications);
  };

  // 清空会话历史消息通知
  const onClearHistoryNotifications = (notifications: V2NIMClearHistoryNotification[]) => {
    message.warning(
      `收到 V2NIMMessageService 模块的 onClearHistoryNotifications 事件, 详情见控制台`
    );
    console.log('收到清空历史消息通知:', notifications);
  };

  // 收到消息 pin 状态更新
  const onMessagePinNotification = (notification: V2NIMMessagePinNotification) => {
    message.info(`收到 V2NIMMessageService 模块的 onMessagePinNotification 事件, 详情见控制台`);
    console.log('收到消息Pin状态更新:', notification);
  };

  // 收到消息快捷评论更新
  const onMessageQuickCommentNotification = (
    notification: V2NIMMessageQuickCommentNotification
  ) => {
    message.info(
      `收到 V2NIMMessageService 模块的 onMessageQuickCommentNotification 事件, 详情见控制台`
    );
    console.log('收到消息快捷评论更新:', notification);
  };

  // 收到消息更新事件（如果存在）
  const onReceiveMessagesModified = (messages: V2NIMMessage[]) => {
    message.info(`收到 V2NIMMessageService 模块的 onReceiveMessagesModified 事件, 详情见控制台`);
    console.log('收到消息更新:', messages);
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMMessageService.off('onSendMessage', onSendMessage);
    window.nim.V2NIMMessageService.off('onReceiveMessages', onReceiveMessages);
    window.nim.V2NIMMessageService.off(
      'onReceiveP2PMessageReadReceipts',
      onReceiveP2PMessageReadReceipts
    );
    window.nim.V2NIMMessageService.off(
      'onReceiveTeamMessageReadReceipts',
      onReceiveTeamMessageReadReceipts
    );
    window.nim.V2NIMMessageService.off(
      'onMessageRevokeNotifications',
      onMessageRevokeNotifications
    );
    window.nim.V2NIMMessageService.off(
      'onMessageDeletedNotifications',
      onMessageDeletedNotifications
    );
    window.nim.V2NIMMessageService.off('onClearHistoryNotifications', onClearHistoryNotifications);
    window.nim.V2NIMMessageService.off('onMessagePinNotification', onMessagePinNotification);
    window.nim.V2NIMMessageService.off(
      'onMessageQuickCommentNotification',
      onMessageQuickCommentNotification
    );

    // 如果支持消息更新事件，也取消监听
    if (typeof window.nim.V2NIMMessageService.off === 'function') {
      try {
        window.nim.V2NIMMessageService.off('onReceiveMessagesModified', onReceiveMessagesModified);
      } catch (e) {
        // 忽略不支持的事件
      }
    }

    // 设置监听
    window.nim.V2NIMMessageService.on('onSendMessage', onSendMessage);
    window.nim.V2NIMMessageService.on('onReceiveMessages', onReceiveMessages);
    window.nim.V2NIMMessageService.on(
      'onReceiveP2PMessageReadReceipts',
      onReceiveP2PMessageReadReceipts
    );
    window.nim.V2NIMMessageService.on(
      'onReceiveTeamMessageReadReceipts',
      onReceiveTeamMessageReadReceipts
    );
    window.nim.V2NIMMessageService.on('onMessageRevokeNotifications', onMessageRevokeNotifications);
    window.nim.V2NIMMessageService.on(
      'onMessageDeletedNotifications',
      onMessageDeletedNotifications
    );
    window.nim.V2NIMMessageService.on('onClearHistoryNotifications', onClearHistoryNotifications);
    window.nim.V2NIMMessageService.on('onMessagePinNotification', onMessagePinNotification);
    window.nim.V2NIMMessageService.on(
      'onMessageQuickCommentNotification',
      onMessageQuickCommentNotification
    );

    // 如果支持消息更新事件，也设置监听
    if (typeof window.nim.V2NIMMessageService.on === 'function') {
      try {
        window.nim.V2NIMMessageService.on('onReceiveMessagesModified', onReceiveMessagesModified);
      } catch (e) {
        // 忽略不支持的事件
      }
    }

    message.success('成功设置消息服务监听');
    console.log('消息服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有消息服务相关的监听
    window.nim.V2NIMMessageService.removeAllListeners('onSendMessage');
    window.nim.V2NIMMessageService.removeAllListeners('onReceiveMessages');
    window.nim.V2NIMMessageService.removeAllListeners('onReceiveP2PMessageReadReceipts');
    window.nim.V2NIMMessageService.removeAllListeners('onReceiveTeamMessageReadReceipts');
    window.nim.V2NIMMessageService.removeAllListeners('onMessageRevokeNotifications');
    window.nim.V2NIMMessageService.removeAllListeners('onMessageDeletedNotifications');
    window.nim.V2NIMMessageService.removeAllListeners('onClearHistoryNotifications');
    window.nim.V2NIMMessageService.removeAllListeners('onMessagePinNotification');
    window.nim.V2NIMMessageService.removeAllListeners('onMessageQuickCommentNotification');

    // 如果支持消息更新事件，也取消监听
    window.nim.V2NIMMessageService.removeAllListeners('onReceiveMessagesModified');

    message.success('已取消所有消息服务监听');
    console.log('所有消息服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置消息服务监听
const setupMessageListeners = () => {
  // 发送消息状态回调
  window.nim.V2NIMMessageService.on('onSendMessage', (message) => {
    console.log('消息发送状态更新:', message);
  });

  // 收到新消息
  window.nim.V2NIMMessageService.on('onReceiveMessages', (messages) => {
    console.log('收到新消息:', messages);
  });

  // 收到点对点消息的已读回执
  window.nim.V2NIMMessageService.on('onReceiveP2PMessageReadReceipts', (readReceipts) => {
    console.log('收到P2P已读回执:', readReceipts);
  });

  // 收到高级群消息的已读回执
  window.nim.V2NIMMessageService.on('onReceiveTeamMessageReadReceipts', (readReceipts) => {
    console.log('收到群消息已读回执:', readReceipts);
  });

  // 收到消息撤回回调
  window.nim.V2NIMMessageService.on('onMessageRevokeNotifications', (notifications) => {
    console.log('收到消息撤回通知:', notifications);
  });

  // 收到消息被删除通知
  window.nim.V2NIMMessageService.on('onMessageDeletedNotifications', (notifications) => {
    console.log('收到消息删除通知:', notifications);
  });

  // 清空会话历史消息通知
  window.nim.V2NIMMessageService.on('onClearHistoryNotifications', (notifications) => {
    console.log('收到清空历史消息通知:', notifications);
  });

  // 收到消息 pin 状态更新
  window.nim.V2NIMMessageService.on('onMessagePinNotification', (notification) => {
    console.log('收到消息Pin状态更新:', notification);
  });

  // 收到消息快捷评论更新
  window.nim.V2NIMMessageService.on('onMessageQuickCommentNotification', (notification) => {
    console.log('收到消息快捷评论更新:', notification);
  });

  // 收到消息更新事件（如果支持）
  window.nim.V2NIMMessageService.on('onReceiveMessagesModified', (messages) => {
    console.log('收到消息更新:', messages);
  });
};

// 调用设置函数
setupMessageListeners();
`;

    console.log('V2NIMMessageService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
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
        <Form.Item label={'操作项'}>
          <Space size="middle" style={{ width: '100%', flexWrap: 'wrap' }}>
            <Button type="primary" onClick={handleSetListener} style={{ minWidth: 120 }}>
              设置监听
            </Button>
            <Button type="default" danger onClick={handleRemoveAllListeners}>
              取消所有监听
            </Button>
            <Button type="default" onClick={handleOutputCode}>
              输出监听代码
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 监听事件说明 */}
      <Card title="监听事件说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 12 }}>
          <Text strong>onSendMessage</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>发送消息状态变化时触发</li>
            <li>参数：message (消息对象)</li>
            <li>触发时机：消息发送状态和附件上传状态变化</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onReceiveMessages</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>收到新消息时触发</li>
            <li>参数：messages (消息列表)</li>
            <li>触发时机：接收到其他用户发送的消息</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onReceiveP2PMessageReadReceipts / onReceiveTeamMessageReadReceipts</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>收到已读回执时触发</li>
            <li>参数：readReceipts (已读回执列表)</li>
            <li>触发时机：对方阅读消息后发送已读回执</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onMessageRevokeNotifications</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>消息撤回时触发</li>
            <li>参数：notifications (撤回通知列表)</li>
            <li>触发时机：本端或他端撤回消息</li>
          </ul>
        </div>

        <div>
          <Text strong>其他事件</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>onMessageDeletedNotifications - 消息删除通知</li>
            <li>onClearHistoryNotifications - 清空历史消息通知</li>
            <li>onMessagePinNotification - 消息Pin状态更新</li>
            <li>onMessageQuickCommentNotification - 消息快捷评论更新</li>
            <li>onReceiveMessagesModified - 消息更新事件（多端同步）</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMMessageService 的事件监听功能
          </li>
          <li>
            <strong>触发方式：</strong>去消息相关页面进行操作（发送、撤回、删除消息等）
          </li>
          <li>
            <strong>用途：</strong>监听消息状态变化，实时更新界面和处理业务逻辑
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
          <li>重复监听同一事件会导致多次触发，建议先取消监听再设置</li>
          <li>建议在 onDataSync 数据同步完成后再使用消息模块</li>
          <li>消息服务事件较多，根据业务需要选择监听相关事件</li>
          <li>所有事件详情都会在控制台输出，方便调试和学习</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
