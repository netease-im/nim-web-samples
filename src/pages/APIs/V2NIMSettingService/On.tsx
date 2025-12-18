import { Button, Card, Form, Space, Typography, message } from 'antd';
import {
  V2NIMP2PMessageMuteMode,
  V2NIMTeamMessageMuteMode,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMSettingService';
import { V2NIMTeamType } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMSettingService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 群消息免打扰模式变更
  const onTeamMessageMuteModeChanged = (
    teamId: string,
    teamType: V2NIMTeamType,
    muteMode: V2NIMTeamMessageMuteMode
  ) => {
    const teamTypeText = teamType === 1 ? '高级群' : teamType === 2 ? '超大群' : '未知群类型';
    const muteModeText =
      muteMode === 0
        ? '关闭免打扰'
        : muteMode === 1
          ? '开启免打扰'
          : muteMode === 2
            ? '仅管理员消息免打扰'
            : '未知模式';

    message.success(
      `收到 V2NIMSettingService 模块的 onTeamMessageMuteModeChanged 事件, 详情见控制台`
    );
    console.log('群消息免打扰模式变更:', {
      teamId,
      teamType,
      teamTypeText,
      muteMode,
      muteModeText,
    });
  };

  // 点对点消息免打扰模式变更
  const onP2PMessageMuteModeChanged = (accountId: string, muteMode: V2NIMP2PMessageMuteMode) => {
    const muteModeText = muteMode === 0 ? '关闭免打扰' : muteMode === 1 ? '开启免打扰' : '未知模式';

    message.info(`收到 V2NIMSettingService 模块的 onP2PMessageMuteModeChanged 事件, 详情见控制台`);
    console.log('点对点消息免打扰模式变更:', { accountId, muteMode, muteModeText });
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMSettingService.off(
      'onTeamMessageMuteModeChanged',
      onTeamMessageMuteModeChanged
    );
    window.nim.V2NIMSettingService.off('onP2PMessageMuteModeChanged', onP2PMessageMuteModeChanged);

    // 设置监听
    window.nim.V2NIMSettingService.on('onTeamMessageMuteModeChanged', onTeamMessageMuteModeChanged);
    window.nim.V2NIMSettingService.on('onP2PMessageMuteModeChanged', onP2PMessageMuteModeChanged);

    message.success('成功设置设置服务监听');
    console.log('设置服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有设置服务相关的监听
    window.nim.V2NIMSettingService.removeAllListeners('onTeamMessageMuteModeChanged');
    window.nim.V2NIMSettingService.removeAllListeners('onP2PMessageMuteModeChanged');

    message.success('已取消所有设置服务监听');
    console.log('所有设置服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置服务监听
const setupSettingListeners = () => {
  // 群消息免打扰模式变更
  window.nim.V2NIMSettingService.on('onTeamMessageMuteModeChanged', (teamId, teamType, muteMode) => {
    console.log('群消息免打扰模式变更:', { teamId, teamType, muteMode });
  });

  // 点对点消息免打扰模式变更
  window.nim.V2NIMSettingService.on('onP2PMessageMuteModeChanged', (accountId, muteMode) => {
    console.log('点对点消息免打扰模式变更:', { accountId, muteMode });
  });
};

// 调用设置函数
setupSettingListeners();
`;

    console.log('V2NIMSettingService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMSettingService`}
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
          <Text strong>onTeamMessageMuteModeChanged</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>群消息免打扰模式变更时触发</li>
            <li>参数：teamId, teamType, muteMode</li>
            <li>触发时机：调用 setTeamMessageMuteMode 后</li>
          </ul>
        </div>

        <div>
          <Text strong>onP2PMessageMuteModeChanged</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>点对点消息免打扰模式变更时触发</li>
            <li>参数：accountId, muteMode</li>
            <li>触发时机：调用 setP2PMessageMuteMode 后</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMSettingService 的事件监听功能
          </li>
          <li>
            <strong>触发方式：</strong>在相关设置页面修改免打扰模式后会触发
          </li>
          <li>
            <strong>用途：</strong>监听免打扰设置变更，实时更新界面状态
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
          <li>所有事件详情都会在控制台输出，方便调试和学习</li>
          <li>建议在应用初始化时设置监听，在应用销毁时取消监听</li>
          <li>可以去相关设置页面进行操作来触发事件</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
