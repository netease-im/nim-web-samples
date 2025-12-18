import { Button, Card, Form, Input, Space, Switch, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface DeleteFriendFormValues {
  accountId: string;
  params: {
    deleteAlias: boolean;
  };
}

const defaultDeleteFriendFormValues: DeleteFriendFormValues = {
  accountId: '',
  params: {
    deleteAlias: false,
  },
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMFriendService.deleteFriend`;

const DeleteFriendPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): DeleteFriendFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultDeleteFriendFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultDeleteFriendFormValues;
  };

  const initialValues = getInitialValues();

  // 表单提交: 触发 API 调用
  const handleDeleteFriend = async (values: DeleteFriendFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountId, params } = values;
    if (!accountId.trim()) {
      message.error('请输入要删除的好友账号ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMFriendService.deleteFriend execute, params:', accountId, params);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMFriendService.deleteFriend(accountId, params)
    );
    if (error) {
      message.error(`删除好友失败: ${error.toString()}`);
      console.error('删除好友失败:', error.toString());
    } else {
      message.success('删除好友成功');
      console.log('删除好友成功, 结果:', result);
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
    form.setFieldsValue(defaultDeleteFriendFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { accountId, params } = values;

    if (!accountId.trim()) {
      message.error('请先输入要删除的好友账号ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMFriendService.deleteFriend(${JSON.stringify(accountId)}, ${JSON.stringify(params)});`;

    console.log('V2NIMFriendService.deleteFriend 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleDeleteFriend}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMFriendService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="好友账号ID"
          name="accountId"
          rules={[{ required: true, message: '请输入要删除的好友账号ID' }]}
        >
          <Input placeholder="请输入要删除的好友账号ID" />
        </Form.Item>

        <Form.Item
          label="删除好友备注"
          name={['params', 'deleteAlias']}
          valuePropName="checked"
          extra="是否同时删除对该好友的备注信息"
        >
          <Switch checkedChildren="删除" unCheckedChildren="保留" />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              删除好友
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
            <strong>功能：</strong>删除指定的好友关系
          </li>
          <li>
            <strong>参数：</strong>accountId (好友ID), deleteAlias (是否删除备注)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，成功时触发好友事件回调
          </li>
          <li>
            <strong>用途：</strong>解除好友关系，可选择是否保留好友备注信息
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
          <li>删除好友操作不可逆，请确认后再操作</li>
          <li>删除前请确保目标账号确实是你的好友</li>
          <li>成功删除后会触发相应的事件回调</li>
          <li>删除后聊天记录仍会保留，只是解除好友关系</li>
        </ul>
      </Card>
    </div>
  );
};

export default DeleteFriendPage;
