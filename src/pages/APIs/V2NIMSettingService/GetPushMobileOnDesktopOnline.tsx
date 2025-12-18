import { Button, Card, Form, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { Text } = Typography;

// 持久化存储最终执行的参数
const storageKey = `V2NIMSettingService.getPushMobileOnDesktopOnline`;

const GetPushMobileOnDesktopOnlinePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 最后一次查询的结果
  const [lastPushSetting, setLastPushSetting] = useState<boolean | null>(null);

  // 页面加载时的初始化
  useEffect(() => {
    // 可以在这里进行一些初始化操作
  }, []);

  // 表单提交: 触发 API 调用
  const handleGetPushMobileOnDesktopOnline = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setLoading(true);
    setLastPushSetting(null);

    // 打印 API 入参
    console.log('API V2NIMSettingService.getPushMobileOnDesktopOnline execute, no params');

    // 执行 API
    const [error, pushSetting] = await to(() =>
      window.nim?.V2NIMSettingService.getPushMobileOnDesktopOnline()
    );

    if (error) {
      message.error(`获取桌面端在线时移动端推送设置失败: ${error.toString()}`);
      console.error('获取桌面端在线时移动端推送设置失败:', error.toString());
    } else {
      const settingText = pushSetting ? '需要推送' : '不需要推送';
      message.success(`获取桌面端在线时移动端推送设置成功: ${settingText}`);
      console.log('获取桌面端在线时移动端推送设置成功, 推送设置:', pushSetting, `(${settingText})`);
      setLastPushSetting(pushSetting as boolean);
    }
    // finally
    setLoading(false);
    // 存储执行记录
    localStorage.setItem(storageKey, JSON.stringify({ timestamp: Date.now() }));
  };

  // 重置结果
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置查询结果
    setLastPushSetting(null);
    message.success('查询结果已重置');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const callStatement = `const pushSetting = await window.nim.V2NIMSettingService.getPushMobileOnDesktopOnline();`;

    console.log('V2NIMSettingService.getPushMobileOnDesktopOnline 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化推送设置显示
  const formatPushSetting = (pushSetting: boolean) => {
    return pushSetting ? (
      <Text type="success">📱 桌面端在线时，移动端需要推送</Text>
    ) : (
      <Text type="warning">🚫 桌面端在线时，移动端不需要推送</Text>
    );
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetPushMobileOnDesktopOnline}
        style={{ marginTop: 24 }}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMSettingService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        {lastPushSetting !== null && (
          <Form.Item label="查询结果">
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {formatPushSetting(lastPushSetting)}
            </div>
          </Form.Item>
        )}

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              查询推送设置
            </Button>
            <Button type="default" onClick={handleReset}>
              重置结果
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
            <strong>功能：</strong>获取桌面端在线时移动端是否需要推送的配置
          </li>
          <li>
            <strong>参数：</strong>无参数
          </li>
          <li>
            <strong>返回值：</strong>boolean (true=需要推送，false=不需要推送)
          </li>
          <li>
            <strong>用途：</strong>查询多设备推送策略，用于界面显示或逻辑判断
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
          <li>数据来自本地缓存，需要确保登录后数据已同步</li>
          <li>主要在移动端调用，用于查询移动端推送策略</li>
          <li>与免打扰设置共同作用影响推送行为</li>
          <li>可通过 setPushMobileOnDesktopOnline 修改设置</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetPushMobileOnDesktopOnlinePage;
