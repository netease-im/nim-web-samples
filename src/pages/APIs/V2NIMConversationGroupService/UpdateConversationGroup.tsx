import { Button, Card, Form, Input, Select, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;
const { TextArea } = Input;

interface UpdateConversationGroupFormValues {
  groupId: string;
  name: string;
  serverExtension: string;
}

const defaultUpdateConversationGroupFormValues: UpdateConversationGroupFormValues = {
  groupId: '',
  name: '',
  serverExtension: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMConversationGroupService.updateConversationGroup`;

const UpdateConversationGroupPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): UpdateConversationGroupFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultUpdateConversationGroupFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultUpdateConversationGroupFormValues;
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

  // 页面加载时自动获取会话分组列表
  useEffect(() => {
    // 防止重复加载
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getConversationGroupList();
    }
  }, []);

  // 选择分组时自动填充现有信息
  const handleGroupChange = (groupId: string) => {
    const selectedGroup = conversationGroups.find(group => group.groupId === groupId);
    if (selectedGroup) {
      form.setFieldsValue({
        groupId,
        name: selectedGroup.name,
        serverExtension: selectedGroup.serverExtension || '',
      });
    }
  };

  // 表单提交: 触发 API 调用
  const handleUpdateConversationGroup = async (values: UpdateConversationGroupFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 云端会话特有的逻辑防护
    if (!window.nim.options.enableV2CloudConversation) {
      message.error('NIM SDK 未开启云端会话, 请在初始化时配置打开');
      return;
    }

    const { groupId, name, serverExtension } = values;
    if (!groupId) {
      message.error('请选择要更新的会话分组');
      return;
    }
    if (!name.trim()) {
      message.error('请输入分组名称');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMConversationGroupService.updateConversationGroup execute, params:', {
      groupId,
      name: name.trim(),
      serverExtension: serverExtension.trim(),
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMConversationGroupService.updateConversationGroup(
        groupId,
        name.trim(),
        serverExtension.trim()
      )
    );

    if (error) {
      message.error(`更新会话分组失败: ${error.toString()}`);
      console.error('更新会话分组失败:', error.toString());
    } else {
      message.success('更新会话分组成功');
      console.log('更新会话分组成功, 结果:', result);
      // 操作成功后，重新获取会话分组列表
      getConversationGroupList();
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
    form.setFieldsValue(defaultUpdateConversationGroupFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { groupId, name, serverExtension } = values;

    if (!groupId) {
      message.error('请先选择要更新的会话分组');
      return;
    }
    if (!name.trim()) {
      message.error('请先输入分组名称');
      return;
    }

    const callStatement = `const result = await window.nim.V2NIMConversationGroupService.updateConversationGroup("${groupId}", "${name.trim()}", "${serverExtension.trim()}");`;

    console.log('V2NIMConversationGroupService.updateConversationGroup 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化分组显示信息
  const formatGroupLabel = (group: any) => {
    const createTime = group.createTime ? new Date(group.createTime).toLocaleString() : '未知时间';

    return `${group.name} - ${createTime}`;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleUpdateConversationGroup}
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
          tooltip="选择要更新的会话分组"
          rules={[{ required: true, message: '请选择要更新的会话分组' }]}
        >
          <Select
            placeholder="请选择要更新的会话分组"
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
          label="分组名称"
          name="name"
          tooltip="更新后的分组名称"
          rules={[{ required: true, message: '请输入分组名称' }]}
        >
          <Input placeholder="请输入分组名称" maxLength={50} showCount />
        </Form.Item>

        <Form.Item label="服务端扩展" name="serverExtension" tooltip="更新后的服务端扩展字段">
          <TextArea
            placeholder="服务端扩展字段，由第三方APP自由定义"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              更新分组
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
            <strong>功能：</strong>更新指定云端会话分组的名称和扩展信息
          </li>
          <li>
            <strong>参数：</strong>groupId (分组ID), name (分组名称), serverExtension (服务端扩展)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;V2NIMConversationGroup&gt; (更新后的会话分组对象)
          </li>
          <li>
            <strong>用途：</strong>修改分组的显示名称和业务扩展字段，便于分组管理
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
          <li>选择分组后会自动填充当前的名称和扩展字段</li>
          <li>分组名称必填，服务端扩展字段可选</li>
          <li>更新成功会触发相关事件，变更会同步到云端</li>
          <li>分组显示格式：分组名 (会话数量) - 创建时间</li>
        </ul>
      </Card>
    </div>
  );
};

export default UpdateConversationGroupPage;
