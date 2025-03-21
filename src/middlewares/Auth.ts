import { Context } from "telegraf";
import { MySceneContext, sessionManager } from "../utils/sessionManager";

export const requireAuth = (ctx : MySceneContext, next : () => Promise<void>) =>{
      // Check if user is authenticated
    if(!ctx.session.isAuthenticated){
        ctx.reply("Your session has expired. Use /login to authenticate.")
        return
    }
    // Check if token is still valid
    const token = sessionManager.getToken(ctx);
    if(!token){
        ctx.reply("Your session has expired. Please log in again.");
        ctx.scene.enter("login");
    }
    ctx.session.token = token as string;
    return next()
}

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