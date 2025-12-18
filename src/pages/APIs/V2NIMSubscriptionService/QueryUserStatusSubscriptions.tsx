import { Button, Card, Form, Input, Space, Tag, Typography, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Text } = Typography;

interface QueryUserStatusSubscriptionsFormValues {
  accountIds: string[];
}

const defaultQueryUserStatusSubscriptionsFormValues: QueryUserStatusSubscriptionsFormValues = {
  accountIds: ['autotest80', 'autotest81'],
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMSubscriptionService.queryUserStatusSubscriptions`;

const QueryUserStatusSubscriptionsPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): QueryUserStatusSubscriptionsFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultQueryUserStatusSubscriptionsFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultQueryUserStatusSubscriptionsFormValues;
  };

  const initialValues = getInitialValues();

  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 账号ID输入框的值
  const [accountIdInput, setAccountIdInput] = useState('');
  // 当前账号ID列表
  const [accountIds, setAccountIds] = useState<string[]>(initialValues.accountIds);
  // 查询结果
  const [subscriptionResult, setSubscriptionResult] = useState<any>(null);

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
    const exampleAccounts = ['autotest80', 'autotest81', 'autotest82'];
    const newAccountIds = [...new Set([...accountIds, ...exampleAccounts])];
    setAccountIds(newAccountIds);
    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 表单提交: 触发 API 调用
  const handleQueryUserStatusSubscriptions = async (
    values: QueryUserStatusSubscriptionsFormValues
  ) => {
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
    setSubscriptionResult(null);

    // 打印 API 入参
    console.log(
      'API V2NIMSubscriptionService.queryUserStatusSubscriptions execute, params:',
      formAccountIds
    );

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMSubscriptionService.queryUserStatusSubscriptions(formAccountIds)
    );
    if (error) {
      message.error(`查询用户状态订阅失败: ${error.toString()}`);
      console.error('查询用户状态订阅失败:', error.toString());
    } else {
      message.success('查询用户状态订阅成功');
      console.log('查询用户状态订阅成功, 结果:', result);
      setSubscriptionResult(result);
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
    setAccountIds(defaultQueryUserStatusSubscriptionsFormValues.accountIds);
    form.setFieldsValue(defaultQueryUserStatusSubscriptionsFormValues);
    setSubscriptionResult(null);
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

    const callStatement = `const result = await window.nim.V2NIMSubscriptionService.queryUserStatusSubscriptions(${JSON.stringify(formAccountIds, null, 2)});`;

    console.log('V2NIMSubscriptionService.queryUserStatusSubscriptions 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 处理输入框回车事件
  const handleInputPressEnter = () => {
    handleAddAccountId();
  };

  // 格式化订阅结果显示
  const formatSubscriptionResult = (result: any) => {
    if (!result || !Array.isArray(result)) {
      return <Text type="secondary">无订阅数据</Text>;
    }

    return (
      <div>
        {result.map((subscription, index) => (
          <div
            key={index}
            style={{ marginBottom: 8, padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}
          >
            <div>
              <Text strong>被订阅人的账号ID:</Text> {subscription.accountId}
            </div>
            <div>
              <Text strong>发起订阅时间:</Text>{' '}
              {subscription.subscribeTime
                ? new Date(subscription.subscribeTime).toLocaleString()
                : '未知'}
            </div>
            <div>
              <Text strong>订阅到期时间:</Text>{' '}
              {subscription.subscribeTime && subscription.duration
                ? new Date(
                    subscription.subscribeTime + subscription.duration * 1000
                  ).toLocaleString()
                : '未知'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleQueryUserStatusSubscriptions}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMSubscriptionService`}
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
                placeholder="输入要查询订阅的账号ID"
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

        {subscriptionResult && (
          <Form.Item label="查询结果">{formatSubscriptionResult(subscriptionResult)}</Form.Item>
        )}

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              查询状态订阅
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
            <strong>功能：</strong>查询指定用户的状态订阅信息, 用于续订
          </li>
          <li>
            <strong>参数：</strong>accountIds (要查询的账号ID数组)
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;V2NIMUserStatusSubscription[]&gt;
          </li>
          <li>
            <strong>用途：</strong>获取当前已订阅用户的订阅详情
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
          <li>可用于管理订阅生命周期, 建议定期查询以了解订阅状态，及时续订</li>
        </ul>
      </Card>
    </div>
  );
};

export default QueryUserStatusSubscriptionsPage;
