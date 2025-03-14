import { Telegraf } from "telegraf";
import * as dotenv from "dotenv"
dotenv.config();
//Instantiate Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.start((ctx) => {
    console.log(ctx)
})

//Start Bot 
bot.launch();
console.log("🤖 Bot is running...");

// Handle graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));