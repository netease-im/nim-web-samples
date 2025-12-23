import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMConversationService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMConversationGroupService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 会话分组被创建
  const onConversationGroupCreated = (conversationGroup: any) => {
    message.success(
      `收到 V2NIMConversationGroupService 模块的 onConversationGroupCreated 事件, 详情见控制台`
    );
    console.log('云端会话分组被创建:', conversationGroup);
  };

  // 会话分组被删除
  const onConversationGroupDeleted = (groupId: string) => {
    message.warning(
      `收到 V2NIMConversationGroupService 模块的 onConversationGroupDeleted 事件, 详情见控制台`
    );
    console.log('云端会话分组被删除:', groupId);
  };

  // 会话分组被更新
  const onConversationGroupChanged = (conversationGroup: any) => {
    message.info(
      `收到 V2NIMConversationGroupService 模块的 onConversationGroupChanged 事件, 详情见控制台`
    );
    console.log('云端会话分组被更新:', conversationGroup);
  };

  // 会话被添加到分组
  const onConversationsAddedToGroup = (groupId: string, list: V2NIMConversation[]) => {
    message.info(
      `收到 V2NIMConversationGroupService 模块的 onConversationsAddedToGroup 事件, 详情见控制台`
    );
    console.log('会话被添加到分组:', { groupId, list });
  };

  // 会话从分组中移除
  const onConversationsRemovedFromGroup = (groupId: string, ids: string[]) => {
    message.info(
      `收到 V2NIMConversationGroupService 模块的 onConversationsRemovedFromGroup 事件, 详情见控制台`
    );
    console.log('会话从分组中移除:', { groupId, ids });
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMConversationGroupService.off(
      'onConversationGroupCreated',
      onConversationGroupCreated
    );
    window.nim.V2NIMConversationGroupService.off(
      'onConversationGroupDeleted',
      onConversationGroupDeleted
    );
    window.nim.V2NIMConversationGroupService.off(
      'onConversationGroupChanged',
      onConversationGroupChanged
    );
    window.nim.V2NIMConversationGroupService.off(
      'onConversationsAddedToGroup',
      onConversationsAddedToGroup
    );
    window.nim.V2NIMConversationGroupService.off(
      'onConversationsRemovedFromGroup',
      onConversationsRemovedFromGroup
    );

    // 设置监听
    window.nim.V2NIMConversationGroupService.on(
      'onConversationGroupCreated',
      onConversationGroupCreated
    );
    window.nim.V2NIMConversationGroupService.on(
      'onConversationGroupDeleted',
      onConversationGroupDeleted
    );
    window.nim.V2NIMConversationGroupService.on(
      'onConversationGroupChanged',
      onConversationGroupChanged
    );
    window.nim.V2NIMConversationGroupService.on(
      'onConversationsAddedToGroup',
      onConversationsAddedToGroup
    );
    window.nim.V2NIMConversationGroupService.on(
      'onConversationsRemovedFromGroup',
      onConversationsRemovedFromGroup
    );

    message.success('成功设置云端会话分组服务监听');
    console.log('云端会话分组服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    // 取消掉所有云端会话分组服务相关的监听
    window.nim.V2NIMConversationGroupService.removeAllListeners('onConversationGroupCreated');
    window.nim.V2NIMConversationGroupService.removeAllListeners('onConversationGroupDeleted');
    window.nim.V2NIMConversationGroupService.removeAllListeners('onConversationGroupChanged');
    window.nim.V2NIMConversationGroupService.removeAllListeners('onConversationsAddedToGroup');
    window.nim.V2NIMConversationGroupService.removeAllListeners('onConversationsRemovedFromGroup');

    message.success('已取消所有云端会话分组服务监听');
    console.log('所有云端会话分组服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置云端会话分组服务监听
const setupCloudConversationGroupListeners = () => {
  // 会话分组被创建
  window.nim.V2NIMConversationGroupService.on('onConversationGroupCreated', (conversationGroup) => {
    console.log('云端会话分组被创建:', conversationGroup);
  });

  // 会话分组被删除
  window.nim.V2NIMConversationGroupService.on('onConversationGroupDeleted', (groupId) => {
    console.log('云端会话分组被删除:', groupId);
  });

  // 会话分组被更新
  window.nim.V2NIMConversationGroupService.on('onConversationGroupChanged', (conversationGroup) => {
    console.log('云端会话分组被更新:', conversationGroup);
  });

  // 会话被添加到分组
  window.nim.V2NIMConversationGroupService.on('onConversationsAddedToGroup', (groupId, conversationId) => {
    console.log('会话被添加到分组:', { groupId, conversationId });
  });

  // 会话从分组中移除
  window.nim.V2NIMConversationGroupService.on('onConversationsRemovedFromGroup', (groupId, conversationId) => {
    console.log('会话从分组中移除:', { groupId, conversationId });
  });
};

// 调用设置函数
setupCloudConversationGroupListeners();
`;

    console.log('V2NIMConversationGroupService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMConversationGroupService`}
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
          <Text strong>onConversationGroupCreated</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>云端会话分组被创建时触发</li>
            <li>参数：conversationGroup (分组对象)</li>
            <li>触发时机：创建新的云端会话分组时</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onConversationGroupDeleted</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>云端会话分组被删除时触发</li>
            <li>参数：groupId (分组ID)</li>
            <li>触发时机：删除云端会话分组时</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onConversationGroupChanged</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>云端会话分组信息更新时触发</li>
            <li>参数：conversationGroup (分组对象)</li>
            <li>触发时机：分组名称、扩展字段等变化</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onConversationsAddedToGroup</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>会话被添加到分组时触发</li>
            <li>参数：groupId (分组ID), conversationId (会话ID)</li>
            <li>触发时机：向分组添加会话时</li>
          </ul>
        </div>

        <div>
          <Text strong>onConversationsRemovedFromGroup</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>会话从分组中移除时触发</li>
            <li>参数：groupId (分组ID), conversationId (会话ID)</li>
            <li>触发时机：从分组移除会话时</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMConversationGroupService 的云端会话分组事件监听功能
          </li>
          <li>
            <strong>触发方式：</strong>
            去会话分组相关页面进行操作（创建、删除、更新、添加会话、移除会话等）
          </li>
          <li>
            <strong>用途：</strong>监听云端会话分组状态变化，实时更新界面和处理业务逻辑
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
          <li>需要先启用云端会话功能才能使用此API</li>
          <li>重复监听同一事件会导致多次触发，建议先取消监听再设置</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
