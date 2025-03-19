import { Scenes, session, Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { MySceneContext, sessionManager } from "./utils/sessionManager";
import loginScene from "./scenes/auth/LoginWithCreds";
import verifyCodeScene from "./scenes/auth/VerifyCode";
import { rateLimiter, requireAuth } from "./middlewares/Auth";
import { checkAuthStatus, getUserProfile } from "./commands/auth/AuthCommands";

// Load environment variables first
dotenv.config();

// Validate required environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error(
    "ERROR: TELEGRAM_BOT_TOKEN is not set in environment variables!"
  );
  process.exit(1);
}

// Instantiate Bot
export const bot = new Telegraf<MySceneContext>(token);

// Register Scenes
const stage = new Scenes.Stage<MySceneContext>([loginScene, verifyCodeScene]);

// Configure middleware
bot.use(session());
bot.use(rateLimiter);
bot.use(stage.middleware());

// Command handlers
/*bot.start((ctx) => {
  ctx.reply(
    `👋 Welcome to Copperx Payout Bot!\n\n` +
    `To get started, \n\n` +
    `type /login to authenticate with email.\n\n` +
    `type /google to authenticate using Google's OAuth.\n\n` +
    `type /signup if You don't have an Account Sign Up`
  );
});
*/ 

// Main menu
export const mainMenu =async (ctx : MySceneContext) =>{
  await ctx.reply(`👋 Welcome to Copperx Payout Bot!\n\n`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Profile", callback_data: "profile" },
          { text: "KYC Status", callback_data: "kyc" },
        ],
        [
          { text: "Wallets", callback_data: "wallets" },
          { text: "Balance", callback_data: "balance" },
        ],
        [
          { text: "Send Money", callback_data: "send" },
          { text: "Deposit", callback_data: "deposit" },
        ],
        [{ text: "Transactions", callback_data: "transactions" }],
        [{ text: "Logout", callback_data: "logout" }],
      ],
    },
  });
}
bot.start((ctx) => {
  const token = sessionManager.getToken(ctx)
          const isAuthenticated = ctx.session.isAuthenticated;
          if(token && isAuthenticated) {
           mainMenu(ctx)  
          }else{
              ctx.reply("You are not logged in. Type /login to access your account.")
          }

});

// Add other command handlers
bot.command("login", (ctx) => ctx.scene.enter("login"));
getUserProfile(bot, requireAuth);
checkAuthStatus(bot);

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply(
    "An error occurred while processing your request. Please try again later."
  );
});
// Inline keyboard buttons
bot.command("options", (ctx) => {
  ctx.reply("What would you like to do?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📊 View Statistics", callback_data: "stats" },
          { text: "⚙️ Settings", callback_data: "settings" },
        ],
        [{ text: "📞 Contact Support", callback_data: "support" }],
      ],
    },
  });
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
