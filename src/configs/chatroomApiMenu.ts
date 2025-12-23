import { MenuItemWithRender } from './apiMenu';

export const chatroomApiMenuItems: MenuItemWithRender[] = [
  {
    label: '初始化与进入聊天室',
    key: 'ChatroomInit',
  },
  {
    label: '聊天室通用服务',
    key: 'V2NIMChatroomService',
    children: [
      {
        label: '发送聊天室消息',
        key: 'V2NIMChatroomService-sendMessage',
      },
      {
        label: '获取消息列表',
        key: 'V2NIMChatroomService-getMessageList',
      },
      {
        label: '按标签获取消息列表',
        key: 'V2NIMChatroomService-getMessageListByTag',
      },
      {
        label: '获取成员列表',
        key: 'V2NIMChatroomService-getMemberListByOption',
      },
      {
        label: '按标签获取成员列表',
        key: 'V2NIMChatroomService-getMemberListByTag',
      },
      {
        label: '批量获取成员信息',
        key: 'V2NIMChatroomService-getMemberByIds',
      },
      {
        label: '更新本人成员信息',
        key: 'V2NIMChatroomService-updateSelfMemberInfo',
      },
      {
        label: '更新成员角色',
        key: 'V2NIMChatroomService-updateMemberRole',
      },
      {
        label: '设置成员黑名单状态',
        key: 'V2NIMChatroomService-setMemberBlockedStatus',
      },
      {
        label: '设置成员禁言状态',
        key: 'V2NIMChatroomService-setMemberChatBannedStatus',
      },
      {
        label: '设置成员临时禁言',
        key: 'V2NIMChatroomService-setMemberTempChatBanned',
      },
      {
        label: '设置标签临时禁言',
        key: 'V2NIMChatroomService-setTempChatBannedByTag',
      },
      {
        label: '踢出聊天室成员',
        key: 'V2NIMChatroomService-kickMember',
      },
      {
        label: '更新聊天室信息',
        key: 'V2NIMChatroomService-updateChatroomInfo',
      },
      {
        label: '更新聊天室标签',
        key: 'V2NIMChatroomService-updateChatroomTags',
      },
    ],
  },
  {
    label: '聊天室队列服务',
    key: 'V2NIMChatroomQueueService',
    children: [
      {
        label: '初始化队列',
        key: 'V2NIMChatroomQueueService-queueInit',
      },
      {
        label: '新增/更新队列元素',
        key: 'V2NIMChatroomQueueService-queueOffer',
      },
      {
        label: '批量更新队列元素',
        key: 'V2NIMChatroomQueueService-queueBatchUpdate',
      },
      {
        label: '取出队列元素',
        key: 'V2NIMChatroomQueueService-queuePoll',
      },
      {
        label: '获取队列列表',
        key: 'V2NIMChatroomQueueService-queueList',
      },
      {
        label: '查看队列头元素',
        key: 'V2NIMChatroomQueueService-queuePeek',
      },
      {
        label: '清空队列',
        key: 'V2NIMChatroomQueueService-queueDrop',
      },
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
];
