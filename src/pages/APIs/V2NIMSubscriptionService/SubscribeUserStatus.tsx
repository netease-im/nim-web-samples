import { Button, Card, Form, Input, InputNumber, Space, Switch, Tag, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface SubscribeUserStatusFormValues {
  accountIds: string[];
  duration: number;
  immediateSync: boolean;
}

const defaultSubscribeUserStatusFormValues: SubscribeUserStatusFormValues = {
  accountIds: ['autotest80', 'autotest81'],
  duration: 3000,
  immediateSync: true,
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMSubscriptionService.subscribeUserStatus`;

const SubscribeUserStatusPage = () => {
  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): SubscribeUserStatusFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultSubscribeUserStatusFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultSubscribeUserStatusFormValues;
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
  const handleSubscribeUserStatus = async (values: SubscribeUserStatusFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountIds: formAccountIds, duration, immediateSync } = values;
    if (!formAccountIds || formAccountIds.length === 0) {
      message.error('请至少输入一个账号ID');
      return;
    }

    const params = {
      accountIds: formAccountIds,
      duration,
      immediateSync,
    };

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMSubscriptionService.subscribeUserStatus execute, params:', params);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMSubscriptionService.subscribeUserStatus(params)
    );
    if (error) {
      message.error(`订阅用户状态失败: ${error.toString()}`);
      console.error('订阅用户状态失败:', error.toString());
    } else {
      message.success('订阅用户状态成功');
      console.log('订阅用户状态成功, 结果:', result);
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
    setAccountIds(defaultSubscribeUserStatusFormValues.accountIds);
    form.setFieldsValue(defaultSubscribeUserStatusFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { accountIds: formAccountIds, duration, immediateSync } = values;

    if (!formAccountIds || formAccountIds.length === 0) {
      message.error('请先输入账号ID');
      return;
    }

    const params = {
      accountIds: formAccountIds,
      duration,
      immediateSync,
    };

    const callStatement = `await window.nim.V2NIMSubscriptionService.subscribeUserStatus(${JSON.stringify(params, null, 2)});`;

    console.log('V2NIMSubscriptionService.subscribeUserStatus 调用语句:');
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
        onFinish={handleSubscribeUserStatus}
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
                placeholder="输入要订阅的账号ID"
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

        <Form.Item
          label="持续时间"
          name="duration"
          tooltip="订阅的持续时间，单位为秒，最大值为 2592000 秒"
          rules={[
            { required: true, message: '请输入持续时间' },
            { type: 'number', min: 60, max: 2592000, message: '持续时间必须在 60-2592000 秒之间' },
          ]}
        >
          <InputNumber
            placeholder="请输入持续时间（秒）"
            min={60}
            max={2592000}
            style={{ width: '100%' }}
            addonAfter="秒"
          />
        </Form.Item>

        <Form.Item
          label="立即同步"
          name="immediateSync"
          tooltip="是否立即同步用户状态，如果为 true，会立即返回已缓存的用户状态"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              订阅用户状态
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
            <strong>功能：</strong>订阅指定用户的状态变化
          </li>
          <li>
            <strong>参数 params：</strong>
            <ul style={{ marginTop: 4, marginBottom: 0 }}>
              <li>params.accountIds: 要订阅的账号ID数组</li>
              <li>params.duration: 订阅持续时间（秒），最大300秒</li>
              <li>params.immediateSync: 是否立即同步已缓存的用户状态</li>
            </ul>
          </li>
          <li>
            <strong>返回值：</strong>Promise&lt;void&gt;
          </li>
          <li>
            <strong>用途：</strong>监听指定用户的在线状态和自定义状态变化
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
          <li>订阅成功后，可通过 onUserStatusChanged 事件监听状态变化</li>
          <li>订阅有时间限制，到期后需要重新订阅</li>
          <li>
            订阅后, 本端能收到目标用户上线, 离线状态的变更事件. <br />
            如果需要 "忙碌" 的状态, 开发者请使用 publishCustomUserStatus 发布自定义状态
          </li>
          <li>immediateSync 为 true 时会立即回调一次 onUserStatusChanged 事件</li>
        </ul>
      </Card>
    </div>
  );
};

export default SubscribeUserStatusPage;
