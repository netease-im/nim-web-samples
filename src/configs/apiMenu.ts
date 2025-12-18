import { ComponentType } from 'react';

// 扩展菜单项类型
export interface MenuItemWithRender {
  label: string;
  key: string;
  children?: MenuItemWithRender[];
  renderFn?: () => Promise<{ default: ComponentType<unknown> }>;
}

// API 示例页面的菜单配置
export const apiMenuItems: MenuItemWithRender[] = [
  {
    label: '初始化',
    key: 'NIMInit',
  },
  {
    label: '登录服务',
    key: 'V2NIMLoginService',
    children: [
      {
        label: '登录与登出',
        key: 'V2NIMLoginService-login',
      },
      { label: '获取当前登录用户', key: 'V2NIMLoginService-getLoginUser' },
      { label: '获取登录状态', key: 'V2NIMLoginService-getLoginStatus' },
      { label: '获取多端登录信息', key: 'V2NIMLoginService-getLoginClients' },
      { label: '踢人', key: 'V2NIMLoginService-kickOffline' },
      { label: '设置监听事件', key: 'V2NIMLoginService-on' },
    ],
  },
  {
    label: '本地会话服务',
    key: 'V2NIMLocalConversationService',
    children: [
      {
        label: '获取会话列表',
        key: 'V2NIMLocalConversationService-getConversationList',
      },
      { label: '创建本地会话', key: 'V2NIMLocalConversationService-createConversation' },
      { label: '删除本地会话', key: 'V2NIMLocalConversationService-deleteConversation' },
      { label: '置顶会话', key: 'V2NIMLocalConversationService-stickTopConversation' },
      { label: '获取总未读数', key: 'V2NIMLocalConversationService-getTotalUnreadCount' },
      { label: '标记会话已读', key: 'V2NIMLocalConversationService-markConversationRead' },
      { label: '设置会话监听事件', key: 'V2NIMLocalConversationService-on' },
    ],
  },
  {
    label: '云端会话服务',
    key: 'V2NIMConversationService',
    children: [
      {
        label: '获取会话列表',
        key: 'V2NIMConversationService-getConversationList',
      },
      { label: '创建云端会话', key: 'V2NIMConversationService-createConversation' },
      { label: '删除云端会话', key: 'V2NIMConversationService-deleteConversation' },
      { label: '置顶云端会话', key: 'V2NIMConversationService-stickTopConversation' },
      { label: '获取总未读数', key: 'V2NIMConversationService-getTotalUnreadCount' },
      { label: '标记会话已读', key: 'V2NIMConversationService-markConversationRead' },
      { label: '设置会话监听事件', key: 'V2NIMConversationService-on' },
    ],
  },
  {
    label: '云端会话分组服务',
    key: 'V2NIMConversationGroupService',
    children: [
      { label: '创建会话分组', key: 'V2NIMConversationGroupService-createConversationGroup' },
      { label: '删除会话分组', key: 'V2NIMConversationGroupService-deleteConversationGroup' },
      { label: '更新会话分组', key: 'V2NIMConversationGroupService-updateConversationGroup' },
      {
        label: '添加会话到相应分组下面',
        key: 'V2NIMConversationGroupService-addConversationsToGroup',
      },
      {
        label: '从会话分组删除相应会话',
        key: 'V2NIMConversationGroupService-removeConversationsFromGroup',
      },
      { label: '获取会话分组列表', key: 'V2NIMConversationGroupService-getConversationGroupList' },
      { label: '设置会话监听事件', key: 'V2NIMConversationGroupService-on' },
    ],
  },
  {
    label: '消息服务',
    key: 'V2NIMMessageService',
    children: [
      { label: '发送消息', key: 'V2NIMMessageService-sendMessage' },
      { label: '查询消息列表', key: 'V2NIMMessageService-getMessageListEx' },
      { label: '撤回消息', key: 'V2NIMMessageService-revokeMessage' },
      { label: '单向删除消息-批量', key: 'V2NIMMessageService-deleteMessages' },
      { label: '清空某会话的历史消息', key: 'V2NIMMessageService-clearHistoryMessage' },
      { label: '设置消息监听事件', key: 'V2NIMMessageService-on' },
    ],
  },
  {
    label: '存储服务',
    key: 'V2NIMStorageService',
    children: [
      { label: '添加存储场景', key: 'V2NIMStorageService-addCustomStorageScene' },
      { label: '上传文件', key: 'V2NIMStorageService-uploadFile' },
      { label: '上传文件并返回媒体信息', key: 'V2NIMStorageService-uploadFileWithMetaInfo' },
      { label: '短链接转长链接', key: 'V2NIMStorageService-shortUrlToLong' },
      { label: '生成缩略图链接', key: 'V2NIMStorageService-getImageThumbUrl' },
      { label: '生成视频封面图链接', key: 'V2NIMStorageService-getVideoCoverUrl' },
    ],
  },
  // {
  //   label: '客户端反垃圾',
  //   key: 'V2NIMClientAntispamUtil',
  //   children: [{ label: '文本反垃圾', key: 'V2NIMClientAntispamUtil-antispamText' }],
  // },
  {
    label: '用户服务',
    key: 'V2NIMUserService',
    children: [
      { label: '获取用户信息-缓存', key: 'V2NIMUserService-getUserList' },
      { label: '获取用户信息-云端', key: 'V2NIMUserService-getUserListFromCloud' },
      { label: '更新用户信息', key: 'V2NIMUserService-updateSelfUserProfile' },
      { label: '黑名单管理', key: 'V2NIMUserService-addUserToBlockList' },
      { label: '设置监听事件', key: 'V2NIMUserService-on' },
    ],
  },
  {
    label: '好友服务',
    key: 'V2NIMFriendService',
    children: [
      { label: '获取好友列表', key: 'V2NIMFriendService-getFriendList' },
      { label: '按 ID 查好友', key: 'V2NIMFriendService-getFriendByIds' },
      { label: '添加好友', key: 'V2NIMFriendService-addFriend' },
      { label: '删除好友', key: 'V2NIMFriendService-deleteFriend' },
      { label: '接受好友申请', key: 'V2NIMFriendService-acceptAddApplication' },
      { label: '拒绝好友申请', key: 'V2NIMFriendService-rejectAddApplication' },
      { label: '设置监听事件', key: 'V2NIMFriendService-on' },
    ],
  },
  {
    label: '群组服务',
    key: 'V2NIMTeamService',
    children: [
      { label: '创建群组', key: 'V2NIMTeamService-createTeam' },
      { label: '获取群组列表', key: 'V2NIMTeamService-getJoinedTeamList' },
      { label: '根据 ID 获取群组信息', key: 'V2NIMTeamService-getTeamInfoByIds' },
      { label: '加入群组', key: 'V2NIMTeamService-joinTeam' },
      { label: '离开群组', key: 'V2NIMTeamService-leaveTeam' },
      { label: '解散群组', key: 'V2NIMTeamService-dismissTeam' },
      { label: '踢出某群组成员', key: 'V2NIMTeamService-kickMember' },
      { label: '(管理员)邀请成员', key: 'V2NIMTeamService-inviteMemberEx' },
      { label: '(用户)接受邀请入群', key: 'V2NIMTeamService-acceptInvitation' },
      { label: '(用户)拒绝邀请入群', key: 'V2NIMTeamService-rejectInvitation' },
      { label: '(用户)申请加入群组', key: 'V2NIMTeamService-applyJoinTeam' },
      { label: '(管理员)接受(用户的)入群申请', key: 'V2NIMTeamService-acceptJoinApplication' },
      { label: '(管理员)拒绝(用户的)入群申请', key: 'V2NIMTeamService-rejectJoinApplication' },
      { label: '设置成员角色', key: 'V2NIMTeamService-updateTeamMemberRole' },
      { label: '转让群主身份', key: 'V2NIMTeamService-transferTeamOwner' },
      { label: '群组整体禁言', key: 'V2NIMTeamService-setTeamChatBannedMode' },
      { label: '设置某群组成员禁言', key: 'V2NIMTeamService-setTeamMemberChatBannedStatus' },
      { label: '分页获取群成员列表', key: 'V2NIMTeamService-getTeamMemberList' },
      { label: '根据 ID 获取群成员', key: 'V2NIMTeamService-getTeamMemberListByIds' },
      { label: '设置监听事件', key: 'V2NIMTeamService-on' },
    ],
  },
  {
    label: '设置服务',
    key: 'V2NIMSettingService',
    children: [
      { label: '获取会话消息免打扰状态', key: 'V2NIMSettingService-getConversationMuteStatus' },
      { label: '设置群消息免打扰模式', key: 'V2NIMSettingService-setTeamMessageMuteMode' },
      { label: '设置点对点消息免打扰模式', key: 'V2NIMSettingService-setP2PMessageMuteMode' },
      {
        label: '设置当桌面端在线时，移动端是否需要推送',
        key: 'V2NIMSettingService-setPushMobileOnDesktopOnline',
      },
      {
        label: '获取当桌面端在线时，移动端是否需要推送配置',
        key: 'V2NIMSettingService-getPushMobileOnDesktopOnline',
      },
      { label: '设置监听事件', key: 'V2NIMSettingService-on' },
    ],
  },
  // {
  //   label: 'AI 机器人',
  //   key: 'V2NIMAIService',
  //   children: [{ label: 'AI 代理会话', key: 'V2NIMAIService-proxyAIModelCall' }],
  // },
  // {
  //   label: 'signalling 信令',
  //   key: 'V2NIMSignallingService',
  //   children: [
  //     { label: '邀请信令', key: 'V2NIMSignallingService-invite' },
  //     { label: '取消邀请', key: 'V2NIMSignallingService-cancel' },
  //     { label: '接受邀请', key: 'V2NIMSignallingService-accept' },
  //     { label: '拒绝邀请', key: 'V2NIMSignallingService-reject' },
  //   ],
  // },
  {
    label: '通知服务',
    key: 'V2NIMNotificationService',
    children: [
      { label: '发送自定义通知', key: 'V2NIMNotificationService-sendCustomNotification' },
      { label: '设置监听事件', key: 'V2NIMNotificationService-on' },
    ],
  },
  {
    label: '事件订阅',
    key: 'V2NIMSubscriptionService',
    children: [
      { label: '订阅用户状态', key: 'V2NIMSubscriptionService-subscribeUserStatus' },
      { label: '取消订阅用户状态', key: 'V2NIMSubscriptionService-unsubscribeUserStatus' },
      { label: '发布自定义的用户状态', key: 'V2NIMSubscriptionService-publishCustomUserStatus' },
      { label: '查询状态订阅', key: 'V2NIMSubscriptionService-queryUserStatusSubscriptions' },
      { label: '设置监听事件', key: 'V2NIMSubscriptionService-on' },
    ],
  },

  // {
  //   label: '服务代理',
  //   key: 'V2NIMPassthroughService',
  //   children: [{ label: 'HTTP 代理', key: 'V2NIMPassthroughService-httpProxy' }],
  // },
];
