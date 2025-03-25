import { Telegraf } from "telegraf";
import { MySceneContext } from "../utils/sessionManager";

export default function infoCommands (bot : Telegraf<MySceneContext>) {
    bot.command("status", (ctx) => {
        const status = ctx.session.isAuthenticated
        if(status){
            ctx.reply(`You are logged in as ${ctx.session.userInfo?.email}`)
        }
        else {
            ctx.reply("You are not logged in. Use /login to authenticate.")
        }
        bot.command("about", (ctx) => {
            ctx.reply("CopperX Payout Bot helps you manage payments easily from Telegram.");
          });
    })
}