import { Button, Card, Form, Radio, Space, message } from 'antd';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface SetPushMobileOnDesktopOnlineFormValues {
  need: boolean;
}

const defaultFormValues: SetPushMobileOnDesktopOnlineFormValues = {
  need: false, // 默认不推送
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMSettingService.setPushMobileOnDesktopOnline`;

const SetPushMobileOnDesktopOnlinePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): SetPushMobileOnDesktopOnlineFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultFormValues;
  };

  const initialValues = getInitialValues();

  // 组件加载时设置初始值
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  // 表单提交: 触发 API 调用
  const handleSetPushMobileOnDesktopOnline = async (
    values: SetPushMobileOnDesktopOnlineFormValues
  ) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { need } = values;

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMSettingService.setPushMobileOnDesktopOnline execute, params:', {
      need,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMSettingService.setPushMobileOnDesktopOnline(need)
    );

    if (error) {
      message.error(`设置桌面端在线时移动端推送失败: ${error.toString()}`);
      console.error('设置桌面端在线时移动端推送失败:', error.toString());
    } else {
      const needText = need ? '需要推送' : '不需要推送';
      message.success(`设置桌面端在线时移动端推送成功: ${needText}`);
      console.log('设置桌面端在线时移动端推送成功, 设置:', need, `(${needText})`);
    }

    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { need } = values;

    const callStatement = `await window.nim.V2NIMSettingService.setPushMobileOnDesktopOnline(${need});`;

    console.log('V2NIMSettingService.setPushMobileOnDesktopOnline 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleSetPushMobileOnDesktopOnline}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
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

        <Form.Item
          label="推送设置"
          name="need"
          rules={[{ required: true, message: '请选择推送设置' }]}
          tooltip="设置当桌面端在线时，移动端是否需要推送"
        >
          <Radio.Group>
            <Radio value={false}>不需要推送</Radio>
            <Radio value={true}>需要推送</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              设置桌面端在线时移动端推送
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
            <strong>功能：</strong>设置桌面端在线时移动端是否需要推送
          </li>
          <li>
            <strong>参数：</strong>need (是否需要推送)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，成功时触发设置事件回调
          </li>
          <li>
            <strong>用途：</strong>控制多设备登录场景下的推送策略，避免重复推送
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
          <li>主要在移动端调用，用于设置移动端推送策略</li>
          <li>设置会持久化保存并多端同步</li>
          <li>与会话级别免打扰、全局免打扰设置共同作用</li>
          <li>默认策略为"不需要推送"，避免重复通知</li>
        </ul>
      </Card>
    </div>
  );
};

export default SetPushMobileOnDesktopOnlinePage;
