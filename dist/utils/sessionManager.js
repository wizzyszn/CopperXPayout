"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionManager = void 0;
const crypto = __importStar(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TOKEN_EXPIRY_MS = 3600 * 24 * 1000;
class sessionManager {
    // method to encrypt sensitive data
    // method to encrypt sensitive data
    static EncryptData(data) {
        const key = Buffer.from(process.env.AES_256_KEY, "hex"); // 32-byte Buffer
        const iv = crypto.randomBytes(16);
        const algo = "aes-256-ctr";
        const serializedData = typeof data === "string" ? data : JSON.stringify(data);
        const cipher = crypto.createCipheriv(algo, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(serializedData),
            cipher.final(),
        ]);
        return `${iv.toString("hex")} : ${encrypted.toString("hex")}`;
    }
    //method to decrypt stored sensitive data
    static DecryptData(data) {
        const key = Buffer.from(process.env.AES_256_KEY, "hex");
        const [ivHex, encrypted] = data.split(":");
        const decipher = crypto.createDecipheriv("aes-256-ctr", key, Buffer.from(ivHex, "hex"));
        const decrypted = Buffer.concat([
            decipher.update(encrypted.trim(), "hex"),
            decipher.final(),
        ]);
        const decryptedString = decrypted.toString("utf8");
        try {
            return JSON.parse(decryptedString);
        }
        catch (err) {
            return decryptedString;
        }
    }
    // method to securely store token in session
    static setToken(ctx, token) {
        const AuthData = {
            token: this.EncryptData(token),
            expiresAt: Date.now() + TOKEN_EXPIRY_MS,
        };
        ctx.session.authData = AuthData;
        ctx.session.isAuthenticated = true;
    }
    // method to get to token
    static getToken(ctx) {
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
        this.clearToken(ctx); //fixed
        return null;
    }
    // method to clear token
    static clearToken(ctx) {
        delete ctx.session.token;
        delete ctx.session.authData;
        ctx.session.isAuthenticated = false;
    }
    // Check if rate limit is exceeded
    static checkRateLimit(userId) {
        const now = Date.now();
        const userLimit = this.rateLimitMap.get(userId);
        if (!userLimit || userLimit.resetAt < now) {
            this.rateLimitMap.set(userId, {
                count: 1,
                resetAt: now + this.RATE_LIMIT_WINDOW_MS,
            });
            return false;
        }
        userLimit.count += 1;
        this.rateLimitMap.set(userId, userLimit); // Persist updated count
        return userLimit.count > this.MAX_REQUESTS;
    }
}
exports.sessionManager = sessionManager;
sessionManager.rateLimitMap = new Map();
sessionManager.MAX_REQUESTS = 5;
sessionManager.RATE_LIMIT_WINDOW_MS = 60 * 1000;
