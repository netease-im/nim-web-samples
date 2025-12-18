import { Button, Card, Form, Input, Space, Tag, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface GetUserListFromCloudFormValues {
  accountIds: string[];
}

const defaultGetUserListFromCloudFormValues: GetUserListFromCloudFormValues = {
  accountIds: ['cs1', 'cs2'],
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMUserService.getUserListFromCloud`;

const GetUserListFromCloudPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 账号ID输入框的值
  const [accountIdInput, setAccountIdInput] = useState('');
  // 当前账号ID列表
  const [accountIds, setAccountIds] = useState<string[]>(
    defaultGetUserListFromCloudFormValues.accountIds
  );

  // 获取初始值
  const initialValues = { ...defaultGetUserListFromCloudFormValues };

  // 添加账号ID
  const handleAddAccountId = () => {
    const trimmedInput = accountIdInput.trim();
    if (!trimmedInput) {
      message.warning('请输入账号ID');
      return;
    }
    if (accountIds.includes(trimmedInput)) {
      message.warning('账号ID已存在');
      return;
    }
    const newAccountIds = [...accountIds, trimmedInput];
    setAccountIds(newAccountIds);
    setAccountIdInput('');
    // 更新表单值
    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 移除账号ID
  const handleRemoveAccountId = (accountId: string) => {
    const newAccountIds = accountIds.filter(id => id !== accountId);
    setAccountIds(newAccountIds);
    // 更新表单值
    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 清空所有账号ID
  const handleClearAccountIds = () => {
    setAccountIds([]);
    form.setFieldsValue({ accountIds: [] });
  };

  // 添加示例账号
  const handleAddExampleAccounts = () => {
    const exampleAccounts = ['cs1', 'cs2', 'cs3'];
    const newAccountIds = [...new Set([...accountIds, ...exampleAccounts])];
    setAccountIds(newAccountIds);
    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 表单提交: 触发 API 调用
  const handleGetUserListFromCloud = async (values: GetUserListFromCloudFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountIds: formAccountIds } = values;
    if (!formAccountIds || formAccountIds.length === 0) {
      message.error('请至少输入一个账号ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMUserService.getUserListFromCloud execute, params:', formAccountIds);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMUserService.getUserListFromCloud(formAccountIds)
    );
    if (error) {
      message.error(`从云端获取用户列表失败: ${error.toString()}`);
      console.error('从云端获取用户列表失败:', error.toString());
    } else {
      message.success('从云端获取用户列表成功');
      console.log('从云端获取用户列表成功, 结果:', result);
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
    setAccountIds(defaultGetUserListFromCloudFormValues.accountIds);
    form.setFieldsValue(defaultGetUserListFromCloudFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { accountIds: formAccountIds } = values;

    if (!formAccountIds || formAccountIds.length === 0) {
      message.error('请先输入账号ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMUserService.getUserListFromCloud(${JSON.stringify(formAccountIds)});`;

    console.log('V2NIMUserService.getUserListFromCloud 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 处理输入框回车事件
  const handleInputPressEnter = () => {
    handleAddAccountId();
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetUserListFromCloud}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
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

        <Form.Item label="账号ID列表" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="输入账号ID"
                value={accountIdInput}
                onChange={e => setAccountIdInput(e.target.value)}
                onPressEnter={handleInputPressEnter}
              />
              <Button type="primary" onClick={handleAddAccountId}>
                添加
              </Button>
            </Space.Compact>

            <Space size="small" style={{ marginTop: 8 }}>
              <Button size="small" onClick={handleAddExampleAccounts}>
                添加示例账号
              </Button>
              <Button size="small" onClick={handleClearAccountIds} danger>
                清空全部
              </Button>
            </Space>

            {accountIds.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Space size={[0, 8]} wrap>
                  {accountIds.map(accountId => (
                    <Tag key={accountId} closable onClose={() => handleRemoveAccountId(accountId)}>
                      {accountId}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Space>
        </Form.Item>

        <Form.Item name="accountIds" hidden>
          <Input />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              从云端获取用户列表
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
            <strong>功能：</strong>从云端获取指定账号的最新用户信息列表
          </li>
          <li>
            <strong>参数：</strong>accountIds (账号ID数组，最多150个)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMUser[] (用户信息列表)
          </li>
          <li>
            <strong>用途：</strong>获取服务器上最新的用户信息，确保实时性
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
          <li>直接从服务器获取最新数据，保证信息的实时性</li>
          <li>相比 getUserList，此接口不依赖本地缓存</li>
          <li>建议在需要实时感知用户最新信息的场景下使用</li>
          <li>频繁调用会增加网络请求，建议合理使用</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetUserListFromCloudPage;
