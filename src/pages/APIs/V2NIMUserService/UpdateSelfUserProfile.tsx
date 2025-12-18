import { Button, Card, Form, Input, InputNumber, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface UpdateSelfUserProfileFormValues {
  name?: string;
  avatar?: string;
  sign?: string;
  email?: string;
  birthday?: string;
  mobile?: string;
  gender?: number;
  serverExtension?: string;
}

const defaultUpdateSelfUserProfileFormValues: UpdateSelfUserProfileFormValues = {
  name: '',
  avatar: '',
  sign: '',
  email: '',
  birthday: '',
  mobile: '',
  gender: undefined,
  serverExtension: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMUserService.updateSelfUserProfile`;

const UpdateSelfUserProfilePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 初始化加载状态
  const [initialLoading, setInitialLoading] = useState(false);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const initialValues = { ...defaultUpdateSelfUserProfileFormValues };

  // 获取当前用户信息并设置到表单
  const loadCurrentUserProfile = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      console.warn('NIM SDK 尚未初始化和登录，无法获取用户信息');
      return;
    }

    const currentUser = window.nim.V2NIMLoginService.getLoginUser();
    if (!currentUser) {
      console.warn('无法获取当前用户账号ID');
      return;
    }

    setInitialLoading(true);
    // 使用当前用户的账号ID获取用户信息
    const [error, userList] = await to(() =>
      window.nim?.V2NIMUserService.getUserList([currentUser])
    );

    if (error) {
      console.error('获取当前用户信息失败:', error.toString());
      message.warning('获取当前用户信息失败，将使用默认值');
      setInitialLoading(false);
      return;
    }

    if (userList && userList.length > 0) {
      const userProfile = userList[0];
      const formValues = {
        name: userProfile.name || '',
        avatar: userProfile.avatar || '',
        sign: userProfile.sign || '',
        email: userProfile.email || '',
        birthday: userProfile.birthday || '',
        mobile: userProfile.mobile || '',
        gender: userProfile.gender !== undefined ? userProfile.gender : undefined,
        serverExtension: userProfile.serverExtension || '',
      };

      // 设置表单值
      form.setFieldsValue(formValues);
      console.log('已加载当前用户信息:', formValues);
    }
    setInitialLoading(false);
  };

  // 组件加载时获取当前用户信息
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      loadCurrentUserProfile();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleUpdateSelfUserProfile = async (values: UpdateSelfUserProfileFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 过滤掉空值的字段
    const filteredValues: Record<string, any> = {};
    Object.keys(values).forEach(key => {
      const value = values[key as keyof UpdateSelfUserProfileFormValues];
      if (value !== undefined && value !== '') {
        filteredValues[key] = value;
      }
    });

    // 如果没有任何字段需要更新
    if (Object.keys(filteredValues).length === 0) {
      message.warning('请至少填写一个需要更新的字段');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMUserService.updateSelfUserProfile execute, params:', filteredValues);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMUserService.updateSelfUserProfile(filteredValues)
    );
    if (error) {
      message.error(`更新用户资料失败: ${error.toString()}`);
      console.error('更新用户资料失败:', error.toString());
    } else {
      message.success('更新用户资料成功');
      console.log('更新用户资料成功, 结果:', result);
    }
    // finally
    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(filteredValues));
  };

  // 重置表单到当前用户信息
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重新加载当前用户信息
    loadCurrentUserProfile();
    message.success('表单已重置为当前用户信息');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();

    // 过滤掉空值的字段
    const filteredValues: Record<string, any> = {};
    Object.keys(values).forEach(key => {
      const value = values[key as keyof UpdateSelfUserProfileFormValues];
      if (value !== undefined && value !== '') {
        filteredValues[key] = value;
      }
    });

    if (Object.keys(filteredValues).length === 0) {
      message.error('请先填写需要更新的字段');
      return;
    }

    const callStatement = `await window.nim.V2NIMUserService.updateSelfUserProfile(${JSON.stringify(filteredValues, null, 2)});`;

    console.log('V2NIMUserService.updateSelfUserProfile 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 填充示例数据
  const handleFillExample = () => {
    const exampleData = {
      name: '示例昵称',
      avatar: 'https://example.com/avatar.jpg',
      sign: '这是我的个性签名',
      email: 'example@example.com',
      birthday: '1990-01-01',
      mobile: '+86-13800138000',
      gender: 1,
      serverExtension: '{"customField": "customValue"}',
    };
    form.setFieldsValue(exampleData);
    message.success('已填充示例数据');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleUpdateSelfUserProfile}
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

        <Form.Item label="用户昵称" name="name" tooltip="用户昵称，为空表示不修改该字段">
          <Input placeholder="请输入用户昵称" />
        </Form.Item>

        <Form.Item label="用户头像" name="avatar" tooltip="用户头像图片地址，长度限制：1024字节">
          <Input placeholder="请输入头像图片地址" />
        </Form.Item>

        <Form.Item label="用户签名" name="sign" tooltip="用户签名，长度限制：256字符">
          <Input.TextArea placeholder="请输入用户签名" rows={3} maxLength={256} showCount />
        </Form.Item>

        <Form.Item label="用户邮箱" name="email" tooltip="用户邮箱，长度限制：64字符">
          <Input placeholder="请输入用户邮箱" type="email" maxLength={64} />
        </Form.Item>

        <Form.Item
          label="用户生日"
          name="birthday"
          tooltip="用户生日，格式如：1990-01-01，长度限制：16字符"
        >
          <Input placeholder="请输入生日，如：1990-01-01" maxLength={16} />
        </Form.Item>

        <Form.Item
          label="用户手机号"
          name="mobile"
          tooltip="用户手机号，长度限制：32字符，非中国大陆手机号码需要填写国家代码"
        >
          <Input placeholder="请输入手机号，如：+86-13800138000" maxLength={32} />
        </Form.Item>

        <Form.Item
          label="用户性别"
          name="gender"
          tooltip="用户性别, 自由映射数值, 推荐：0-保密，1-男性，2-女性"
        >
          <InputNumber placeholder="请输入性别代码" min={0} max={2} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="扩展字段"
          name="serverExtension"
          tooltip="用户扩展字段，建议使用JSON格式，长度限制：1024字符"
        >
          <Input.TextArea
            placeholder="请输入扩展字段，建议使用JSON格式"
            rows={3}
            maxLength={1024}
            showCount
          />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              更新用户资料
            </Button>
            <Button type="default" onClick={handleReset} loading={initialLoading}>
              重置
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
            <Button type="default" onClick={handleFillExample}>
              填充示例
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>更新当前登录用户的个人资料信息
          </li>
          <li>
            <strong>参数：</strong>用户资料对象 (包含昵称、头像、签名等字段)
          </li>
          <li>
            <strong>返回值：</strong>V2NIMUser (更新后的用户信息)
          </li>
          <li>
            <strong>用途：</strong>修改个人资料，支持部分字段更新
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
          <li>调用后会触发 onUserProfileChanged 事件</li>
          <li>表单会自动加载当前用户的资料信息作为初始值</li>
          <li>为空的字段表示不修改，只有填写了内容的字段才会被更新</li>
          <li>性别字段：0-保密，1-男性，2-女性</li>
        </ul>
      </Card>
    </div>
  );
};

export default UpdateSelfUserProfilePage;
