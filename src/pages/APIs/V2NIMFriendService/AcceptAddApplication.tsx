import { Button, Card, Empty, Form, Select, Space, Spin, Tag, message } from 'antd';
import { V2NIMFriendAddApplication } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMFriendService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface AcceptAddApplicationFormValues {
  applicationDesc: string | null;
}

const defaultAcceptAddApplicationFormValues: AcceptAddApplicationFormValues = {
  applicationDesc: null,
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMFriendService.acceptAddApplication`;

const AcceptAddApplicationPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取申请列表的加载状态
  const [fetchingApplications, setFetchingApplications] = useState(false);
  // 好友申请列表
  const [applications, setApplications] = useState<V2NIMFriendAddApplication[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = () => defaultAcceptAddApplicationFormValues;

  const initialValues = getInitialValues();

  // 获取好友申请列表
  const fetchApplicationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setFetchingApplications(true);

    const option = {
      offset: 0,
      limit: 50,
      status: [0], // 只获取待处理的申请
    };

    // 打印 API 入参
    console.log('API V2NIMFriendService.getAddApplicationList execute, params:', option);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMFriendService.getAddApplicationList(option)
    );

    if (error) {
      message.error(`获取好友申请列表失败: ${error.toString()}`);
      console.error('获取好友申请列表失败:', error);
      setApplications([]);
    } else {
      console.log('获取好友申请列表成功, 结果:', result);
      // 过滤出待处理的申请（status = 0）
      const pendingApplications = (result?.infos || []).filter(
        (app: V2NIMFriendAddApplication) => app.status === 0
      );
      setApplications(pendingApplications);

      if (pendingApplications.length === 0) {
        message.info('暂无待处理的好友申请');
      } else {
        message.success(`获取到 ${pendingApplications.length} 条待处理的好友申请`);
      }
    }
    // finally
    setFetchingApplications(false);
  };

  // 组件挂载时获取申请列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchApplicationList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleAcceptAddApplication = async (values: AcceptAddApplicationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }
    const { applicationDesc } = values;
    if (!applicationDesc) {
      message.error('请选择要接受的好友申请');
      return;
    }
    // 根据 applicationId 查找完整的申请对象
    const application = applications.find(
      app => `${app.applicantAccountId}-${app.timestamp}` === applicationDesc
    );
    if (!application) {
      message.error('未找到对应的好友申请');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMFriendService.acceptAddApplication execute, params:', application);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMFriendService.acceptAddApplication(application)
    );
    if (error) {
      message.error(`接受好友申请失败: ${error.toString()}`);
      console.error('接受好友申请失败:', error.toString());
    } else {
      message.success('接受好友申请成功');
      console.log('接受好友申请成功, 结果:', result);
      // 重新获取申请列表
      await fetchApplicationList();
      // 清空表单选择
      form.setFieldsValue({ application: null });
    }
    // finally
    setLoading(false);
    // 存储最终执行的参数
    // localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultAcceptAddApplicationFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { application } = values;

    if (!application) {
      message.error('请先选择要接受的好友申请');
      return;
    }

    const callStatement = `await window.nim.V2NIMFriendService.acceptAddApplication(${JSON.stringify(application, null, 2)});`;

    console.log('V2NIMFriendService.acceptAddApplication 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 刷新申请列表
  const handleRefreshApplications = () => {
    fetchApplicationList();
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 获取状态标签
  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="orange">待处理</Tag>;
      case 1:
        return <Tag color="green">已同意</Tag>;
      case 2:
        return <Tag color="red">已拒绝</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleAcceptAddApplication}
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

        <Form.Item label="好友申请列表">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button
                onClick={handleRefreshApplications}
                loading={fetchingApplications}
                size="small"
              >
                刷新申请列表
              </Button>
              <span style={{ color: '#666', fontSize: '12px' }}>
                {fetchingApplications ? '正在获取...' : `共 ${applications.length} 条待处理申请`}
              </span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item
          label="选择申请"
          name="applicationDesc"
          rules={[{ required: true, message: '请选择要接受的好友申请' }]}
        >
          <Select
            placeholder="请选择要接受的好友申请"
            loading={fetchingApplications}
            notFoundContent={
              fetchingApplications ? (
                <Spin size="small" />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待处理的好友申请" />
              )
            }
            optionLabelProp="label"
          >
            {applications.map(app => (
              <Select.Option
                key={`${app.applicantAccountId}-${app.timestamp}`}
                value={`${app.applicantAccountId}-${app.timestamp}`}
                label={`${app.applicantAccountId} - ${app.postscript || '无申请消息'}`}
              >
                <div style={{ padding: '8px 0' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>申请人: {app.applicantAccountId}</span>
                    {getStatusTag(app.status)}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    申请消息: {app.postscript || '无'}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '2px' }}>
                    申请时间: {formatTimestamp(app.timestamp)}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '2px' }}>
                    接收人: {app.recipientAccountId}
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ flex: 1 }}
              disabled={applications.length === 0}
            >
              接受好友申请
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
            <strong>功能：</strong>接受他人发送的好友申请
          </li>
          <li>
            <strong>参数：</strong>application (好友申请对象)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，成功时触发好友事件回调
          </li>
          <li>
            <strong>用途：</strong>处理待审核的好友申请，建立好友关系
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
          <li>页面自动获取待处理的好友申请列表</li>
          <li>接受申请后双方将建立好友关系</li>
          <li>成功接受后会触发相应的事件回调</li>
          <li>建议配合好友事件监听获取实时通知</li>
        </ul>
      </Card>
    </div>
  );
};

export default AcceptAddApplicationPage;
