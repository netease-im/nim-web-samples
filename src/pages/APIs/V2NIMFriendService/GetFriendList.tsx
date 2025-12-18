import { Button, Card, Form, Space, Table, Tag, message } from 'antd';
import { V2NIMFriend } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMFriendService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const storageKey = `V2NIMFriendService.getFriendList`;

const GetFriendListPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 好友列表数据
  const [friendList, setFriendList] = useState<V2NIMFriend[]>([]);

  // 表单提交: 触发 API 调用
  const handleGetFriendList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMFriendService.getFriendList execute');

    // 执行 API
    const [error, result] = await to(() => window.nim?.V2NIMFriendService.getFriendList());

    if (error) {
      message.error(`获取好友列表失败: ${error.toString()}`);
      console.error('获取好友列表失败:', error.toString());
      setFriendList([]);
    } else {
      message.success(`获取好友列表成功，共 ${result?.length || 0} 个好友`);
      console.log('获取好友列表成功, 结果:', result);
      setFriendList(result || []);
    }

    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify({}));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 清空好友列表
    setFriendList([]);
    message.success('数据已重置');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const callStatement = `await window.nim.V2NIMFriendService.getFriendList();`;

    console.log('V2NIMFriendService.getFriendList 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化时间戳
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  // 表格列定义
  const columns = [
    {
      title: '好友ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: '15%',
      render: (accountId: string) => <Tag color="blue">{accountId}</Tag>,
    },
    {
      title: '好友备注',
      dataIndex: 'alias',
      key: 'alias',
      width: '15%',
      render: (alias?: string) => alias || '无备注',
    },
    {
      title: '用户昵称',
      key: 'userProfile',
      width: '15%',
      render: (_: any, record: V2NIMFriend) => record.userProfile?.name || record.accountId,
    },
    {
      title: '用户头像',
      key: 'avatar',
      width: '10%',
      render: (_: any, record: V2NIMFriend) =>
        record.userProfile?.avatar ? (
          <img
            src={record.userProfile.avatar}
            alt="头像"
            style={{ width: 32, height: 32, borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#999',
            }}
          >
            无
          </div>
        ),
    },
    {
      title: '好友来源',
      dataIndex: 'source',
      key: 'source',
      width: '10%',
      render: (source?: number) => source ?? 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '15%',
      render: (time?: number) => formatTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: '15%',
      render: (time?: number) => formatTime(time),
    },
    {
      title: '扩展信息',
      key: 'extension',
      width: '10%',
      render: (_: any, record: V2NIMFriend) => {
        const hasServerExt = record.serverExtension && record.serverExtension.trim();
        const hasCustomerExt = record.customerExtension && record.customerExtension.trim();

        if (!hasServerExt && !hasCustomerExt) {
          return '-';
        }

        return (
          <Space direction="vertical" size="small">
            {hasServerExt && (
              <Tag color="green" style={{ fontSize: '10px' }}>
                服务器扩展
              </Tag>
            )}
            {hasCustomerExt && (
              <Tag color="orange" style={{ fontSize: '10px' }}>
                客户端扩展
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetFriendList}
        style={{ marginTop: 24 }}
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

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              获取好友列表
            </Button>
            <Button type="default" onClick={handleReset}>
              清空数据
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 好友列表展示 */}
      {friendList.length > 0 && (
        <Card title={`好友列表 (共 ${friendList.length} 个好友)`} style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={friendList}
            rowKey="accountId"
            pagination={{
              total: friendList.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 个好友`,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>获取当前用户的好友列表
          </li>
          <li>
            <strong>参数：</strong>无参数
          </li>
          <li>
            <strong>返回值：</strong>V2NIMFriend[] (好友信息列表)
          </li>
          <li>
            <strong>用途：</strong>获取完整的好友列表，包含好友基本信息和用户资料
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
          <li>数据来源于登录时的数据同步</li>
          <li>需要等待 onDataSync 数据同步完成后才能调用</li>
          <li>返回的好友列表包含基本信息和关联的用户资料</li>
          <li>支持好友备注、扩展字段等自定义信息</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetFriendListPage;
