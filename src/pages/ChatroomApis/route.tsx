import { Outlet, Route } from 'react-router-dom';

import APILayout from '@/components/APILayout';
import ChatroomInitForm from '@/components/ChatroomInitForm';
import { chatroomApiMenuItems } from '@/configs/chatroomApiMenu';

import V2NIMChatroomQueueServiceQueueBatchUpdate from './V2NIMChatroomQueueService/QueueBatchUpdate';
import V2NIMChatroomQueueServiceQueueDrop from './V2NIMChatroomQueueService/QueueDrop';
import V2NIMChatroomQueueServiceQueueInit from './V2NIMChatroomQueueService/QueueInit';
import V2NIMChatroomQueueServiceQueueList from './V2NIMChatroomQueueService/QueueList';
import V2NIMChatroomQueueServiceQueueOffer from './V2NIMChatroomQueueService/QueueOffer';
import V2NIMChatroomQueueServiceQueuePeek from './V2NIMChatroomQueueService/QueuePeek';
import V2NIMChatroomQueueServiceQueuePoll from './V2NIMChatroomQueueService/QueuePoll';
import V2NIMChatroomServiceGetMemberByIds from './V2NIMChatroomService/GetMemberByIds';
import V2NIMChatroomServiceGetMemberListByOption from './V2NIMChatroomService/GetMemberListByOption';
import V2NIMChatroomServiceGetMemberListByTag from './V2NIMChatroomService/GetMemberListByTag';
import V2NIMChatroomServiceGetMessageList from './V2NIMChatroomService/GetMessageList';
import V2NIMChatroomServiceGetMessageListByTag from './V2NIMChatroomService/GetMessageListByTag';
import V2NIMChatroomServiceKickMember from './V2NIMChatroomService/KickMember';
import V2NIMChatroomServiceSendMessage from './V2NIMChatroomService/SendMessage';
import V2NIMChatroomServiceSetMemberBlockedStatus from './V2NIMChatroomService/SetMemberBlockedStatus';
import V2NIMChatroomServiceSetMemberChatBannedStatus from './V2NIMChatroomService/SetMemberChatBannedStatus';
import V2NIMChatroomServiceSetMemberTempChatBanned from './V2NIMChatroomService/SetMemberTempChatBanned';
import V2NIMChatroomServiceSetTempChatBannedByTag from './V2NIMChatroomService/SetTempChatBannedByTag';
import V2NIMChatroomServiceUpdateChatroomInfo from './V2NIMChatroomService/UpdateChatroomInfo';
import V2NIMChatroomServiceUpdateChatroomTags from './V2NIMChatroomService/UpdateChatroomTags';
import V2NIMChatroomServiceUpdateMemberRole from './V2NIMChatroomService/UpdateMemberRole';
import V2NIMChatroomServiceUpdateSelfMemberInfo from './V2NIMChatroomService/UpdateSelfMemberInfo';
import V2NIMStorageServiceAddCustomStorageScene from './V2NIMStorageService/AddCustomStorageScene';
import V2NIMStorageServiceGetImageThumbUrl from './V2NIMStorageService/GetImageThumbUrl';
import V2NIMStorageServiceGetVideoCoverUrl from './V2NIMStorageService/GetVideoCoverUrl';
import V2NIMStorageServiceShortUrlToLong from './V2NIMStorageService/ShortUrlToLong';
import V2NIMStorageServiceUploadFile from './V2NIMStorageService/UploadFile';
import V2NIMStorageServiceUploadFileWithMetaInfo from './V2NIMStorageService/UploadFileWithMetaInfo';

// API Layout 包装器组件
// eslint-disable-next-line react-refresh/only-export-components
const APILayoutWrapper = () => {
  return (
    <APILayout menuItems={chatroomApiMenuItems} baseRoute="/chatroomApis" defaultKey="ChatroomInit">
      <Outlet />
    </APILayout>
  );
};

export const chatroomsRoutes = [
  // 使用嵌套路由，APILayout 只创建一次
  <Route path="/chatroomApis" element={<APILayoutWrapper />}>
    <Route index element={<ChatroomInitForm />} />,
    <Route path="V2NIMChatroomService/sendMessage" element={<V2NIMChatroomServiceSendMessage />} />
    ,
    <Route
      path="V2NIMChatroomService/getMessageList"
      element={<V2NIMChatroomServiceGetMessageList />}
    />
    ,
    <Route
      path="V2NIMChatroomService/getMessageListByTag"
      element={<V2NIMChatroomServiceGetMessageListByTag />}
    />
    ,
    <Route
      path="V2NIMChatroomService/getMemberListByOption"
      element={<V2NIMChatroomServiceGetMemberListByOption />}
    />
    ,
    <Route
      path="V2NIMChatroomService/getMemberListByTag"
      element={<V2NIMChatroomServiceGetMemberListByTag />}
    />
    ,
    <Route
      path="V2NIMChatroomService/getMemberByIds"
      element={<V2NIMChatroomServiceGetMemberByIds />}
    />
    ,
    <Route
      path="V2NIMChatroomService/updateSelfMemberInfo"
      element={<V2NIMChatroomServiceUpdateSelfMemberInfo />}
    />
    ,
    <Route
      path="V2NIMChatroomService/updateMemberRole"
      element={<V2NIMChatroomServiceUpdateMemberRole />}
    />
    ,
    <Route
      path="V2NIMChatroomService/setMemberBlockedStatus"
      element={<V2NIMChatroomServiceSetMemberBlockedStatus />}
    />
    ,
    <Route
      path="V2NIMChatroomService/setMemberChatBannedStatus"
      element={<V2NIMChatroomServiceSetMemberChatBannedStatus />}
    />
    ,
    <Route
      path="V2NIMChatroomService/setMemberTempChatBanned"
      element={<V2NIMChatroomServiceSetMemberTempChatBanned />}
    />
    ,
    <Route
      path="V2NIMChatroomService/setTempChatBannedByTag"
      element={<V2NIMChatroomServiceSetTempChatBannedByTag />}
    />
    ,
    <Route path="V2NIMChatroomService/kickMember" element={<V2NIMChatroomServiceKickMember />} />
    ,
    <Route
      path="V2NIMChatroomService/updateChatroomInfo"
      element={<V2NIMChatroomServiceUpdateChatroomInfo />}
    />
    ,
    <Route
      path="V2NIMChatroomService/updateChatroomTags"
      element={<V2NIMChatroomServiceUpdateChatroomTags />}
    />
    ,
    <Route
      path="V2NIMChatroomQueueService/queueInit"
      element={<V2NIMChatroomQueueServiceQueueInit />}
    />
    ,
    <Route
      path="V2NIMChatroomQueueService/queueOffer"
      element={<V2NIMChatroomQueueServiceQueueOffer />}
    />
    ,
    <Route
      path="V2NIMChatroomQueueService/queueBatchUpdate"
      element={<V2NIMChatroomQueueServiceQueueBatchUpdate />}
    />
    ,
    <Route
      path="V2NIMChatroomQueueService/queuePoll"
      element={<V2NIMChatroomQueueServiceQueuePoll />}
    />
    ,
    <Route
      path="V2NIMChatroomQueueService/queueList"
      element={<V2NIMChatroomQueueServiceQueueList />}
    />
    ,
    <Route
      path="V2NIMChatroomQueueService/queuePeek"
      element={<V2NIMChatroomQueueServiceQueuePeek />}
    />
    ,
    <Route
      path="V2NIMChatroomQueueService/queueDrop"
      element={<V2NIMChatroomQueueServiceQueueDrop />}
    />
    ,
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
  </Route>,
];
