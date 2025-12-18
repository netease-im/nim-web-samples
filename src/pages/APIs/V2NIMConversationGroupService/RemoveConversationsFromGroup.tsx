import { Button, Card, Form, Select, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;

interface RemoveConversationsFromGroupFormValues {
  groupId: string;
  conversationIds: string[];
}

const defaultRemoveConversationsFromGroupFormValues: RemoveConversationsFromGroupFormValues = {
  groupId: '',
  conversationIds: [],
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMConversationGroupService.removeConversationsFromGroup`;

const RemoveConversationsFromGroupPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): RemoveConversationsFromGroupFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultRemoveConversationsFromGroupFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultRemoveConversationsFromGroupFormValues;
  };

  const initialValues = getInitialValues();

  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 会话分组列表
  const [conversationGroups, setConversationGroups] = useState<any[]>([]);
  // 获取会话分组列表的加载状态
  const [groupsLoading, setGroupsLoading] = useState(false);
  // 当前选中分组的会话列表
  const [groupConversations, setGroupConversations] = useState<any[]>([]);
  // 获取分组会话列表的加载状态
  const [conversationsLoading, setConversationsLoading] = useState(false);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

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

    setGroupsLoading(true);
    console.log('API V2NIMConversationGroupService.getConversationGroupList execute');
    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationGroupService.getConversationGroupList()
    );
    setGroupsLoading(false);
    if (error) {
      message.error(`获取会话分组列表失败: ${error.toString()}`);
      console.error('获取会话分组列表失败:', error.toString());
      setConversationGroups([]);
      return;
    }
    if (result) {
      console.log('获取到的会话分组列表:', result);
      setConversationGroups(result || []);

      if (!result || result.length === 0) {
        message.info('当前没有会话分组');
      } else {
        message.success(`获取到 ${result.length} 个会话分组`);
      }
    }
  };

  // 页面加载时自动获取分组列表
  useEffect(() => {
    // 防止重复加载
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationGroupList();
    }
  }, []);

  // 获取指定分组中的会话列表
  const getConversationsByGroupId = async (groupId: string) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    setConversationsLoading(true);
    console.log(
      'API V2NIMConversationService.getConversationListByOption execute, groupId:',
      groupId
    );

    // 构建 V2NIMLocalConversationOption 参数，指定 conversationGroupIds
    const option = {
      conversationGroupIds: [groupId],
    };

    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationService.getConversationListByOption(0, 50, option)
    );
    setConversationsLoading(false);

    if (error) {
      message.error(`获取分组会话列表失败: ${error.toString()}`);
      console.error('获取分组会话列表失败:', error.toString());
      setGroupConversations([]);
      return;
    }

    if (result) {
      console.log('获取到的分组会话列表:', result);
      setGroupConversations(result.conversationList || []);

      if (!result.conversationList || result.conversationList.length === 0) {
        message.info('该分组中暂无会话');
      } else {
        message.success(`获取到分组中 ${result.conversationList.length} 个会话`);
      }
    }
  };

  // 选择分组时更新该分组的会话列表
  const handleGroupChange = (groupId: string) => {
    // 清空已选择的会话
    form.setFieldValue('conversationIds', []);
    // 获取该分组中的会话列表
    getConversationsByGroupId(groupId);
  };

  // 表单提交: 触发 API 调用
  const handleRemoveConversationsFromGroup = async (
    values: RemoveConversationsFromGroupFormValues
  ) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    const { groupId, conversationIds } = values;
    if (!groupId) {
      message.error('请选择会话分组');
      return;
    }
    if (!conversationIds || conversationIds.length === 0) {
      message.error('请选择要移除的会话');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMConversationGroupService.removeConversationsFromGroup execute, params:', {
      groupId,
      conversationIds,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMConversationGroupService.removeConversationsFromGroup(
        groupId,
        conversationIds
      )
    );

    if (error) {
      message.error(`从分组移除会话失败: ${error.toString()}`);
      console.error('从分组移除会话失败:', error.toString());
    } else {
      message.success('从分组移除会话成功');
      console.log('从分组移除会话成功, groupId:', groupId, 'conversationIds:', conversationIds);
      // 操作成功后，重新获取会话分组列表
      getConversationGroupList();
      // 清空已选择的会话
      form.setFieldValue('conversationIds', []);
    }
    // finally
    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultRemoveConversationsFromGroupFormValues);
    setGroupConversations([]);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { groupId, conversationIds } = values;

    if (!groupId) {
      message.error('请先选择会话分组');
      return;
    }
    if (!conversationIds || conversationIds.length === 0) {
      message.error('请先选择要移除的会话');
      return;
    }

    const callStatement = `await window.nim.V2NIMConversationGroupService.removeConversationsFromGroup("${groupId}", ${JSON.stringify(conversationIds)});`;

    console.log('V2NIMConversationGroupService.removeConversationsFromGroup 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化分组显示信息
  const formatGroupLabel = (group: any) => {
    const createTime = group.createTime ? new Date(group.createTime).toLocaleString() : '未知时间';

    return `${group.name} - ${createTime}`;
  };

  // 格式化会话显示信息
  const formatConversationLabel = (conversation: any) => {
    const typeMap: { [key: number]: string } = {
      1: 'P2P',
      2: '群聊',
      3: '超大群',
    };

    const conversationType = typeMap[conversation.type] || '未知';
    const lastMessageTime = conversation.updateTime
      ? new Date(conversation.updateTime).toLocaleString()
      : '无消息';

    return `${conversationType} - ${conversation.conversationId} - ${lastMessageTime}`;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleRemoveConversationsFromGroup}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
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

        <Form.Item
          label="选择分组"
          name="groupId"
          tooltip="选择要移除会话的分组"
          rules={[{ required: true, message: '请选择会话分组' }]}
        >
          <Select
            placeholder="请选择会话分组"
            loading={groupsLoading}
            notFoundContent={groupsLoading ? '获取中...' : '暂无会话分组'}
            onChange={handleGroupChange}
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: 8, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    onClick={getConversationGroupList}
                    loading={groupsLoading}
                    style={{ padding: 0 }}
                  >
                    刷新分组列表
                  </Button>
                </div>
              </div>
            )}
          >
            {conversationGroups.map(group => (
              <Option key={group.groupId} value={group.groupId}>
                {formatGroupLabel(group)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="选择会话"
          name="conversationIds"
          tooltip="选择要从分组中移除的会话"
          rules={[{ required: true, message: '请选择要移除的会话' }]}
        >
          <Select
            mode="multiple"
            placeholder="请先选择分组，然后选择要移除的会话"
            loading={conversationsLoading}
            disabled={conversationsLoading}
            notFoundContent={
              conversationsLoading
                ? '获取中...'
                : groupConversations.length
                  ? '暂无会话'
                  : '请先选择分组'
            }
            dropdownRender={menu => (
              <div>
                {menu}
                {form.getFieldValue('groupId') && (
                  <div style={{ padding: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      type="link"
                      onClick={() => getConversationsByGroupId(form.getFieldValue('groupId'))}
                      loading={conversationsLoading}
                      style={{ padding: 0 }}
                    >
                      刷新会话列表
                    </Button>
                  </div>
                )}
              </div>
            )}
          >
            {groupConversations.map(conversation => (
              <Option key={conversation.conversationId} value={conversation.conversationId}>
                {formatConversationLabel(conversation)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }} danger>
              移除会话
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>将指定的会话从云端会话分组中移除
          </li>
          <li>
            <strong>参数：</strong>groupId (分组ID), conversationIds (会话ID列表)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;void&gt; (无返回值)
          </li>
          <li>
            <strong>用途：</strong>从分组中移除不需要的会话，会话本身不会被删除
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
          <li>只能移除分组中已存在的会话</li>
          <li>移除会话不会删除会话本身，只是解除分组关系</li>
          <li>操作成功会触发相关事件，变更会同步到云端</li>
          <li>选择分组后会显示该分组中的所有会话</li>
        </ul>
      </Card>
    </div>
  );
};

export default RemoveConversationsFromGroupPage;
