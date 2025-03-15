import { Scenes } from "telegraf";
interface UserInfoInt {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  organizationId: string;
  role: "owner";
  status: "pending";
  type: "individual";
  relayerAddress: string;
  flags: string[];
  walletAddress: string;
  walletId: string;
  walletAccountType: string;
}

interface MySession extends Scenes.SceneSession<Scenes.SceneSessionData> {
  email?: string;
  sid?: string;
  otp?: string;
  isAuthenticated?: boolean;
  token?: string;
  userInfo?: UserInfoInt;
}
interface MySceneContext extends Scenes.SceneContext {
  session: MySession;
}
interface GeneralReturnInt<T> {
  message: object | string;
  statusCode: number;
  error?: "string";
  data?: T;
}
interface RejectInt {
  message: object | string;
  statusCode: 0;
  error?: "string";
}
export { MySceneContext, MySession, GeneralReturnInt, RejectInt, UserInfoInt };
