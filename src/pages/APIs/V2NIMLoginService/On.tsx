import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMConst } from 'nim-web-sdk-ng';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMLoginService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 登录状态的监听
  const onLoginStatusFn = (loginStatus: number) => {
    message.info('收到 V2NIMLoginService 模块的 onLoginStatus 事件, 详情见控制台');
    if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGINED) {
      console.info('V2NIMLoginService.onLoginStatus => 登录成功(也可以表示断线重连成功)');
    } else if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGINING) {
      console.info('V2NIMLoginService.onLoginStatus => 正在登录中(也可以表示正在重连中)');
    } else if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGOUT) {
      console.warn(
        'V2NIMLoginService.onLoginStatus => 未登录(同时代表初始状态, 已经登出, 已经被踢下线, 断线等情况)'
      );
    } else if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_UNLOGIN) {
      console.warn('V2NIMLoginService.onLoginStatus => 重连退避中.');
      // todo 其实可以不用过多处理
    }
  };

  const onDataSync = (type: number, state: number, error?: Error) => {
    if (
      type === V2NIMConst.V2NIMDataSyncType.V2NIM_DATA_SYNC_TYPE_MAIN &&
      state === V2NIMConst.V2NIMDataSyncState.V2NIM_DATA_SYNC_STATE_COMPLETED
    ) {
      // 主数据同步完毕.
      if (error) {
        // 同步出错
        console.log('V2NIMLoginService.onDataSync get error', error);
        message.info('收到 V2NIMLoginService 模块的 onDataSync 事件, 同步出错');
      } else {
        // 到此数据准备完毕, 允许调用 V2NIMLocalConversationService.getConversationList 这样的依赖同步数据的接口
        message.success('收到 V2NIMLoginService 模块的 onDataSync 事件, 同步成功');
      }
    }
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMLoginService.off('onLoginStatus', onLoginStatusFn);
    window.nim.V2NIMLoginService.off('onDataSync', onDataSync);
    // 设置监听
    window.nim.V2NIMLoginService.on('onLoginStatus', onLoginStatusFn);
    window.nim.V2NIMLoginService.on('onDataSync', onDataSync);

    message.success('成功设置监听');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有关于 onLoginStatus 的监听
    window.nim.V2NIMLoginService.removeAllListeners('onLoginStatus');
    window.nim.V2NIMLoginService.removeAllListeners('onDataSync');

    message.success('已取消监听');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 登录服务监听
const setupLoginListeners = () => {
  // 登录状态变化监听
  window.nim.V2NIMLoginService.on('onLoginStatus', (loginStatus) => {
    console.log('登录状态变化:', loginStatus);
    // 1-已登录, 2-登录中, 3-未登录, 4-重连退避中
  });

  // 数据同步进展监听
  window.nim.V2NIMLoginService.on('onDataSync', (type, state, error) => {
    console.log('数据同步进展:', { type, state, error });
    // 主数据同步完成后可调用依赖同步数据的接口
  });
};

// 调用设置函数
setupLoginListeners();
`;

    console.log('V2NIMLoginService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLoginService`}
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
          <Text strong>onLoginStatus</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>登录状态变化时触发</li>
            <li>参数：loginStatus (登录状态码)</li>
            <li>状态值：1-已登录, 2-登录中, 3-未登录, 4-重连退避中</li>
          </ul>
        </div>

        <div>
          <Text strong>onDataSync</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>数据同步进展时触发</li>
            <li>参数：type (同步类型), state (同步状态), error (错误信息)</li>
            <li>关键状态：主数据同步完成后可调用依赖同步数据的接口</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMLoginService 的核心事件监听
          </li>
          <li>
            <strong>触发方式：</strong>去"登录与登出"页执行登录动作查看事件触发
          </li>
          <li>
            <strong>用途：</strong>监听登录状态和数据同步，确保应用状态正确
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
          <li>onDataSync 完成后才能调用依赖同步数据的接口, 如获取本地会话</li>
          <li>重复监听同一事件会导致多次触发，建议先取消监听再设置</li>
          <li>其他细节事件已在初始化表单中设置，可查看 NIMInitForm 代码</li>
          <li>建议在应用初始化时设置监听，在应用销毁时取消监听</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
