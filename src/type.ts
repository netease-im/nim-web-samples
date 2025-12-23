import { type V2NIM } from 'nim-web-sdk-ng';
import { type V2NIMChatroomClient } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK';

declare global {
  interface Window {
    NIM: typeof V2NIM;
    nim: InstanceType<typeof V2NIM> | void;
    chatroomV2: InstanceType<typeof V2NIMChatroomClient> | void; // 聊天室实例
  }
  type strAnyObj = {
    [key: string]: any;
  };
}
