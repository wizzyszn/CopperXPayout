"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const sessionManager_1 = require("../utils/sessionManager");
const requireAuth = async (ctx, next) => {
    await ctx.answerCbQuery();
    // Check if user is authenticated
    if (!ctx.session.isAuthenticated) {
        ctx.reply("⚠️ Your session has expired. Use /login to access your account.");
        return;
    }
    // Check if token is still valid
    const token = sessionManager_1.sessionManager.getToken(ctx);
    if (!token) {
        ctx.reply("Your session has expired. Please log in again.");
        ctx.scene.enter("login");
    }
    ctx.session.token = token;
    return next();
};
exports.requireAuth = requireAuth;
/*export const rateLimiter = (ctx : Context, next : () => Promise<void>) =>{
    const userId = ctx.from?.id.toString();
    if(!userId){
        return next();
    }
    if(sessionManager.checkRateLimit(userId)){
        ctx.reply("Too many requests. Please try again later.");
        return
    }
    return next();
} */ 
