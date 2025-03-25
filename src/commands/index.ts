import { Telegraf } from "telegraf";
import { MySceneContext } from "../utils/sessionManager";
import { loginCommand } from "./auth/AuthCommands";

export default function setUpCommands (bot : Telegraf<MySceneContext>) {
    loginCommand(bot);
    //general commands
  bot.command("help", (ctx) => {
    ctx.reply("Here's how to use this bot: ...");
  }); 
}