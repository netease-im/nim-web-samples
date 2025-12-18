import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMUser } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMUserService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMUserService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 用户资料变更
  const onUserProfileChanged = (users: V2NIMUser[]) => {
    // const userInfo = users.map(user => `${user.accountId}(${user.name || '无昵称'})`).join(', ');
    message.info(`收到 V2NIMUserService 模块的 onUserProfileChanged 事件, 详情见控制台`);
    console.log('用户资料变更:', users);
  };

  // 黑名单添加通知
  const onBlockListAdded = (user: V2NIMUser) => {
    message.warning(`收到 V2NIMUserService 模块的 onBlockListAdded 事件, 详情见控制台`);
    console.log('用户被添加到黑名单:', user);
  };

  // 黑名单移除通知
  const onBlockListRemoved = (accountId: string) => {
    message.success(`收到 V2NIMUserService 模块的 onBlockListRemoved 事件, 详情见控制台`);
    console.log('用户被从黑名单移除:', accountId);
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMUserService.off('onUserProfileChanged', onUserProfileChanged);
    window.nim.V2NIMUserService.off('onBlockListAdded', onBlockListAdded);
    window.nim.V2NIMUserService.off('onBlockListRemoved', onBlockListRemoved);

    // 设置监听
    window.nim.V2NIMUserService.on('onUserProfileChanged', onUserProfileChanged);
    window.nim.V2NIMUserService.on('onBlockListAdded', onBlockListAdded);
    window.nim.V2NIMUserService.on('onBlockListRemoved', onBlockListRemoved);

    message.success('成功设置用户服务监听');
    console.log('用户服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有用户服务相关的监听
    window.nim.V2NIMUserService.removeAllListeners('onUserProfileChanged');
    window.nim.V2NIMUserService.removeAllListeners('onBlockListAdded');
    window.nim.V2NIMUserService.removeAllListeners('onBlockListRemoved');

    message.success('已取消所有用户服务监听');
    console.log('所有用户服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置用户服务监听
const setupUserServiceListeners = () => {
  // 用户资料变更
  window.nim.V2NIMUserService.on('onUserProfileChanged', (users) => {
    console.log('用户资料变更:', users);
    // users 是 V2NIMUser[] 数组，包含变更的用户信息
  });

  // 黑名单添加通知
  window.nim.V2NIMUserService.on('onBlockListAdded', (user) => {
    console.log('用户被添加到黑名单:', user);
    // user 是 V2NIMUser 对象，包含被添加到黑名单的用户信息
  });

  // 黑名单移除通知
  window.nim.V2NIMUserService.on('onBlockListRemoved', (accountId) => {
    console.log('用户被从黑名单移除:', accountId);
    // accountId 是字符串，被移除的用户账号ID
  });
};

// 调用设置函数
setupUserServiceListeners();
`;

    console.log('V2NIMUserService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMUserService`}
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
          <Text strong>onUserProfileChanged</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>用户资料变更时触发</li>
            <li>参数：users (用户列表)</li>
            <li>触发时机：用户昵称、头像、签名等发生变化</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onBlockListAdded</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>用户被添加到黑名单时触发</li>
            <li>参数：user (用户信息)</li>
            <li>触发时机：本端或多端同步添加黑名单</li>
          </ul>
        </div>

        <div>
          <Text strong>onBlockListRemoved</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>用户被从黑名单移除时触发</li>
            <li>参数：accountId (用户ID)</li>
            <li>触发时机：本端或多端同步移除黑名单</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMUserService 的事件监听功能
          </li>
          <li>
            <strong>触发方式：</strong>去"更新用户资料"或"黑名单管理"页面进行操作
          </li>
          <li>
            <strong>用途：</strong>监听用户资料变更和黑名单变化，实时更新界面状态
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
          <li>支持多端同步，其他设备的操作也会触发事件</li>
          <li>所有事件详情都会在控制台输出，方便调试和学习</li>
          <li>建议在应用初始化时设置监听，在应用销毁时取消监听</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
