import { Scenes, session, Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { MySceneContext } from "./utils/types";
import loginScene from "./scenes/auth/LoginWithCreds";
import verifyCodeScene from "./scenes/auth/VerifyCode";

// Load environment variables first
dotenv.config();

// Validate required environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("ERROR: TELEGRAM_BOT_TOKEN is not set in environment variables!");
  process.exit(1);
}

// Instantiate Bot
export const bot = new Telegraf<MySceneContext>(token);

// Register Scenes
const stage = new Scenes.Stage<MySceneContext>([loginScene, verifyCodeScene]);

// Configure middleware
bot.use(session());
bot.use(stage.middleware());

// Command handlers
bot.start((ctx) => {
  ctx.reply(
    `👋 Welcome to Copperx Payout Bot!\n\n` +
    `To get started, \n\n` +
    `type /login to authenticate with email.\n\n` +
    `type /google to authenticate using Google's OAuth.\n\n` +
    `type /signup if You don't have an Account Sign Up`
  );
});

// Add other command handlers
bot.command("login", (ctx) => ctx.scene.enter("login"));


// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply("An error occurred while processing your request. Please try again later.");
});

// Start the bot
const startBot = async () => {
  try {
    await bot.launch();
    console.log("🤖 Bot is running...");
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
};

startBot();

// Handle graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));