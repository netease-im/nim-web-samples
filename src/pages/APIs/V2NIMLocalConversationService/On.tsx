import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMLocalConversationService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 会话被创建
  const onConversationCreated = (conversation: V2NIMLocalConversation) => {
    message.success(
      `收到 V2NIMLocalConversationService 模块的 onConversationCreated 事件, 详情见控制台`
    );
    console.log('会话被创建:', conversation);
  };

  // 会话被删除
  const onConversationDeleted = (conversationIds: string[]) => {
    message.warning(
      `收到 V2NIMLocalConversationService 模块的 onConversationDeleted 事件, 详情见控制台`
    );
    console.log('会话被删除:', conversationIds);
  };

  // 会话改变
  const onConversationChanged = (conversationList: V2NIMLocalConversation[]) => {
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onConversationChanged 事件, 详情见控制台`
    );
    console.log('会话有更新:', conversationList);
  };

  // 总未读数改变
  const onTotalUnreadCountChanged = (unreadCount: number) => {
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onTotalUnreadCountChanged 事件, 详情见控制台`
    );
    console.log('总未读数变更:', unreadCount);
  };

  // 指定过滤条件的未读数改变
  const onUnreadCountChangedByFilter = (filter: any, unreadCount: number) => {
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onUnreadCountChangedByFilter 事件, 详情见控制台`
    );
    console.log('过滤条件未读数变更:', { filter, unreadCount });
  };

  // 会话已读时间戳更新
  const onConversationReadTimeUpdated = (conversationId: string, readTime: number) => {
    const readTimeStr = new Date(readTime).toLocaleString();
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onConversationReadTimeUpdated 事件, 详情见控制台`
    );
    console.log('会话已读时间更新:', { conversationId, readTime, readTimeStr });
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMLocalConversationService.off('onConversationCreated', onConversationCreated);
    window.nim.V2NIMLocalConversationService.off('onConversationDeleted', onConversationDeleted);
    window.nim.V2NIMLocalConversationService.off('onConversationChanged', onConversationChanged);
    window.nim.V2NIMLocalConversationService.off(
      'onTotalUnreadCountChanged',
      onTotalUnreadCountChanged
    );
    window.nim.V2NIMLocalConversationService.off(
      'onUnreadCountChangedByFilter',
      onUnreadCountChangedByFilter
    );
    window.nim.V2NIMLocalConversationService.off(
      'onConversationReadTimeUpdated',
      onConversationReadTimeUpdated
    );

    // 设置监听
    window.nim.V2NIMLocalConversationService.on('onConversationCreated', onConversationCreated);
    window.nim.V2NIMLocalConversationService.on('onConversationDeleted', onConversationDeleted);
    window.nim.V2NIMLocalConversationService.on('onConversationChanged', onConversationChanged);
    window.nim.V2NIMLocalConversationService.on(
      'onTotalUnreadCountChanged',
      onTotalUnreadCountChanged
    );
    window.nim.V2NIMLocalConversationService.on(
      'onUnreadCountChangedByFilter',
      onUnreadCountChangedByFilter
    );
    window.nim.V2NIMLocalConversationService.on(
      'onConversationReadTimeUpdated',
      onConversationReadTimeUpdated
    );

    message.success('成功设置本地会话服务监听');
    console.log('本地会话服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有本地会话服务相关的监听
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationCreated');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationDeleted');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationChanged');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onTotalUnreadCountChanged');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onUnreadCountChangedByFilter');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationReadTimeUpdated');

    message.success('已取消所有本地会话服务监听');
    console.log('所有本地会话服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置本地会话服务监听
const setupLocalConversationListeners = () => {
  // 会话被创建
  window.nim.V2NIMLocalConversationService.on('onConversationCreated', (conversation) => {
    console.log('会话被创建:', conversation);
  });

  // 会话被删除
  window.nim.V2NIMLocalConversationService.on('onConversationDeleted', (conversationIds) => {
    console.log('会话被删除:', conversationIds);
  });

  // 会话改变
  window.nim.V2NIMLocalConversationService.on('onConversationChanged', (conversationList) => {
    console.log('会话有更新:', conversationList);
  });

  // 总未读数改变
  window.nim.V2NIMLocalConversationService.on('onTotalUnreadCountChanged', (unreadCount) => {
    console.log('总未读数变更:', unreadCount);
  });

  // 指定过滤条件的未读数改变
  window.nim.V2NIMLocalConversationService.on('onUnreadCountChangedByFilter', (filter, unreadCount) => {
    console.log('过滤条件未读数变更:', { filter, unreadCount });
  });

  // 会话已读时间戳更新
  window.nim.V2NIMLocalConversationService.on('onConversationReadTimeUpdated', (conversationId, readTime) => {
    console.log('会话已读时间更新:', { conversationId, readTime });
  });
};

// 调用设置函数
setupLocalConversationListeners();
`;

    console.log('V2NIMLocalConversationService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLocalConversationService`}
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
          <Text strong>onConversationCreated</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>会话被创建时触发</li>
            <li>参数：conversation (会话对象)</li>
            <li>触发时机：创建新会话时</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onConversationDeleted</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>会话被删除时触发</li>
            <li>参数：conversationIds (会话ID列表)</li>
            <li>触发时机：删除会话时</li>
          </ul>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong>onConversationChanged</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>会话信息更新时触发</li>
            <li>参数：conversationList (会话列表)</li>
            <li>触发时机：会话置顶、免打扰、扩展字段、未读数等变化</li>
          </ul>
        </div>

        <div>
          <Text strong>未读数相关事件</Text>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>onTotalUnreadCountChanged - 总未读数变化</li>
            <li>onUnreadCountChangedByFilter - 过滤条件未读数变化</li>
            <li>onConversationReadTimeUpdated - 会话已读时间更新</li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>演示 V2NIMLocalConversationService 的事件监听功能
          </li>
          <li>
            <strong>触发方式：</strong>去会话相关页面进行操作（创建、删除、置顶、标记已读等）
          </li>
          <li>
            <strong>用途：</strong>监听会话状态变化，实时更新界面和处理业务逻辑
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
          <li>建议在 onDataSync 数据同步完成后再使用会话模块</li>
          <li>会话操作会实时触发相关事件，便于界面状态同步</li>
          <li>所有事件详情都会在控制台输出，方便调试和学习</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
