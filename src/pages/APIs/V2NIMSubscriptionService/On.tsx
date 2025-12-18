import { Button, Card, Form, Space, Typography, message } from 'antd';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMSubscriptionService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 用户状态变更
  const onUserStatusChanged = (userStatusList: any[]) => {
    message.info(`收到 V2NIMSubscriptionService 模块的 onUserStatusChanged 事件，详情见控制台`);
    console.log('用户状态变更:', userStatusList);
    userStatusList.forEach(userStatus => {
      console.log('- 账号ID:', userStatus.accountId);
      console.log('- 状态类型:', userStatus.statusType);
      console.log('- 状态值:', userStatus.statusValue);
      console.log('- 扩展信息:', userStatus.extension);
      console.log(
        '- 发布时间:',
        userStatus.publishTime ? new Date(userStatus.publishTime).toLocaleString() : '未知'
      );
      console.log('---');
    });
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMSubscriptionService.off('onUserStatusChanged', onUserStatusChanged);

    // 设置监听
    window.nim.V2NIMSubscriptionService.on('onUserStatusChanged', onUserStatusChanged);

    message.success('成功设置用户状态订阅监听');
    console.log('用户状态订阅监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有订阅服务相关的监听
    window.nim.V2NIMSubscriptionService.removeAllListeners('onUserStatusChanged');

    message.success('已取消所有用户状态订阅监听');
    console.log('所有用户状态订阅监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置用户状态订阅监听
const setupSubscriptionServiceListeners = () => {
  // 用户状态变更
  window.nim.V2NIMSubscriptionService.on('onUserStatusChanged', (userStatusList) => {
    console.log('用户状态变更:', userStatusList);
    // userStatusList 是用户状态数组，包含状态变化的用户信息
    userStatusList.forEach(userStatus => {
      console.log('账号ID:', userStatus.accountId);
      console.log('状态类型:', userStatus.statusType);
      console.log('状态值:', userStatus.statusValue);
      console.log('扩展信息:', userStatus.extension);
      console.log('发布时间:', userStatus.publishTime);
    });
  });
};

// 调用设置函数
setupSubscriptionServiceListeners();
`;

    console.log('V2NIMSubscriptionService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMSubscriptionService`}
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
          <Text strong>onUserStatusChanged</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>用户状态变更时触发</li>
            <li>参数：userStatusList (用户状态列表)</li>
            <li>触发时机：已订阅用户的在线状态或自定义状态发生变化</li>
            <li>状态类型：1=在线, 2=离线, 3=忙碌, 自定义状态&gt;=10000</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMSubscriptionService 的用户状态订阅监听功能
          </li>
          <li>
            <strong>触发方式：</strong>先订阅用户状态，然后该用户上下线或发布自定义状态
          </li>
          <li>
            <strong>用途：</strong>监听已订阅用户的状态变化，实时更新界面显示
          </li>
          <li>
            <strong>状态说明：</strong>包含在线/离线状态和用户自定义状态信息
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
          <li>需要先订阅用户状态才能收到状态变更事件</li>
          <li>重复监听同一事件会导致多次触发，建议先取消监听再设置</li>
          <li>状态变更会实时推送，便于界面状态同步</li>
          <li>所有事件详情都会在控制台输出，方便调试和学习</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
