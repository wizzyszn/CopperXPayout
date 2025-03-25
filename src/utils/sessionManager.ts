import { Scenes } from "telegraf";
import * as crypto from "crypto";
import dotenv from "dotenv";
import { Networks } from "./types";
import { WizardContext, WizardSessionData } from "telegraf/typings/scenes";
dotenv.config();
interface UserInfoInt {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  organizationId: string;
  role: "owner";
  status: "pending" | "active";
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
  authData?: AuthDataInt;
  userInfo?: UserInfoInt;
  expiresAt?: number;
  token?: string;
  walletData?: {
    walletType: string;
    walletId: string;
    isDefault: boolean;
    network : Networks
  }[]
}
interface MySceneContext extends Scenes.SceneContext {
  session: MySession;
}

interface AuthDataInt {
  token: string;
  expiresAt: number;
}
export type { MySceneContext, MySession, UserInfoInt };
const TOKEN_EXPIRY_MS = 3600 * 24 * 1000;

export class sessionManager {
  private static rateLimitMap = new Map<
    string,
    {
      count: number;
      resetAt: number;
    }
  >();
  private static MAX_REQUESTS = 5;
  private static RATE_LIMIT_WINDOW_MS = 60 * 1000;

  // method to encrypt sensitive data
  static EncryptData<T>(data: T): string {
    const key = Buffer.from(process.env.AES_256_KEY as string, "hex"); // 32-byte Buffer
    const iv = crypto.randomBytes(16);
    const algo = "aes-256-ctr";
    const serializedData =
      typeof data === "string" ? data : JSON.stringify(data);
    const cipher = crypto.createCipheriv(algo, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(serializedData),
      cipher.final(),
    ]);
    return `${iv.toString("hex")} : ${encrypted.toString("hex")}`;
  }

  //method to decrypt stored sensitive data
  static DecryptData<T>(data: string): T {
    const key = Buffer.from(process.env.AES_256_KEY as string, "hex");
    const [ivHex, encrypted] = data.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-ctr",
      key,
      Buffer.from(ivHex, "hex")
    );
    const decrypted = Buffer.concat([
      decipher.update(encrypted.trim(), "hex"),
      decipher.final(),
    ]);
    const decryptedString = decrypted.toString("utf8");
    try {
      return JSON.parse(decryptedString);
    } catch (err) {
      return decryptedString as unknown as T;
    }
  }
  // method to securely store token in session
  static setToken(ctx: MySceneContext, token: string) {
    const AuthData: AuthDataInt = {
      token: this.EncryptData(token),
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    };
    ctx.session.authData = AuthData;
    ctx.session.isAuthenticated = true;
  }

  // method to get to token
  static getToken(ctx: MySceneContext): string | null {
    const authData = ctx.session.authData ?? null;
    //check if there is token
    if (!authData) {
      return null;
    }
    // check if token is valid
    if (authData.expiresAt > Date.now()) {
      return this.DecryptData(authData.token);
    }
    //token expired cleat token
    this.clearToken;
    return null;
  }

  // method to clear token
  static clearToken(ctx: MySceneContext): void {
    delete ctx.session.token;
    delete ctx.session.authData;
    ctx.session.isAuthenticated = false;
  }
  // Check if rate limit is exceeded
 /* static checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(userId);

    // First request or limit period expired
    if (!userLimit || userLimit.resetAt < now) {
      this.rateLimitMap.set(userId, {
        count: 1,
        resetAt: now + this.RATE_LIMIT_WINDOW_MS,
      });
      return false;
    }

    // Increment counter
    userLimit.count += 1;

    // Check if limit exceeded
    if (userLimit.count > this.MAX_REQUESTS) {
      return true;
    }

    return false;
  } */
}
