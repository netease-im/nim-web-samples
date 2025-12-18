import { Button, Card, Form, Space, Table, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

// 持久化存储最终执行的参数
const storageKey = `V2NIMConversationGroupService.getConversationGroupList`;

const GetConversationGroupListPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 会话分组列表
  const [conversationGroups, setConversationGroups] = useState<any[]>([]);
  // 增强的分组数据（包含实际会话数量）
  const [enhancedGroups, setEnhancedGroups] = useState<any[]>([]);
  // 获取会话数量的加载状态
  const [countLoading, setCountLoading] = useState(false);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取指定分组的实际会话数量
  const getConversationCountByGroupId = async (groupId: string) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      return 0;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      return 0;
    }

    console.log(
      'API V2NIMConversationService.getConversationListByOption execute for groupId:',
      groupId
    );

    // 构建 V2NIMLocalConversationOption 参数，指定 conversationGroupIds
    const option = {
      conversationGroupIds: [groupId],
    };

    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationService.getConversationListByOption(0, 50, option)
    );

    if (error) {
      console.error(`获取分组 ${groupId} 会话列表失败:`, error.toString());
      return 0;
    }

    if (result && result.conversationList) {
      console.log(`分组 ${groupId} 包含 ${result.conversationList.length} 个会话`);
      return result.conversationList.length;
    }

    return 0;
  };

  // 获取所有分组的实际会话数量
  const enhanceGroupsWithConversationCount = async (groups: any[]) => {
    if (!groups || groups.length === 0) {
      setEnhancedGroups([]);
      return;
    }

    setCountLoading(true);
    console.log('开始获取各分组的实际会话数量...');

    const enhancedGroupsPromises = groups.map(async group => {
      const actualCount = await getConversationCountByGroupId(group.groupId);
      return {
        ...group,
        actualConversationCount: actualCount,
      };
    });

    try {
      const enhancedGroupsData = await Promise.all(enhancedGroupsPromises);
      setEnhancedGroups(enhancedGroupsData);
      console.log('所有分组会话数量获取完成:', enhancedGroupsData);
      message.success('已获取所有分组的实际会话数量');
    } catch (error) {
      console.error('获取分组会话数量时出现错误:', error);
      message.error('获取分组会话数量时出现错误');
      setEnhancedGroups(groups); // 降级处理，使用原始数据
    } finally {
      setCountLoading(false);
    }
  };

  // 获取会话分组列表
  const getConversationGroupList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    setLoading(true);
    console.log('API V2NIMConversationGroupService.getConversationGroupList execute');
    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationGroupService.getConversationGroupList()
    );
    setLoading(false);
    if (error) {
      message.error(`获取会话分组列表失败: ${error.toString()}`);
      console.error('获取会话分组列表失败:', error.toString());
      setConversationGroups([]);
      setEnhancedGroups([]);
      return;
    }
    if (result) {
      console.log('获取到的会话分组列表:', result);
      setConversationGroups(result || []);

      if (!result || result.length === 0) {
        message.info('当前没有会话分组');
        setEnhancedGroups([]);
      } else {
        message.success(`获取到 ${result.length} 个会话分组`);
        // 获取每个分组的实际会话数量
        enhanceGroupsWithConversationCount(result);
      }
    }
  };

  // 页面加载时自动获取数据
  useEffect(() => {
    // 防止重复加载
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationGroupList();
    }
  }, []);

  // 输出调用语句到控制台
  const handleOutput = () => {
    const callStatement = `await window.nim.V2NIMConversationGroupService.getConversationGroupList();`;

    console.log('V2NIMConversationGroupService.getConversationGroupList 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化时间显示
  const formatTime = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  // 表格列配置
  const columns = [
    {
      title: '分组ID',
      dataIndex: 'groupId',
      key: 'groupId',
      width: 200,
      ellipsis: true,
    },
    {
      title: '分组名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '实际会话数量',
      key: 'actualConversationCount',
      width: 120,
      render: (record: any) => {
        if (countLoading) {
          return '获取中...';
        }
        return record.actualConversationCount !== undefined ? record.actualConversationCount : '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (timestamp: number) => formatTime(timestamp),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (timestamp: number) => formatTime(timestamp),
    },
  ];

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

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              onClick={getConversationGroupList}
              loading={loading}
              style={{ flex: 1 }}
            >
              获取分组列表
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 分组列表展示 */}
      <Card
        title={`会话分组列表 (共 ${conversationGroups.length} 个)`}
        style={{ marginTop: 16 }}
        size="small"
      >
        <Table
          columns={columns}
          dataSource={enhancedGroups.length > 0 ? enhancedGroups : conversationGroups}
          rowKey="groupId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条记录`,
          }}
          loading={loading || countLoading}
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>获取当前用户的所有云端会话分组列表
          </li>
          <li>
            <strong>参数：</strong>无参数
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;V2NIMConversationGroup[]&gt; (分组列表)
          </li>
          <li>
            <strong>用途：</strong>查看所有已创建的会话分组及其详细信息
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
          <li>页面加载时会自动获取一次分组列表</li>
          <li>分组基础信息包含ID、名称、时间等</li>
          <li>实际会话数量通过额外API调用获取，可能需要等待</li>
          <li>会话数量获取过程中会显示"获取中..."状态</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetConversationGroupListPage;
