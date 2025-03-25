import { Middleware, Telegraf } from "telegraf";
import { MySceneContext,sessionManager } from "../../utils/sessionManager";
import { requestUserProfile } from "../../services/copperX.service";
export const loginCommand = (bot : Telegraf<MySceneContext>) =>{
    bot.command("login", (ctx) => {
        ctx.scene.enter("login")
    })
}

/*export const getUserProfile = (bot : Telegraf<MySceneContext>, middleware :Middleware<MySceneContext> ) =>{
    bot.command("profile",middleware,async (ctx) =>{
        const token = sessionManager.getToken(ctx);
        try{
            const response = await requestUserProfile(token as string);
            console.log("response:", response)
            ctx.reply(`${response}`);
        }catch(err){
            console.error(err);
            return ctx.reply(
                "An error occurred while fetching your profile"
              );   
        }
      

    })
} 
*/
export const checkAuthStatus = (bot : Telegraf<MySceneContext>) => {

   return bot.command("status", (ctx) =>{
        const token = sessionManager.getToken(ctx)
        const isAuthenticated = ctx.session.isAuthenticated;
        if(token && isAuthenticated) {
         ctx.reply("You are logged in")   
        }else{
            ctx.reply("You are not logged in. Type /login to access your account.")
        }
    })
}