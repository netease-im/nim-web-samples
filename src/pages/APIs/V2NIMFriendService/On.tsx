import { Button, Card, Form, Space, Typography, message } from 'antd';
import {
  V2NIMFriend,
  V2NIMFriendAddApplication,
  V2NIMFriendDeletionType,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMFriendService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMFriendService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 好友添加通知
  const onFriendAdded = (friend: V2NIMFriend) => {
    message.success(`收到 V2NIMFriendService 模块的 onFriendAdded 事件, 详情见控制台`);
    console.log('好友添加通知:', friend);
  };

  // 好友删除通知
  const onFriendDeleted = (accountId: string, deletionType: V2NIMFriendDeletionType) => {
    message.warning(`收到 V2NIMFriendService 模块的 onFriendDeleted 事件, 详情见控制台`);
    console.log('好友删除通知:', { accountId, deletionType });
  };

  // 收到好友申请
  const onFriendAddApplication = (application: V2NIMFriendAddApplication) => {
    message.info(`收到 V2NIMFriendService 模块的 onFriendAddApplication 事件, 详情见控制台`);
    console.log('收到好友申请:', application);
  };

  // 好友申请被拒绝通知
  const onFriendAddRejected = (rejection: any) => {
    message.error(`收到 V2NIMFriendService 模块的 onFriendAddRejected 事件, 详情见控制台`);
    console.log('好友申请被拒绝通知:', rejection);
  };

  // 好友信息变更通知
  const onFriendInfoChanged = (friend: V2NIMFriend) => {
    message.info(`收到 V2NIMFriendService 模块的 onFriendInfoChanged 事件, 详情见控制台`);
    console.log('好友信息变更通知:', friend);
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMFriendService.off('onFriendAdded', onFriendAdded);
    window.nim.V2NIMFriendService.off('onFriendDeleted', onFriendDeleted);
    window.nim.V2NIMFriendService.off('onFriendAddApplication', onFriendAddApplication);
    window.nim.V2NIMFriendService.off('onFriendAddRejected', onFriendAddRejected);
    window.nim.V2NIMFriendService.off('onFriendInfoChanged', onFriendInfoChanged);

    // 设置监听
    window.nim.V2NIMFriendService.on('onFriendAdded', onFriendAdded);
    window.nim.V2NIMFriendService.on('onFriendDeleted', onFriendDeleted);
    window.nim.V2NIMFriendService.on('onFriendAddApplication', onFriendAddApplication);
    window.nim.V2NIMFriendService.on('onFriendAddRejected', onFriendAddRejected);
    window.nim.V2NIMFriendService.on('onFriendInfoChanged', onFriendInfoChanged);

    message.success('成功设置好友服务监听');
    console.log('好友服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有好友服务相关的监听
    window.nim.V2NIMFriendService.removeAllListeners('onFriendAdded');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendDeleted');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendAddApplication');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendAddRejected');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendInfoChanged');

    message.success('已取消所有好友服务监听');
    console.log('所有好友服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置好友服务监听
const setupFriendServiceListeners = () => {
  // 好友添加通知
  window.nim.V2NIMFriendService.on('onFriendAdded', (friend) => {
    console.log('好友添加通知:', friend);
    // friend 是 V2NIMFriend 对象，包含新添加的好友信息
    // 包含字段：accountId, alias, serverExtension, createTime, updateTime 等
  });

  // 好友删除通知
  window.nim.V2NIMFriendService.on('onFriendDeleted', (accountId, deletionType) => {
    console.log('好友删除通知:', { accountId, deletionType });
    // accountId: 被删除的好友账号ID
    // deletionType: 删除类型 (V2NIMFriendDeletionType 枚举值)
  });

  // 收到好友申请
  window.nim.V2NIMFriendService.on('onFriendAddApplication', (application) => {
    console.log('收到好友申请:', application);
    // application 是 V2NIMFriendAddApplication 对象
    // 包含字段：applicantAccountId, recipientAccountId, postscript, status, timestamp 等
  });

  // 好友申请被拒绝通知
  window.nim.V2NIMFriendService.on('onFriendAddRejected', (rejection) => {
    console.log('好友申请被拒绝通知:', rejection);
    // rejection 是拒绝信息对象，包含拒绝相关的详细信息
  });

  // 好友信息变更通知
  window.nim.V2NIMFriendService.on('onFriendInfoChanged', (friend) => {
    console.log('好友信息变更通知:', friend);
    // friend 是 V2NIMFriend 对象，包含变更后的好友信息
  });
};

// 调用设置函数
setupFriendServiceListeners();
`;

    console.log('V2NIMFriendService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMFriendService`}
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
          <Text strong>onFriendAdded</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>好友添加时触发</li>
            <li>参数：friend (好友信息)</li>
            <li>触发时机：成功添加好友或多端同步添加</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onFriendDeleted</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>好友删除时触发</li>
            <li>参数：accountId (好友ID), deletionType (删除类型)</li>
            <li>触发时机：删除好友或多端同步删除</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onFriendAddApplication</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>收到好友申请时触发</li>
            <li>参数：application (申请信息)</li>
            <li>触发时机：收到他人的好友申请</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onFriendAddRejected</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>好友申请被拒绝时触发</li>
            <li>参数：rejection (拒绝信息)</li>
            <li>触发时机：自己的申请被拒绝或多端同步</li>
          </ul>
        </div>

        <div>
          <Text strong>onFriendInfoChanged</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>好友信息变更时触发</li>
            <li>参数：friend (更新后的好友信息)</li>
            <li>触发时机：好友备注、扩展信息等发生变化</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMFriendService 的事件监听功能
          </li>
          <li>
            <strong>触发方式：</strong>去好友相关页面进行操作（添加、删除、申请处理等）
          </li>
          <li>
            <strong>用途：</strong>监听好友关系变化，实时更新好友列表和申请状态
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
          <li>支持多端同步，其他设备的操作也会触发事件</li>
          <li>重复监听同一事件会导致多次触发，建议先取消监听再设置</li>
          <li>所有事件详情都会在控制台输出，方便调试和学习</li>
          <li>建议在应用初始化时设置监听，及时收到好友状态变化通知</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
