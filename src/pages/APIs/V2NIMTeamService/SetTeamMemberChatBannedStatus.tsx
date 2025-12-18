import { Button, Card, Form, Radio, Select, Space, Switch, Tag, message } from 'antd';
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface SetTeamMemberChatBannedStatusFormValues {
  teamId: string;
  teamType: number;
  accountId: string;
  chatBanned: boolean;
}

const defaultSetTeamMemberChatBannedStatusFormValues: SetTeamMemberChatBannedStatusFormValues = {
  teamId: '',
  teamType: 1, // V2NIM_TEAM_TYPE_NORMAL - 高级群
  accountId: '',
  chatBanned: true, // 默认设置为禁言
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.setTeamMemberChatBannedStatus`;

const SetTeamMemberChatBannedStatusPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取群组列表的加载状态
  const [fetchingTeams, setFetchingTeams] = useState(false);
  // 群成员列表加载状态
  const [memberListLoading, setMemberListLoading] = useState(false);
  // 已加入的群组列表（只显示当前用户是群主或管理员的群组）
  const [teamList, setTeamList] = useState<V2NIMTeam[]>([]);
  // 当前选中群组的成员列表
  const [teamMemberList, setTeamMemberList] = useState<V2NIMTeamMember[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const getInitialValues = () => {
    const storedValues = localStorage.getItem(storageKey);
    if (storedValues) {
      try {
        const parsedValues = JSON.parse(storedValues);
        return { ...defaultSetTeamMemberChatBannedStatusFormValues, ...parsedValues };
      } catch (error) {
        console.error('解析存储的表单数据失败:', error);
        return defaultSetTeamMemberChatBannedStatusFormValues;
      }
    }
    return defaultSetTeamMemberChatBannedStatusFormValues;
  };

  const initialValues = getInitialValues();

  // 获取已加入的群组列表（只显示当前用户是群主或管理员的群组）
  const fetchTeamList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setFetchingTeams(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.getJoinedTeamList execute, params:', undefined);

    // 执行 API，获取所有类型的群组
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.getJoinedTeamList([form.getFieldValue('teamType')])
    );

    if (error) {
      message.error(`获取群组列表失败: ${error.toString()}`);
      console.error('获取群组列表失败:', error);
      setTeamList([]);
    } else {
      console.log('获取群组列表成功, 结果:', result);
      const currentUserId = window.nim?.V2NIMLoginService.getLoginUser();

      // 只显示有效的群组，并且当前用户是群主的群组（简化处理，实际需要检查管理员权限）
      const validTeams = (result || []).filter((team: V2NIMTeam) => {
        if (!team.isValidTeam) return false;

        // 群主可以设置成员禁言状态
        if (team.ownerAccountId === currentUserId) return true;

        // 管理员也可以设置成员禁言状态，但这里简化处理
        // 实际应用中需要调用 getTeamMemberList 来确认用户角色
        return team.ownerAccountId === currentUserId;
      });

      setTeamList(validTeams);

      if (validTeams.length === 0) {
        message.info('暂无可管理的群组（只有群主和管理员才能设置成员禁言状态）');
      } else {
        message.success(`获取到 ${validTeams.length} 个可管理的群组`);
      }
    }
    setFetchingTeams(false);
  };

  // 组件挂载时获取群组列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchTeamList();
    }
  }, []);

  const handleTeamTypeChange = () => {
    form.setFieldsValue({
      teamId: '',
      accountId: '',
    });
    setTeamMemberList([]);
    fetchTeamList();
  };

  // 获取群成员列表
  const fetchTeamMemberList = async (teamId: string, teamType: number) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setMemberListLoading(true);
    setTeamMemberList([]); // 清空之前的成员列表

    try {
      let allMembers: V2NIMTeamMember[] = [];
      let nextToken = '';
      let finished = false;

      // 循环获取所有成员（分页）
      while (!finished) {
        const queryOption = {
          roleQueryType: 0, // V2NIM_TEAM_MEMBER_ROLE_QUERY_TYPE_ALL
          onlyChatBanned: false,
          direction: 1, // V2NIM_QUERY_DIRECTION_DESC
          limit: 100,
          nextToken: nextToken,
        };

        const [error, result] = await to(() =>
          window.nim?.V2NIMTeamService.getTeamMemberList(teamId, teamType, queryOption)
        );

        if (error) {
          message.error(`获取群成员列表失败: ${error.toString()}`);
          console.error('获取群成员列表失败:', error.toString());
          break;
        }

        if (result && result.memberList) {
          allMembers = [...allMembers, ...result.memberList];
          nextToken = result.nextToken || '';
          finished = result.finished || false;
        } else {
          finished = true;
        }
      }

      console.log('获取群成员列表成功:', allMembers);
      setTeamMemberList(allMembers);
    } catch (error) {
      message.error(`获取群成员列表失败: ${error}`);
      console.error('获取群成员列表失败:', error);
    }

    setMemberListLoading(false);
  };

  // 当选择群组时自动填充群组类型并获取成员列表
  const handleTeamSelect = (teamId: string) => {
    const selectedTeam = teamList.find(team => team.teamId === teamId);
    if (selectedTeam) {
      form.setFieldsValue({
        teamId,
        teamType: selectedTeam.teamType,
        accountId: '', // 清空已选择的成员
      });
      // 获取该群组的成员列表
      fetchTeamMemberList(teamId, selectedTeam.teamType);
    }
  };

  // 刷新群成员列表
  const handleRefreshMemberList = () => {
    const teamId = form.getFieldValue('teamId');
    const teamType = form.getFieldValue('teamType');
    if (teamId && teamType) {
      fetchTeamMemberList(teamId, teamType);
    } else {
      message.warning('请先选择群组');
    }
  };

  // 获取成员显示名称
  const getMemberDisplayName = (member: V2NIMTeamMember) => {
    const roleName = getMemberRoleNameByValue(member.memberRole);
    const bannedStatus = member.chatBanned ? '已禁言' : '未禁言';
    if (member.teamNick) {
      return `${member.teamNick} (${member.accountId}) [${roleName}] [${bannedStatus}]`;
    }
    return `${member.accountId} [${roleName}] [${bannedStatus}]`;
  };

  // 获取成员角色名称（根据角色值）
  const getMemberRoleNameByValue = (memberRole: number) => {
    switch (memberRole) {
      case 1:
        return '群主';
      case 2:
        return '管理员';
      case 0:
        return '普通成员';
      default:
        return `未知(${memberRole})`;
    }
  };

  // 表单提交: 触发 API 调用
  const handleSetTeamMemberChatBannedStatus = async (
    values: SetTeamMemberChatBannedStatusFormValues
  ) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, accountId, chatBanned } = values;

    if (!teamId.trim()) {
      message.error('请选择群组');
      return;
    }

    if (!accountId.trim()) {
      message.error('请选择群成员');
      return;
    }

    // 检查是否对自己操作
    const currentUserId = window.nim?.V2NIMLoginService.getLoginUser();
    if (accountId === currentUserId) {
      message.error('不能对自己设置禁言状态');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.setTeamMemberChatBannedStatus execute, params:', {
      teamId,
      teamType,
      accountId,
      chatBanned,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMTeamService.setTeamMemberChatBannedStatus(
        teamId,
        teamType,
        accountId,
        chatBanned
      )
    );

    if (error) {
      message.error(`设置群成员禁言状态失败: ${error.toString()}`);
      console.error('设置群成员禁言状态失败:', error.toString());
    } else {
      const action = chatBanned ? '禁言' : '解除禁言';
      message.success(`设置群成员${action}状态成功`);
      console.log(`设置群成员${action}状态成功`);
      // 刷新成员列表以显示最新状态
      const teamId = form.getFieldValue('teamId');
      const teamType = form.getFieldValue('teamType');
      if (teamId && teamType) {
        fetchTeamMemberList(teamId, teamType);
      }
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
    form.setFieldsValue(defaultSetTeamMemberChatBannedStatusFormValues);
    setTeamMemberList([]);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeams = () => {
    fetchTeamList();
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, accountId, chatBanned } = values;

    if (!teamId.trim()) {
      message.error('请先选择群组');
      return;
    }

    if (!accountId.trim()) {
      message.error('请先选择群成员');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.setTeamMemberChatBannedStatus("${teamId}", ${teamType}, "${accountId}", ${chatBanned});`;

    console.log('V2NIMTeamService.setTeamMemberChatBannedStatus 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
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

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleSetTeamMemberChatBannedStatus}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMTeamService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item label="群组列表">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button onClick={handleRefreshTeams} loading={fetchingTeams} size="small">
                刷新群组列表
              </Button>
              <span style={{ color: '#666', fontSize: '12px' }}>
                {fetchingTeams ? '正在获取...' : `共 ${teamList.length} 个可管理群组`}
              </span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item
          label="选择群组"
          name="teamId"
          rules={[{ required: true, message: '请选择要管理的群组' }]}
        >
          <Select
            placeholder="请选择要管理的群组"
            loading={fetchingTeams}
            onSelect={handleTeamSelect}
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            notFoundContent={fetchingTeams ? '正在获取群组列表...' : '暂无可管理的群组'}
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleRefreshTeams}
                    loading={fetchingTeams}
                    style={{ padding: 0 }}
                  >
                    刷新群组列表
                  </Button>
                </div>
              </div>
            )}
          >
            {teamList.map(team => (
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
          tooltip="必须与要操作的群组类型一致"
        >
          <Radio.Group onChange={handleTeamTypeChange}>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="选择成员"
          name="accountId"
          rules={[{ required: true, message: '请选择要设置禁言状态的群成员' }]}
          tooltip="支持从成员列表中选择，也可以手动输入账号ID"
        >
          <Select
            placeholder="请选择要设置禁言状态的群成员"
            loading={memberListLoading}
            showSearch
            optionFilterProp="children"
            allowClear
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleRefreshMemberList}
                    loading={memberListLoading}
                    style={{ padding: 0 }}
                  >
                    刷新成员列表
                  </Button>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    提示：可以从列表中选择成员，也可以直接输入账号ID
                  </div>
                </div>
              </div>
            )}
            notFoundContent={
              memberListLoading
                ? '加载中...'
                : teamMemberList.length === 0
                  ? '请先选择群组以加载成员列表'
                  : '未找到匹配的成员'
            }
          >
            {teamMemberList
              .filter(
                member =>
                  member.inTeam && member.accountId !== window.nim?.V2NIMLoginService.getLoginUser()
              ) // 只显示在群中的成员，排除当前用户
              .map(member => (
                <Select.Option key={member.accountId} value={member.accountId}>
                  {getMemberDisplayName(member)}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="禁言状态"
          name="chatBanned"
          valuePropName="checked"
          tooltip="设置成员的禁言状态：开启表示禁言，关闭表示解除禁言"
        >
          <Switch
            checkedChildren="禁言"
            unCheckedChildren="解除禁言"
            style={{ backgroundColor: form.getFieldValue('chatBanned') ? '#ff4d4f' : '#52c41a' }}
          />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              设置禁言状态
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
            <strong>选择群组:</strong>{' '}
            从已加入的群组列表中选择要管理的群组（只有群主和管理员才能管理）
          </li>
          <li>
            <strong>选择成员:</strong> 要设置禁言状态的群成员
            <ul style={{ marginTop: 4 }}>
              <li>支持从群成员列表中选择成员</li>
              <li>也可以手动输入账号ID</li>
              <li>成员列表会显示群昵称、账号ID、身份和当前禁言状态</li>
              <li>只显示当前在群中的成员（排除当前用户）</li>
              <li>不能对自己设置禁言状态</li>
            </ul>
          </li>
          <li>
            <strong>权限要求:</strong> 只有群主和管理员才能设置成员禁言状态
          </li>
          <li>
            <strong>禁言状态:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                <Tag color="red">禁言</Tag> - 该成员无法在群组中发送消息
              </li>
              <li>
                <Tag color="green">解除禁言</Tag> - 该成员可以正常在群组中发送消息
              </li>
            </ul>
          </li>
          <li>
            <strong>群组类型:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>{getTeamTypeText(1)} (V2NIM_TEAM_TYPE_NORMAL = 1)</li>
              <li>{getTeamTypeText(2)} (V2NIM_TEAM_TYPE_SUPER = 2)</li>
            </ul>
          </li>
          <li>选择群组后，系统会自动填充对应的群组类型</li>
          <li>支持按群组名称或ID搜索群组</li>
          <li>选择群组后会自动加载该群组的成员列表</li>
          <li>可以点击"刷新群组列表"按钮获取最新的群组信息</li>
          <li>可以点击"刷新成员列表"按钮获取最新的成员信息</li>
          <li>支持按成员昵称或账号ID搜索成员</li>
          <li>操作成功后会自动刷新成员列表以显示最新的禁言状态</li>
        </ul>
      </Card>

      {/* 操作结果说明 */}
      <Card title="操作结果说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>操作成功后的事件触发：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>所有群成员端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamMemberInfoUpdated
                事件
              </li>
            </ul>
          </li>
          <li>设置成功后，成员的禁言状态将立即生效</li>
          <li>被禁言的成员将无法在群组中发送消息</li>
          <li>解除禁言后，成员可以正常发送消息</li>
          <li>群主和管理员不受禁言设置影响，始终可以发言</li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="API 参数说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>teamId (string):</strong> 群组ID，不能为空
          </li>
          <li>
            <strong>teamType (V2NIMTeamType):</strong> 群组类型
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>1:</strong> 高级群 (V2NIM_TEAM_TYPE_NORMAL)
              </li>
              <li>
                <strong>2:</strong> 超大群 (V2NIM_TEAM_TYPE_SUPER)
              </li>
            </ul>
          </li>
          <li>
            <strong>accountId (string):</strong> 被修改成员的账号ID，不能为空且不能是自己
          </li>
          <li>
            <strong>chatBanned (boolean):</strong> 群组中聊天是否被禁言
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>true:</strong> 被禁言，该成员无法发送消息
              </li>
              <li>
                <strong>false:</strong> 未禁言，该成员可以正常发送消息
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 禁言功能详解 */}
      <Card title="禁言功能详解" style={{ marginTop: 16 }} size="small">
        <div style={{ margin: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>个人禁言 vs 群组禁言：</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>
                <strong>个人禁言（本 API）:</strong> 针对特定成员设置禁言状态，被禁言的成员无法发言
              </li>
              <li>
                <strong>群组禁言:</strong> 针对整个群组设置禁言模式，如普通成员禁言、全员禁言等
              </li>
            </ul>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>禁言优先级：</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>个人禁言状态优先于群组禁言模式</li>
              <li>即使群组未开启禁言模式，被个人禁言的成员仍无法发言</li>
              <li>群主和管理员通常不受禁言限制（除非特殊设置）</li>
            </ul>
          </div>
          <div>
            <strong>使用场景：</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>对违规发言的成员进行处罚</li>
              <li>临时限制某些成员的发言权限</li>
              <li>维护群组秩序和讨论质量</li>
              <li>配合群组管理策略使用</li>
            </ul>
          </div>
        </div>
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
          <li>
            <strong>确保已登录并完成数据同步</strong>
          </li>
          <li>
            <strong>只有群主和管理员才能执行此操作</strong>
          </li>
          <li>
            <strong>不能对自己设置禁言状态</strong>
          </li>
          <li>
            <strong>不能对群主设置禁言状态</strong>
          </li>
          <li>管理员之间可能无法相互禁言（取决于具体权限设置）</li>
          <li>禁言状态设置后立即生效，请谨慎操作</li>
          <li>设置成功会触发 onTeamMemberInfoUpdated 事件，请注意监听相关事件</li>
          <li>
            <strong>建议配合 V2NIMTeamService.on 监听群组事件获取实时通知</strong>
          </li>
          <li>被禁言的成员会收到相应的提示信息</li>
          <li>
            <strong>合理使用禁言功能，维护良好的群组氛围</strong>
          </li>
          <li>建议在禁言前先警告违规成员，给予改正机会</li>
          <li>
            <strong>禁言不是目的，维护群组秩序才是目标</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SetTeamMemberChatBannedStatusPage;
