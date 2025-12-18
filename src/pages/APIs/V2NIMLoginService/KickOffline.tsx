import { Button, Form, Select, Space, message } from 'antd';
import { V2NIMLoginClient } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLoginService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Option } = Select;

interface KickOfflineFormValues {
  clientId: string;
}

const defaultKickOfflineFormValues: KickOfflineFormValues = {
  clientId: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMLoginService.kickOffline`;

const KickOfflinePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 登录客户端列表
  const [loginClients, setLoginClients] = useState<V2NIMLoginClient[]>([]);
  // 获取客户端列表的加载状态
  const [clientsLoading, setClientsLoading] = useState(false);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值.
  const initialValues = defaultKickOfflineFormValues;

  // 获取登录客户端列表
  const getLoginClients = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setClientsLoading(true);
    try {
      console.log('API V2NIMLoginService.getLoginClients execute');
      const clients = window.nim.V2NIMLoginService.getLoginClients();
      console.log('获取到的登录客户端列表:', clients);
      setLoginClients(clients || []);

      if (!clients || clients.length === 0) {
        message.info('当前没有其他登录端');
      } else {
        message.success(`获取到 ${clients.length} 个登录端`);
      }
    } catch (error) {
      message.error(`获取登录客户端列表失败: ${error}`);
      setLoginClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  // 页面加载时自动获取客户端列表
  useEffect(() => {
    // 防止重复加载
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      getLoginClients();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleKickOffline = async (values: KickOfflineFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { clientId } = values;
    if (!clientId) {
      message.error('请选择要踢下线的客户端');
      return;
    }

    // 查找选中的客户端对象
    const targetClient = loginClients.find(client => client.clientId === clientId);
    if (!targetClient) {
      message.error('未找到指定的客户端');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMLoginService.kickOffline execute, params:', targetClient);

    // 执行 API
    const [error] = await to(() => window.nim?.V2NIMLoginService.kickOffline(targetClient));
    if (error) {
      message.error(`KickOffline 失败: ${error.toString()}`);
    } else {
      message.success('KickOffline 成功');
      // 踢下线成功后，重新获取客户端列表
      getLoginClients();
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
    form.setFieldsValue(defaultKickOfflineFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { clientId } = values;

    if (!clientId) {
      message.error('请先选择要踢下线的客户端');
      return;
    }

    const targetClient = loginClients.find(client => client.clientId === clientId);
    if (!targetClient) {
      message.error('未找到指定的客户端');
      return;
    }

    const callStatement = `await window.nim.V2NIMLoginService.kickOffline(${JSON.stringify(targetClient, null, 2)});`;

    console.log('V2NIMLoginService.kickOffline 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化客户端显示信息
  const formatClientLabel = (client: V2NIMLoginClient) => {
    // 根据枚举 V2NIMLoginClientType 倒推回来的 map.
    const typeMap: { [key: number]: string } = {
      0: '未知',
      1: 'Android',
      2: 'iOS',
      4: 'PC',
      16: 'Web',
      32: 'REST API',
      64: 'Mac OS',
      65: 'HarmonyOS',
    };

    const clientType = typeMap[client.type] || '未知';
    const time = new Date(client.timestamp).toLocaleString();

    return `${clientType} (${client.os}) - ${time} - ID: ${client.clientId}`;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleKickOffline}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLoginService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>
        <Form.Item
          label="选择客户端"
          name="clientId"
          tooltip="可以把本账号的其他客户端踢下线"
          rules={[{ required: true, message: '请选择要踢下线的客户端' }]}
        >
          <Select
            placeholder="请选择要踢下线的客户端"
            loading={clientsLoading}
            notFoundContent={clientsLoading ? '获取中...' : '暂无可踢下线的客户端'}
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: 8, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    onClick={getLoginClients}
                    loading={clientsLoading}
                    style={{ padding: 0 }}
                  >
                    刷新客户端列表
                  </Button>
                </div>
              </div>
            )}
          >
            {loginClients.map(client => (
              <Option key={client.clientId} value={client.clientId}>
                {formatClientLabel(client)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              踢下线
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
    </div>
  );
};

export default KickOfflinePage;
