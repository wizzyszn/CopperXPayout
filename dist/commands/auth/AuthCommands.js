"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthStatus = exports.loginCommand = void 0;
const sessionManager_1 = require("../../utils/sessionManager");
const loginCommand = (bot) => {
    bot.command("login", (ctx) => {
        ctx.scene.enter("login");
    });
};
exports.loginCommand = loginCommand;
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
const checkAuthStatus = (bot) => {
    return bot.command("status", (ctx) => {
        const token = sessionManager_1.sessionManager.getToken(ctx);
        const isAuthenticated = ctx.session.isAuthenticated;
        if (token && isAuthenticated) {
            ctx.reply("You are logged in");
        }
        else {
            ctx.reply("You are not logged in. Type /login to access your account.");
        }
    });
};
exports.checkAuthStatus = checkAuthStatus;
