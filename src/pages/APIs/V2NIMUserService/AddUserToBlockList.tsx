import { Button, Card, Form, Input, Select, Space, Table, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface BlockListUser {
  accountId: string;
  nickname?: string;
  avatar?: string;
}

interface AddUserToBlockListFormValues {
  accountId: string;
}

interface RemoveUserFromBlockListFormValues {
  accountId: string;
}

const defaultAddUserFormValues: AddUserToBlockListFormValues = {
  accountId: '',
};

const defaultRemoveUserFormValues: RemoveUserFromBlockListFormValues = {
  accountId: '',
};

// 持久化存储最终执行的参数
const addUserStorageKey = `V2NIMUserService.addUserToBlockList`;
const removeUserStorageKey = `V2NIMUserService.removeUserFromBlockList`;

const AddUserToBlockListPage = () => {
  // 表单数据
  const [addForm] = Form.useForm();
  const [removeForm] = Form.useForm();

  // 表单提交正在加载状态
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // 黑名单列表数据
  const [blockList, setBlockList] = useState<BlockListUser[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取黑名单列表
  const getBlockList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setRefreshLoading(true);

    console.log('API V2NIMUserService.getBlockList execute');

    const [error, result] = await to(() => window.nim?.V2NIMUserService.getBlockList());

    if (error) {
      message.error(`获取黑名单列表失败: ${error.toString()}`);
      console.error('获取黑名单列表失败:', error.toString());
    } else {
      console.log('获取黑名单列表成功, 结果:', result);

      // 转换数据格式
      const blockListData: BlockListUser[] = (result || []).map((accountId: string) => ({
        accountId,
        nickname: accountId, // 这里可以通过getUserList获取用户详细信息
        avatar: '',
      }));

      setBlockList(blockListData);
      message.success(`获取黑名单列表成功，共 ${blockListData.length} 个用户`);
    }

    setRefreshLoading(false);
  };

  // 页面加载时获取黑名单列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getBlockList();
    }
  }, []);

  // 添加用户到黑名单
  const handleAddUserToBlockList = async (values: AddUserToBlockListFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountId } = values;
    if (!accountId?.trim()) {
      message.error('请输入要添加到黑名单的用户ID');
      return;
    }

    setAddLoading(true);

    // 打印 API 入参
    console.log('API V2NIMUserService.addUserToBlockList execute, params:', accountId);

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMUserService.addUserToBlockList(accountId.trim())
    );

    if (error) {
      message.error(`添加用户到黑名单失败: ${error.toString()}`);
      console.error('添加用户到黑名单失败:', error.toString());
    } else {
      message.success('添加用户到黑名单成功');
      console.log('添加用户到黑名单成功');

      // 重新获取黑名单列表
      await getBlockList();

      // 清空表单
      addForm.resetFields();
    }

    setAddLoading(false);

    // 存储最终执行的参数
    localStorage.setItem(addUserStorageKey, JSON.stringify(values));
  };

  // 从黑名单移除用户
  const handleRemoveUserFromBlockList = async (values: RemoveUserFromBlockListFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountId } = values;
    if (!accountId?.trim()) {
      message.error('请选择要从黑名单移除的用户');
      return;
    }

    setRemoveLoading(true);

    // 打印 API 入参
    console.log('API V2NIMUserService.removeUserFromBlockList execute, params:', accountId);

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMUserService.removeUserFromBlockList(accountId.trim())
    );

    if (error) {
      message.error(`从黑名单移除用户失败: ${error.toString()}`);
      console.error('从黑名单移除用户失败:', error.toString());
    } else {
      message.success('从黑名单移除用户成功');
      console.log('从黑名单移除用户成功');

      // 重新获取黑名单列表
      await getBlockList();

      // 清空表单
      removeForm.resetFields();
    }

    setRemoveLoading(false);

    // 存储最终执行的参数
    localStorage.setItem(removeUserStorageKey, JSON.stringify(values));
  };

  // 重置添加表单
  const handleResetAddForm = () => {
    localStorage.removeItem(addUserStorageKey);
    addForm.setFieldsValue(defaultAddUserFormValues);
    message.success('添加表单已重置');
  };

  // 重置移除表单
  const handleResetRemoveForm = () => {
    localStorage.removeItem(removeUserStorageKey);
    removeForm.setFieldsValue(defaultRemoveUserFormValues);
    message.success('移除表单已重置');
  };

  // 输出添加用户调用语句
  const handleOutputAddStatement = () => {
    const values = addForm.getFieldsValue();
    const { accountId } = values;

    if (!accountId?.trim()) {
      message.error('请先输入用户ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMUserService.addUserToBlockList("${accountId.trim()}");`;
    console.log('V2NIMUserService.addUserToBlockList 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 输出移除用户调用语句
  const handleOutputRemoveStatement = () => {
    const values = removeForm.getFieldsValue();
    const { accountId } = values;

    if (!accountId?.trim()) {
      message.error('请先选择用户ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMUserService.removeUserFromBlockList("${accountId.trim()}");`;
    console.log('V2NIMUserService.removeUserFromBlockList 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 表格列定义
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: '40%',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: '40%',
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (_: any, record: BlockListUser) => (
        <Button
          size="small"
          danger
          onClick={() => {
            removeForm.setFieldsValue({ accountId: record.accountId });
            handleRemoveUserFromBlockList({ accountId: record.accountId });
          }}
        >
          移除
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.formContainer}>
      {/* 黑名单列表 */}
      <Card
        title="黑名单列表"
        extra={
          <Button type="primary" onClick={getBlockList} loading={refreshLoading}>
            刷新列表
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={columns}
          dataSource={blockList}
          rowKey="accountId"
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无黑名单用户' }}
        />
      </Card>

      {/* 添加用户到黑名单表单 */}
      <Card title="添加用户到黑名单" style={{ marginBottom: 24 }}>
        <Form
          form={addForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={handleAddUserToBlockList}
          initialValues={defaultAddUserFormValues}
        >
          <Form.Item key="api1" label={null} className={styles.leftAligned}>
            <p className={styles.interfaceAPI}>
              <a
                href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMUserService`}
                target="_blank"
              >
                {addUserStorageKey}
              </a>
            </p>
          </Form.Item>

          <Form.Item
            label="用户ID"
            name="accountId"
            rules={[
              { required: true, message: '请输入用户ID' },
              { whitespace: true, message: '用户ID不能为空' },
            ]}
          >
            <Input placeholder="请输入要添加到黑名单的用户ID" />
          </Form.Item>

          <Form.Item label={null}>
            <Space size="middle" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={addLoading} style={{ flex: 1 }}>
                添加到黑名单
              </Button>
              <Button type="default" onClick={handleResetAddForm}>
                重置
              </Button>
              <Button type="default" onClick={handleOutputAddStatement}>
                输出调用语句
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 从黑名单移除用户表单 */}
      <Card title="从黑名单移除用户" style={{ marginBottom: 24 }}>
        <Form
          form={removeForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={handleRemoveUserFromBlockList}
          initialValues={defaultRemoveUserFormValues}
        >
          <Form.Item key="api2" label={null} className={styles.leftAligned}>
            <p className={styles.interfaceAPI}>
              <a
                href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMUserService`}
                target="_blank"
              >
                {removeUserStorageKey}
              </a>
            </p>
          </Form.Item>

          <Form.Item
            label="用户ID"
            name="accountId"
            rules={[{ required: true, message: '请选择要移除的用户' }]}
          >
            <Select placeholder="请选择要从黑名单移除的用户">
              {blockList.map(user => (
                <Select.Option key={user.accountId} value={user.accountId}>
                  {user.accountId}{' '}
                  {user.nickname && user.nickname !== user.accountId ? `(${user.nickname})` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={null}>
            <Space size="middle" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={removeLoading} style={{ flex: 1 }}>
                从黑名单移除
              </Button>
              <Button type="default" onClick={handleResetRemoveForm}>
                重置
              </Button>
              <Button type="default" onClick={handleOutputRemoveStatement}>
                输出调用语句
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>管理用户黑名单，支持添加和移除黑名单用户
          </li>
          <li>
            <strong>参数：</strong>accountId (用户账号ID)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，成功时触发相关事件回调
          </li>
          <li>
            <strong>用途：</strong>屏蔽指定用户，不接收其发送的消息
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
          <li>添加到黑名单后，将不会收到该用户发送的消息</li>
          <li>黑名单操作会触发相关事件，可通过监听器接收通知</li>
          <li>可以通过表格中的"移除"按钮快速移除黑名单用户</li>
          <li>所有操作完成后会自动刷新黑名单列表</li>
        </ul>
      </Card>
    </div>
  );
};

export default AddUserToBlockListPage;
