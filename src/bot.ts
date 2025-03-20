import { Scenes, session, Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { MySceneContext, sessionManager } from "./utils/sessionManager";
import loginScene from "./scenes/auth/LoginWithCreds";
import verifyCodeScene from "./scenes/auth/VerifyCode";
import { rateLimiter, requireAuth } from "./middlewares/Auth";
import { checkAuthStatus } from "./commands/auth/AuthCommands";
import {
  logout,
  requestKYCstatus,
  requestUserProfile,
} from "./services/copperX.service";

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
// Main menu
export const mainMenu = async (ctx: MySceneContext) => {
  await ctx.editMessageText(`🏠 Main Menu - Choose an option:`, {
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
};
bot.start((ctx) => {
  const token = sessionManager.getToken(ctx);
  const isAuthenticated = ctx.session.isAuthenticated;
  if (token && isAuthenticated) {
    mainMenu(ctx);
  } else {
    ctx.reply(
      `Welcome to copper X Bot!\n You need to log in before you can use this bot. \n Press the button below to log in:`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Login", callback_data: "login" }]],
        },
      }
    );
  }
});

// Add other command or action handlers
// main menu
bot.action("back_to_menu", async (ctx) => {
  await ctx.answerCbQuery();
  await mainMenu(ctx);
});
// login
bot.action("login", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.scene.enter("login");
});
//profile
bot.action("profile", requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  const token = sessionManager.getToken(ctx);
  try {
    await ctx.reply("Requesting your Profile.......");
    const response = await requestUserProfile(token as string);
    ctx.replyWithHTML(
      `
      <b>Your CopperX Profile</b>\n
      <b>Personal Details</b>\n
       Email: ${response.email}\n
       User ID: ${response.id}\n
       Name : ${
         response.firstName && response.lastName
           ? `${response.firstName} ${response.lastName}`
           : "Not set"
       }\n\n
       KYC Status: ${
         response.status === "pending"
           ? "pending"
           : response.status === "active"
           ? "active"
           : "failed"
       }
      `,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Check KYC Status", callback_data: "kyc_status" },
              { text: "Manage Wallets", callback_data: "manage_wallet" },
            ],
            [{ text: "<< Back to Menu", callback_data: "back_to_menu" }],
          ],
        },
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("An error occurred while fetching your profile");
  }
});
// check kyc status
bot.action("kyc", requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("Checking your KYC status......");
  const token = sessionManager.getToken(ctx);
  try {
    const response = await requestKYCstatus(token as string);
    if (response.count < 1) {
      return ctx.replyWithHTML(
        `
      <b>KYC Verification Status</b>\n\n
      Current Status:  "PENDING"
      `,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Complete KYC status", url: "https://copperx.io" }],
              [
                {
                  text: "<< Back to Menu",
                  callback_data: "back_to_menu",
                },
              ],
            ],
          },
        }
      );
    } else {
      return ctx.replyWithHTML(
        `
      <b>KYC Verification Status</b>\n\n
      Current Status: "COMPLETED"
      `,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "<< Back to Menu", callback_data: "menu" }],
            ],
          },
        }
      );
    }
  } catch (err) {
    return ctx.reply(
      `An Error ocurred while requesting for your KYC status..... ${err}`
    );
  }
});
//logout
bot.action("logout", requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  const token = sessionManager.getToken(ctx);
  try {
    const response = await logout(token as string);
    ctx.reply(
      `
        You have successfully logged out from your Copper X account"
      `,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Log in again", callback_data: "log_in_again" }],
          ],
        },
      }
    );
    sessionManager.clearToken(ctx);
  } catch (err) {
    console.error(err);
    ctx.reply(
      `An error ocurred while we tried logging you out please try again later ${err}`
    );
  }
});
// session auth status
checkAuthStatus(bot);

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply(
    "An error occurred while processing your request. Please try again later."
  );
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
