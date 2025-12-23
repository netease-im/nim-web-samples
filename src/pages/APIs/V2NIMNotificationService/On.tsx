import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMCustomNotification } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMNotificationService';

import styles from '../nim.module.less';

const { Text } = Typography;

interface V2NIMBroadcastNotification {
  id: string;
  content: string;
  timestamp: number;
  [key: string]: any;
}

const storageKey = `V2NIMNotificationService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 收到自定义通知
  const onReceiveCustomNotifications = (customNotifications: V2NIMCustomNotification[]) => {
    const count = customNotifications.length;
    const firstNotification = customNotifications[0];
    const summary = firstNotification
      ? `发送者: ${firstNotification.senderId}, 内容: ${firstNotification.content?.substring(0, 20)}${firstNotification.content?.length > 20 ? '...' : ''}`
      : '无内容';

    message.success(
      `收到 V2NIMNotificationService 模块的 onReceiveCustomNotifications 事件, 共${count}条通知, ${summary}, 详情见控制台`
    );
    console.log('收到自定义通知:', customNotifications);
  };

  // 收到广播通知
  const onReceiveBroadcastNotifications = (
    broadcastNotifications: V2NIMBroadcastNotification[]
  ) => {
    const count = broadcastNotifications.length;
    const firstNotification = broadcastNotifications[0];
    const summary = firstNotification
      ? `ID: ${firstNotification.id}, 内容: ${firstNotification.content?.substring(0, 20)}${firstNotification.content?.length > 20 ? '...' : ''}`
      : '无内容';

    message.info(
      `收到 V2NIMNotificationService 模块的 onReceiveBroadcastNotifications 事件, 共${count}条广播, ${summary}, 详情见控制台`
    );
    console.log('收到广播通知:', broadcastNotifications);
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMNotificationService.off(
      'onReceiveCustomNotifications',
      onReceiveCustomNotifications
    );
    window.nim.V2NIMNotificationService.off(
      'onReceiveBroadcastNotifications',
      onReceiveBroadcastNotifications
    );

    // 设置监听
    window.nim.V2NIMNotificationService.on(
      'onReceiveCustomNotifications',
      onReceiveCustomNotifications
    );
    window.nim.V2NIMNotificationService.on(
      'onReceiveBroadcastNotifications',
      onReceiveBroadcastNotifications
    );

    message.success('成功设置通知服务监听');
    console.log('通知服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有通知服务相关的监听
    window.nim.V2NIMNotificationService.removeAllListeners('onReceiveCustomNotifications');
    window.nim.V2NIMNotificationService.removeAllListeners('onReceiveBroadcastNotifications');

    message.success('已取消所有通知服务监听');
    console.log('所有通知服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置通知服务监听
const setupNotificationServiceListeners = () => {
  // 收到自定义通知
  window.nim.V2NIMNotificationService.on('onReceiveCustomNotifications', (customNotifications) => {
    console.log('收到自定义通知:', customNotifications);
    // 处理自定义通知
    customNotifications.forEach(notification => {
      console.log('通知详情:', {
        会话ID: notification.conversationId,
        发送者: notification.senderId,
        接收者: notification.receiverId,
        内容: notification.content,
        时间戳: notification.timestamp,
        时间: new Date(notification.timestamp).toLocaleString()
      });
    });
  });

  // 收到广播通知
  window.nim.V2NIMNotificationService.on('onReceiveBroadcastNotifications', (broadcastNotifications) => {
    console.log('收到广播通知:', broadcastNotifications);
    // 处理广播通知
    broadcastNotifications.forEach(notification => {
      console.log('广播详情:', {
        ID: notification.id,
        内容: notification.content,
        时间戳: notification.timestamp,
        时间: new Date(notification.timestamp).toLocaleString()
      });
    });
  });
};

// 调用设置函数
setupNotificationServiceListeners();
`;

    console.log('V2NIMNotificationService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMNotificationService`}
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
          <Text strong>onReceiveCustomNotifications</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>收到自定义通知时触发</li>
            <li>参数：customNotifications (自定义通知数组)</li>
            <li>触发时机：通过 sendCustomNotification 发送的通知</li>
          </ul>
        </div>

        <div>
          <Text strong>onReceiveBroadcastNotifications</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>收到广播通知时触发</li>
            <li>参数：broadcastNotifications (广播通知数组)</li>
            <li>触发时机：服务端发送的全局广播通知</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMNotificationService 的事件监听功能
          </li>
          <li>
            <strong>触发方式：</strong>通过 sendCustomNotification 发送自定义通知
          </li>
          <li>
            <strong>用途：</strong>监听通知接收，实现自定义业务逻辑的实时通知
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
          <li>自定义通知不会存储在消息历史中，只用于实时通知</li>
          <li>广播通知需要特殊权限，通常由服务端管理</li>
          <li>及时移除不需要的监听器以避免内存泄漏</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
