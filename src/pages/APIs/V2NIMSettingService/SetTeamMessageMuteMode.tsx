import { Button, Card, Form, Radio, Select, Space, message } from 'antd';
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface SetTeamMessageMuteModeFormValues {
  teamId: string;
  teamType: number;
  muteMode: number;
}

const defaultFormValues: SetTeamMessageMuteModeFormValues = {
  teamId: '',
  teamType: 1, // 默认高级群
  muteMode: 0, // 默认关闭免打扰
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMSettingService.setTeamMessageMuteMode`;

const SetTeamMessageMuteModePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 群组列表加载状态
  const [teamListLoading, setTeamListLoading] = useState(false);
  // 已加入的群组列表
  const [joinedTeamList, setJoinedTeamList] = useState<V2NIMTeam[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): SetTeamMessageMuteModeFormValues => {
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

  // 获取已加入的群组列表
  const fetchJoinedTeamList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setTeamListLoading(true);

    // 获取所有类型的群组
    const [error, result] = await to(() => window.nim?.V2NIMTeamService.getJoinedTeamList());

    if (error) {
      message.error(`获取群组列表失败: ${error.toString()}`);
      console.error('获取群组列表失败:', error.toString());
      setJoinedTeamList([]);
    } else {
      console.log('获取群组列表成功:', result);
      // 过滤出有效的群组
      const validTeams = (result || []).filter((team: V2NIMTeam) => team.isValidTeam);
      setJoinedTeamList(validTeams);
    }
    setTeamListLoading(false);
  };

  // 组件加载时获取群组列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchJoinedTeamList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleSetTeamMessageMuteMode = async (values: SetTeamMessageMuteModeFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, muteMode } = values;
    if (!teamId) {
      message.error('请选择要设置免打扰模式的群组');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMSettingService.setTeamMessageMuteMode execute, params:', {
      teamId,
      teamType,
      muteMode,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMSettingService.setTeamMessageMuteMode(teamId, teamType, muteMode)
    );

    if (error) {
      message.error(`设置群消息免打扰模式失败: ${error.toString()}`);
      console.error('设置群消息免打扰模式失败:', error.toString());
    } else {
      const modeText = getMuteModeText(muteMode);
      message.success(`设置群消息免打扰模式成功: ${modeText}`);
      console.log('设置群消息免打扰模式成功, 模式:', muteMode, `(${modeText})`);
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

  // 刷新群组列表
  const handleRefreshTeamList = () => {
    fetchJoinedTeamList();
  };

  // 当选择群组时自动填充群组类型
  const handleTeamSelect = (teamId: string) => {
    const selectedTeam = joinedTeamList.find(team => team.teamId === teamId);
    if (selectedTeam) {
      form.setFieldsValue({
        teamId,
        teamType: selectedTeam.teamType,
      });
    }
  };

  // 获取群组类型显示文本
  const getTeamTypeText = (teamType: number) => {
    switch (teamType) {
      case 1:
        return '高级群';
      case 2:
        return '超大群';
      default:
        return `未知(${teamType})`;
    }
  };

  // 获取免打扰模式显示文本
  const getMuteModeText = (muteMode: number) => {
    switch (muteMode) {
      case 0:
        return '群消息免打扰关闭';
      case 1:
        return '群消息免打扰开启';
      case 2:
        return '普通成员群消息免打扰开启';
      default:
        return `未知模式(${muteMode})`;
    }
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, muteMode } = values;

    if (!teamId) {
      message.error('请先选择要设置免打扰模式的群组');
      return;
    }

    const callStatement = `await window.nim.V2NIMSettingService.setTeamMessageMuteMode(${JSON.stringify(teamId)}, ${teamType}, ${muteMode});`;

    console.log('V2NIMSettingService.setTeamMessageMuteMode 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 免打扰模式选项
  const muteModeOptions = [
    {
      label: '群消息免打扰关闭 (V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF)',
      value: 0,
      description: '所有群消息均推送或提醒（默认）',
    },
    {
      label: '群消息免打扰开启 (V2NIM_TEAM_MESSAGE_MUTE_MODE_ON)',
      value: 1,
      description: '所有群消息均不推送或不提醒',
    },
    {
      label: '普通成员群消息免打扰开启 (V2NIM_TEAM_MESSAGE_MUTE_MODE_NORMAL_ON)',
      value: 2,
      description: '仅群主和管理员的消息推送或提醒',
    },
  ];

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleSetTeamMessageMuteMode}
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
          label="选择群组"
          name="teamId"
          rules={[{ required: true, message: '请选择要设置免打扰模式的群组' }]}
        >
          <Select
            placeholder="请选择要设置免打扰模式的群组"
            loading={teamListLoading}
            onSelect={handleTeamSelect}
            showSearch
            optionFilterProp="children"
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleRefreshTeamList}
                    loading={teamListLoading}
                    style={{ padding: 0 }}
                  >
                    刷新群组列表
                  </Button>
                </div>
              </div>
            )}
          >
            {joinedTeamList.map(team => (
              <Select.Option key={team.teamId} value={team.teamId}>
                {team.name || team.teamId} ({getTeamTypeText(team.teamType)}) - {team.teamId}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="群组类型"
          name="teamType"
          rules={[{ required: true, message: '请选择群组类型' }]}
          tooltip="必须与要设置的群组类型一致"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="免打扰模式"
          name="muteMode"
          rules={[{ required: true, message: '请选择免打扰模式' }]}
          tooltip="选择群消息的免打扰模式"
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
              设置群消息免打扰模式
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleRefreshTeamList} loading={teamListLoading}>
              刷新群组列表
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
            <strong>功能：</strong>设置指定群组的消息免打扰模式
          </li>
          <li>
            <strong>参数：</strong>teamId (群组ID), teamType (群组类型), muteMode (免打扰模式)
          </li>
          <li>
            <strong>返回值：</strong>无返回值，成功时触发设置事件回调
          </li>
          <li>
            <strong>用途：</strong>控制群组消息的推送和提醒行为，支持多种免打扰策略
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
          <li>免打扰设置是个人属性，不会影响群组的其他成员</li>
          <li>免打扰只影响推送和提醒，不影响消息接收和存储</li>
          <li>设置为免打扰后，开发者需要隐去未读数的渲染</li>
          <li>特别关注功能（addTeamMembersFollow）可覆盖免打扰设置</li>
        </ul>
      </Card>
    </div>
  );
};

export default SetTeamMessageMuteModePage;
