import { Button, Card, Form, Select, Space, message } from 'antd';
import { V2NIMFriend } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMFriendService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface SetP2PMessageMuteModeFormValues {
  accountId: string;
  muteMode: number;
}

const defaultFormValues: SetP2PMessageMuteModeFormValues = {
  accountId: '',
  muteMode: 0, // 默认关闭免打扰
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMSettingService.setP2PMessageMuteMode`;

const SetP2PMessageMuteModePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 好友列表加载状态
  const [friendListLoading, setFriendListLoading] = useState(false);
  // 好友列表
  const [friendList, setFriendList] = useState<V2NIMFriend[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): SetP2PMessageMuteModeFormValues => {
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

  // 获取好友列表
  const fetchFriendList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setFriendListLoading(true);

    // 获取好友列表
    const [error, result] = await to(() => window.nim?.V2NIMFriendService.getFriendList());

    if (error) {
      message.error(`获取好友列表失败: ${error.toString()}`);
      console.error('获取好友列表失败:', error.toString());
      setFriendList([]);
    } else {
      console.log('获取好友列表成功:', result);
      setFriendList(result || []);
    }
    setFriendListLoading(false);
  };

  // 组件加载时获取好友列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchFriendList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleSetP2PMessageMuteMode = async (values: SetP2PMessageMuteModeFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountId, muteMode } = values;
    if (!accountId) {
      message.error('请选择要设置免打扰模式的账号');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMSettingService.setP2PMessageMuteMode execute, params:', {
      accountId,
      muteMode,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMSettingService.setP2PMessageMuteMode(accountId, muteMode)
    );

    if (error) {
      message.error(`设置点对点消息免打扰模式失败: ${error.toString()}`);
      console.error('设置点对点消息免打扰模式失败:', error.toString());
    } else {
      const modeText = getMuteModeText(muteMode);
      message.success(`设置点对点消息免打扰模式成功: ${modeText}`);
      console.log('设置点对点消息免打扰模式成功, 模式:', muteMode, `(${modeText})`);
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

  // 刷新好友列表
  const handleRefreshFriendList = () => {
    fetchFriendList();
  };

  // 获取免打扰模式显示文本
  const getMuteModeText = (muteMode: number) => {
    switch (muteMode) {
      case 0:
        return '点对点消息免打扰关闭';
      case 1:
        return '点对点消息免打扰开启';
      default:
        return `未知模式(${muteMode})`;
    }
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { accountId, muteMode } = values;

    if (!accountId) {
      message.error('请先选择要设置免打扰模式的账号');
      return;
    }

    const callStatement = `await window.nim.V2NIMSettingService.setP2PMessageMuteMode(${JSON.stringify(accountId)}, ${muteMode});`;

    console.log('V2NIMSettingService.setP2PMessageMuteMode 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 免打扰模式选项
  const muteModeOptions = [
    {
      label: '点对点消息免打扰关闭 (V2NIM_P2P_MESSAGE_MUTE_MODE_OFF)',
      value: 0,
      description: '所有点对点消息均推送或提醒（默认）',
    },
    {
      label: '点对点消息免打扰开启 (V2NIM_P2P_MESSAGE_MUTE_MODE_ON)',
      value: 1,
      description: '所有点对点消息均不推送或不提醒',
    },
  ];

  // 格式化好友显示信息
  const formatFriendLabel = (friend: V2NIMFriend) => {
    const alias = friend.alias;
    const name = friend.userProfile?.name;
    const accountId = friend.accountId;

    let displayName = accountId;
    if (alias) {
      displayName = `${alias} (${accountId})`;
    } else if (name) {
      displayName = `${name} (${accountId})`;
    }

    return displayName;
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleSetP2PMessageMuteMode}
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
          label="选择账号"
          name="accountId"
          rules={[{ required: true, message: '请选择要设置免打扰模式的账号' }]}
        >
          <Select
            placeholder="请选择要设置免打扰模式的账号"
            loading={friendListLoading}
            showSearch
            optionFilterProp="children"
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleRefreshFriendList}
                    loading={friendListLoading}
                    style={{ padding: 0 }}
                  >
                    刷新好友列表
                  </Button>
                </div>
              </div>
            )}
          >
            {friendList.map(friend => (
              <Select.Option key={friend.accountId} value={friend.accountId}>
                {formatFriendLabel(friend)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="免打扰模式"
          name="muteMode"
          rules={[{ required: true, message: '请选择免打扰模式' }]}
          tooltip="选择点对点消息的免打扰模式"
        >
          <Select placeholder="请选择免打扰模式" optionLabelProp="label">
            {muteModeOptions.map(option => (
              <Select.Option key={option.value} value={option.value} label={option.label}>
                <div>
                  <div>{option.label}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {option.description}
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              设置点对点消息免打扰模式
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleRefreshFriendList} loading={friendListLoading}>
              刷新好友列表
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
            <strong>功能：</strong>设置指定好友的点对点消息免打扰模式
          </li>
          <li>
            <strong>参数：</strong>accountId (账号ID), muteMode (免打扰模式)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，成功时触发设置事件回调
          </li>
          <li>
            <strong>用途：</strong>控制特定好友消息的推送和提醒行为
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
          <li>免打扰只影响推送和提醒，不影响消息接收和存储</li>
          <li>设置是个人属性，不会影响对方的发送和接收</li>
          <li>设置后会立即生效并触发相应的事件回调</li>
          <li>支持多端同步，保持一致的用户体验</li>
        </ul>
      </Card>
    </div>
  );
};

export default SetP2PMessageMuteModePage;
