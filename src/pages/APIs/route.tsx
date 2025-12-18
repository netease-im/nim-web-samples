import { Navigate, Outlet, Route } from 'react-router-dom';

import APILayout from '@/components/APILayout';
import NIMInitForm from '@/components/NIMInitForm';

import V2NIMConversationGroupServiceAddConversationsToGroup from './V2NIMConversationGroupService/AddConversationsToGroup';
import V2NIMConversationGroupServiceCreateConversationGroup from './V2NIMConversationGroupService/CreateConversationGroup';
import V2NIMConversationGroupServiceDeleteConversationGroup from './V2NIMConversationGroupService/DeleteConversationGroup';
import V2NIMConversationGroupServiceGetConversationGroupList from './V2NIMConversationGroupService/GetConversationGroupList';
import V2NIMConversationGroupServiceOn from './V2NIMConversationGroupService/On';
import V2NIMConversationGroupServiceRemoveConversationsFromGroup from './V2NIMConversationGroupService/RemoveConversationsFromGroup';
import V2NIMConversationGroupServiceUpdateConversationGroup from './V2NIMConversationGroupService/UpdateConversationGroup';
import V2NIMConversationServiceCreateConversation from './V2NIMConversationService/CreateConversation';
import V2NIMConversationServiceDeleteConversation from './V2NIMConversationService/DeleteConversation';
import V2NIMConversationServiceGetConversationList from './V2NIMConversationService/GetConversationList';
import V2NIMConversationServiceMarkConversationRead from './V2NIMConversationService/MarkConversationRead';
import V2NIMConversationServiceOn from './V2NIMConversationService/On';
import V2NIMConversationServiceStickTopConversation from './V2NIMConversationService/StickTopConversation';
import V2NIMFriendServiceAcceptAddApplication from './V2NIMFriendService/AcceptAddApplication';
import V2NIMFriendServiceAddFriend from './V2NIMFriendService/AddFriend';
import V2NIMFriendServiceDeleteFriend from './V2NIMFriendService/DeleteFriend';
import V2NIMFriendServiceGetFriendByIds from './V2NIMFriendService/GetFriendByIds';
import V2NIMFriendServiceGetFriendList from './V2NIMFriendService/GetFriendList';
import V2NIMFriendServiceOn from './V2NIMFriendService/On';
import V2NIMFriendServiceRejectAddApplication from './V2NIMFriendService/RejectAddApplication';
import V2NIMLocalConversationServiceCreateConversation from './V2NIMLocalConversationService/CreateConversation';
import V2NIMLocalConversationServiceDeleteConversation from './V2NIMLocalConversationService/DeleteConversation';
import V2NIMLocalConversationServiceMarkConversationRead from './V2NIMLocalConversationService/MarkConversationRead';
import V2NIMLocalConversationServiceOn from './V2NIMLocalConversationService/On';
import V2NIMLocalConversationServiceStickTopConversation from './V2NIMLocalConversationService/StickTopConversation';
import V2NIMLoginServiceKickOffline from './V2NIMLoginService/KickOffline';
import V2NIMLoginServiceLogin from './V2NIMLoginService/Login';
import V2NIMLoginServiceOn from './V2NIMLoginService/On';
import V2NIMMessageServiceClearHistoryMessage from './V2NIMMessageService/ClearHistoryMessage';
import V2NIMMessageServiceDeleteMessage from './V2NIMMessageService/DeleteMessage';
import V2NIMMessageServiceGetMessageListEx from './V2NIMMessageService/GetMessageListEx';
import V2NIMMessageServiceOn from './V2NIMMessageService/On';
import V2NIMMessageServiceRevokeMessage from './V2NIMMessageService/RevokeMessage';
import V2NIMMessageServiceSendMessage from './V2NIMMessageService/SendMessage';
import V2NIMNotificationServiceOn from './V2NIMNotificationService/On';
import V2NIMNotificationServiceSendCustomNotification from './V2NIMNotificationService/SendCustomNotification';
import V2NIMSettingServiceGetConversationMuteStatus from './V2NIMSettingService/GetConversationMuteStatus';
import V2NIMSettingServiceGetPushMobileOnDesktopOnline from './V2NIMSettingService/GetPushMobileOnDesktopOnline';
import V2NIMSettingServiceOn from './V2NIMSettingService/On';
import V2NIMSettingServiceSetP2PMessageMuteMode from './V2NIMSettingService/SetP2PMessageMuteMode';
import V2NIMSettingServiceSetPushMobileOnDesktopOnline from './V2NIMSettingService/SetPushMobileOnDesktopOnline';
import V2NIMSettingServiceSetTeamMessageMuteMode from './V2NIMSettingService/SetTeamMessageMuteMode';
import V2NIMStorageServiceAddCustomStorageScene from './V2NIMStorageService/AddCustomStorageScene';
import V2NIMStorageServiceGetImageThumbUrl from './V2NIMStorageService/GetImageThumbUrl';
import V2NIMStorageServiceGetVideoCoverUrl from './V2NIMStorageService/GetVideoCoverUrl';
import V2NIMStorageServiceShortUrlToLong from './V2NIMStorageService/ShortUrlToLong';
import V2NIMStorageServiceUploadFile from './V2NIMStorageService/UploadFile';
import V2NIMStorageServiceUploadFileWithMetaInfo from './V2NIMStorageService/UploadFileWithMetaInfo';
import V2NIMSubscriptionServiceOn from './V2NIMSubscriptionService/On';
import V2NIMSubscriptionServicePublishCustomUserStatus from './V2NIMSubscriptionService/PublishCustomUserStatus';
import V2NIMSubscriptionServiceQueryUserStatusSubscriptions from './V2NIMSubscriptionService/QueryUserStatusSubscriptions';
import V2NIMSubscriptionServiceSubscribeUserStatus from './V2NIMSubscriptionService/SubscribeUserStatus';
import V2NIMSubscriptionServiceUnsubscribeUserStatus from './V2NIMSubscriptionService/UnsubscribeUserStatus';
import V2NIMTeamServiceAcceptInvitation from './V2NIMTeamService/AcceptInvitation';
import V2NIMTeamServiceAcceptJoinApplication from './V2NIMTeamService/AcceptJoinApplication';
import V2NIMTeamServiceApplyJoinTeam from './V2NIMTeamService/ApplyJoinTeam';
import V2NIMTeamServiceCreateTeam from './V2NIMTeamService/CreateTeam';
import V2NIMTeamServiceDismissTeam from './V2NIMTeamService/DismissTeam';
import V2NIMTeamServiceGetJoinedTeamList from './V2NIMTeamService/GetJoinedTeamList';
import V2NIMTeamServiceGetTeamInfoByIds from './V2NIMTeamService/GetTeamInfoByIds';
import V2NIMTeamServiceGetTeamMemberList from './V2NIMTeamService/GetTeamMemberList';
import V2NIMTeamServiceGetTeamMemberListByIds from './V2NIMTeamService/GetTeamMemberListByIds';
import V2NIMTeamServiceInviteMemberEx from './V2NIMTeamService/InviteMemberEx';
import V2NIMTeamServiceJoinTeam from './V2NIMTeamService/JoinTeam';
import V2NIMTeamServiceKickMember from './V2NIMTeamService/KickMember';
import V2NIMTeamServiceLeaveTeam from './V2NIMTeamService/LeaveTeam';
import V2NIMTeamServiceOn from './V2NIMTeamService/On';
import V2NIMTeamServiceRejectInvitation from './V2NIMTeamService/RejectInvitation';
import V2NIMTeamServiceRejectJoinApplication from './V2NIMTeamService/RejectJoinApplication';
import V2NIMTeamServiceSetTeamChatBannedMode from './V2NIMTeamService/SetTeamChatBannedMode';
import V2NIMTeamServiceSetTeamMemberChatBannedStatus from './V2NIMTeamService/SetTeamMemberChatBannedStatus';
import V2NIMTeamServiceTransferTeamOwner from './V2NIMTeamService/TransferTeamOwner';
import V2NIMTeamServiceUpdateTeamMemberRole from './V2NIMTeamService/UpdateTeamMemberRole';
import V2NIMUserServiceAddUserToBlockList from './V2NIMUserService/AddUserToBlockList';
import V2NIMUserServiceGetUserList from './V2NIMUserService/GetUserList';
import V2NIMUserServiceGetUserListFromCloud from './V2NIMUserService/GetUserListFromCloud';
import V2NIMUserServiceOn from './V2NIMUserService/On';
import V2NIMUserServiceUpdateSelfUserProfile from './V2NIMUserService/UpdateSelfUserProfile';
import APIs from './index';

// API Layout 包装器组件
// eslint-disable-next-line react-refresh/only-export-components
const APILayoutWrapper = () => {
  return (
    <APILayout>
      <Outlet />
    </APILayout>
  );
};

export const apiRoutes = [
  <Route path="/" element={<Navigate to="/apis" replace />} />,

  // 使用嵌套路由，APILayout 只创建一次
  <Route path="/apis" element={<APILayoutWrapper />}>
    <Route index element={<NIMInitForm />} />,
    <Route path="V2NIMLoginService/login" element={<V2NIMLoginServiceLogin />} />,
    <Route path="V2NIMLoginService/kickOffline" element={<V2NIMLoginServiceKickOffline />} />,
    <Route path="V2NIMLoginService/on" element={<V2NIMLoginServiceOn />} />,
    <Route
      path="V2NIMConversationService/createConversation"
      element={<V2NIMConversationServiceCreateConversation />}
    />
    <Route
      path="V2NIMConversationService/deleteConversation"
      element={<V2NIMConversationServiceDeleteConversation />}
    />
    <Route
      path="V2NIMConversationService/markConversationRead"
      element={<V2NIMConversationServiceMarkConversationRead />}
    />
    <Route path="V2NIMConversationService/on" element={<V2NIMConversationServiceOn />} />
    <Route
      path="V2NIMConversationService/stickTopConversation"
      element={<V2NIMConversationServiceStickTopConversation />}
    />
    <Route
      path="V2NIMConversationService/getConversationList"
      element={<V2NIMConversationServiceGetConversationList />}
    />
    <Route
      path="V2NIMConversationGroupService/createConversationGroup"
      element={<V2NIMConversationGroupServiceCreateConversationGroup />}
    />
    <Route
      path="V2NIMConversationGroupService/deleteConversationGroup"
      element={<V2NIMConversationGroupServiceDeleteConversationGroup />}
    />
    <Route
      path="V2NIMConversationGroupService/updateConversationGroup"
      element={<V2NIMConversationGroupServiceUpdateConversationGroup />}
    />
    <Route
      path="V2NIMConversationGroupService/addConversationsToGroup"
      element={<V2NIMConversationGroupServiceAddConversationsToGroup />}
    />
    <Route
      path="V2NIMConversationGroupService/removeConversationsFromGroup"
      element={<V2NIMConversationGroupServiceRemoveConversationsFromGroup />}
    />
    <Route
      path="V2NIMConversationGroupService/getConversationGroupList"
      element={<V2NIMConversationGroupServiceGetConversationGroupList />}
    />
    <Route path="V2NIMConversationGroupService/on" element={<V2NIMConversationGroupServiceOn />} />
    <Route
      path="V2NIMLocalConversationService/createConversation"
      element={<V2NIMLocalConversationServiceCreateConversation />}
    />
    ,
    <Route
      path="V2NIMLocalConversationService/deleteConversation"
      element={<V2NIMLocalConversationServiceDeleteConversation />}
    />
    ,
    <Route
      path="V2NIMLocalConversationService/stickTopConversation"
      element={<V2NIMLocalConversationServiceStickTopConversation />}
    />
    ,
    <Route
      path="V2NIMLocalConversationService/markConversationRead"
      element={<V2NIMLocalConversationServiceMarkConversationRead />}
    />
    ,
    <Route path="V2NIMLocalConversationService/on" element={<V2NIMLocalConversationServiceOn />} />,
    <Route path="V2NIMMessageService/sendMessage" element={<V2NIMMessageServiceSendMessage />} />,
    <Route
      path="V2NIMMessageService/getMessageListEx"
      element={<V2NIMMessageServiceGetMessageListEx />}
    />
    ,
    <Route
      path="V2NIMMessageService/revokeMessage"
      element={<V2NIMMessageServiceRevokeMessage />}
    />
    ,
    <Route
      path="V2NIMMessageService/clearHistoryMessage"
      element={<V2NIMMessageServiceClearHistoryMessage />}
    />
    ,
    <Route
      path="V2NIMMessageService/deleteMessages"
      element={<V2NIMMessageServiceDeleteMessage />}
    />
    ,
    <Route path="V2NIMMessageService/on" element={<V2NIMMessageServiceOn />} />,
    <Route path="V2NIMUserService/getUserList" element={<V2NIMUserServiceGetUserList />} />,
    <Route
      path="V2NIMUserService/getUserListFromCloud"
      element={<V2NIMUserServiceGetUserListFromCloud />}
    />
    ,
    <Route
      path="V2NIMUserService/updateSelfUserProfile"
      element={<V2NIMUserServiceUpdateSelfUserProfile />}
    />
    ,
    <Route
      path="V2NIMUserService/addUserToBlockList"
      element={<V2NIMUserServiceAddUserToBlockList />}
    />
    ,
    <Route path="V2NIMUserService/on" element={<V2NIMUserServiceOn />} />,
    <Route path="V2NIMFriendService/getFriendList" element={<V2NIMFriendServiceGetFriendList />} />,
    <Route
      path="V2NIMFriendService/getFriendByIds"
      element={<V2NIMFriendServiceGetFriendByIds />}
    />
    ,
    <Route path="V2NIMFriendService/addFriend" element={<V2NIMFriendServiceAddFriend />} />,
    <Route path="V2NIMFriendService/deleteFriend" element={<V2NIMFriendServiceDeleteFriend />} />,
    <Route
      path="V2NIMFriendService/acceptAddApplication"
      element={<V2NIMFriendServiceAcceptAddApplication />}
    />
    ,
    <Route
      path="V2NIMFriendService/rejectAddApplication"
      element={<V2NIMFriendServiceRejectAddApplication />}
    />
    ,
    <Route path="V2NIMFriendService/on" element={<V2NIMFriendServiceOn />} />,
    <Route path="V2NIMTeamService/createTeam" element={<V2NIMTeamServiceCreateTeam />} />,
    <Route
      path="V2NIMTeamService/getJoinedTeamList"
      element={<V2NIMTeamServiceGetJoinedTeamList />}
    />
    ,
    <Route
      path="V2NIMTeamService/getTeamInfoByIds"
      element={<V2NIMTeamServiceGetTeamInfoByIds />}
    />
    ,
    <Route path="V2NIMTeamService/joinTeam" element={<V2NIMTeamServiceJoinTeam />} />
    ,
    <Route path="V2NIMTeamService/leaveTeam" element={<V2NIMTeamServiceLeaveTeam />} />
    ,
    <Route path="V2NIMTeamService/kickMember" element={<V2NIMTeamServiceKickMember />} />
    ,
    <Route path="V2NIMTeamService/dismissTeam" element={<V2NIMTeamServiceDismissTeam />} />
    ,
    <Route path="V2NIMTeamService/inviteMemberEx" element={<V2NIMTeamServiceInviteMemberEx />} />
    <Route
      path="V2NIMTeamService/acceptInvitation"
      element={<V2NIMTeamServiceAcceptInvitation />}
    />
    <Route
      path="V2NIMTeamService/rejectInvitation"
      element={<V2NIMTeamServiceRejectInvitation />}
    />
    <Route path="V2NIMTeamService/applyJoinTeam" element={<V2NIMTeamServiceApplyJoinTeam />} />
    <Route
      path="V2NIMTeamService/acceptJoinApplication"
      element={<V2NIMTeamServiceAcceptJoinApplication />}
    />
    <Route
      path="V2NIMTeamService/rejectJoinApplication"
      element={<V2NIMTeamServiceRejectJoinApplication />}
    />
    <Route
      path="V2NIMTeamService/updateTeamMemberRole"
      element={<V2NIMTeamServiceUpdateTeamMemberRole />}
    />
    <Route
      path="V2NIMTeamService/transferTeamOwner"
      element={<V2NIMTeamServiceTransferTeamOwner />}
    />
    <Route
      path="V2NIMTeamService/setTeamChatBannedMode"
      element={<V2NIMTeamServiceSetTeamChatBannedMode />}
    />
    <Route
      path="V2NIMTeamService/setTeamMemberChatBannedStatus"
      element={<V2NIMTeamServiceSetTeamMemberChatBannedStatus />}
    />
    <Route
      path="V2NIMTeamService/getTeamMemberList"
      element={<V2NIMTeamServiceGetTeamMemberList />}
    />
    <Route
      path="V2NIMTeamService/getTeamMemberListByIds"
      element={<V2NIMTeamServiceGetTeamMemberListByIds />}
    />
    <Route path="V2NIMTeamService/on" element={<V2NIMTeamServiceOn />} />
    <Route path="V2NIMNotificationService/on" element={<V2NIMNotificationServiceOn />} />
    <Route
      path="V2NIMNotificationService/sendCustomNotification"
      element={<V2NIMNotificationServiceSendCustomNotification />}
    />
    <Route
      path="V2NIMSettingService/getConversationMuteStatus"
      element={<V2NIMSettingServiceGetConversationMuteStatus />}
    />
    <Route
      path="V2NIMSettingService/getPushMobileOnDesktopOnline"
      element={<V2NIMSettingServiceGetPushMobileOnDesktopOnline />}
    />
    <Route
      path="V2NIMSettingService/setTeamMessageMuteMode"
      element={<V2NIMSettingServiceSetTeamMessageMuteMode />}
    />
    <Route
      path="V2NIMSettingService/setP2PMessageMuteMode"
      element={<V2NIMSettingServiceSetP2PMessageMuteMode />}
    />
    <Route
      path="V2NIMSettingService/setPushMobileOnDesktopOnline"
      element={<V2NIMSettingServiceSetPushMobileOnDesktopOnline />}
    />
    <Route path="V2NIMSettingService/on" element={<V2NIMSettingServiceOn />} />
    <Route
      path="V2NIMStorageService/addCustomStorageScene"
      element={<V2NIMStorageServiceAddCustomStorageScene />}
    />
    <Route
      path="V2NIMStorageService/getImageThumbUrl"
      element={<V2NIMStorageServiceGetImageThumbUrl />}
    />
    <Route
      path="V2NIMStorageService/getVideoCoverUrl"
      element={<V2NIMStorageServiceGetVideoCoverUrl />}
    />
    <Route
      path="V2NIMStorageService/shortUrlToLong"
      element={<V2NIMStorageServiceShortUrlToLong />}
    />
    <Route path="V2NIMStorageService/uploadFile" element={<V2NIMStorageServiceUploadFile />} />
    <Route
      path="V2NIMStorageService/uploadFileWithMetaInfo"
      element={<V2NIMStorageServiceUploadFileWithMetaInfo />}
    />
    <Route path="V2NIMSubscriptionService/on" element={<V2NIMSubscriptionServiceOn />} />
    <Route
      path="V2NIMSubscriptionService/subscribeUserStatus"
      element={<V2NIMSubscriptionServiceSubscribeUserStatus />}
    />
    <Route
      path="V2NIMSubscriptionService/unsubscribeUserStatus"
      element={<V2NIMSubscriptionServiceUnsubscribeUserStatus />}
    />
    <Route
      path="V2NIMSubscriptionService/publishCustomUserStatus"
      element={<V2NIMSubscriptionServicePublishCustomUserStatus />}
    />
    <Route
      path="V2NIMSubscriptionService/queryUserStatusSubscriptions"
      element={<V2NIMSubscriptionServiceQueryUserStatusSubscriptions />}
    />
    {/* 通用表单路由 */}
    <Route path=":service/:method" element={<APIs />} />,
  </Route>,
];
