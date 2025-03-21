import { Scenes, session, Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { MySceneContext, sessionManager } from "./utils/sessionManager";
import loginScene from "./scenes/auth/LoginWithCreds";
import verifyCodeScene from "./scenes/auth/VerifyCode";
import { requireAuth } from "./middlewares/Auth";
import { checkAuthStatus } from "./commands/auth/AuthCommands";
import {
  getWallets,
  logout,
  requestKYCstatus,
  requestUserProfile,
  setDefaultWallet,
  viewBalances,
} from "./services/copperX.service";
import { NetworkCoefficients, Networks } from "./utils/types";

// Load environment variables first
dotenv.config();

// Validate required environment variables
const BotToken = process.env.TELEGRAM_BOT_TOKEN;
if (!BotToken) {
  console.error(
    "ERROR: TELEGRAM_BOT_TOKEN is not set in environment variables!"
  );
  process.exit(1); //the fuck is even process ??
}

// Instantiate Bot
export const bot = new Telegraf<MySceneContext>(BotToken);

// Register Scenes
const stage = new Scenes.Stage<MySceneContext>([loginScene, verifyCodeScene]);

// Configure middleware
bot.use(session());
bot.use(stage.middleware());

// Command handlers
// Main menu
export const mainMenu = async (ctx: MySceneContext) => {
  await ctx.editMessageText(`🏠 Main Menu - Choose an option:`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "👤 Profile", callback_data: "profile" },
          { text: "📝 KYC Status", callback_data: "kyc" },
        ],
        [
          { text: "🛅 Wallets", callback_data: "wallets" },
          { text: "💰 Balance", callback_data: "view_balances" },
        ],
        [
          { text: "📤 Send Money", callback_data: "send" },
          { text: "📥 Deposit", callback_data: "deposit" },
        ],
        [{ text: "📒 Transactions", callback_data: "transactions" }],
        [{ text: "🔒 Logout", callback_data: "logout" }],
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
      `🚀 Welcome to copper X Bot!\n\nℹ️ You need to log in before you can use this bot. \n\n👇 Press the button below to log in:`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "🗝️ Login", callback_data: "login" }]],
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
      `<b>👤 Your CopperX Profile</b>\n\n<b>Personal Details</b>\n📧 Email: ${
        response.email
      }\n🆔 User ID: ${response.id}\n👤Name : ${
        response.firstName && response.lastName
          ? `${response.firstName} ${response.lastName}`
          : "Not set"
      }\n\n📖KYC Status: ${
        response.status === "pending"
          ? "🟡 pending"
          : response.status === "active"
          ? "🟢 active"
          : "🔴 failed"
      }
      `,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📖 Check KYC Status", callback_data: "kyc_status" },
              { text: "🛅 Manage Wallets", callback_data: "manage_wallet" },
            ],
            [{ text: "<< Back to Menu", callback_data: "back_to_menu" }],
          ],
        },
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ An error occurred while fetching your profile");
  }
});
// check kyc status
bot.action("kyc", requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("♻️ Checking your KYC status......");
  const token = sessionManager.getToken(ctx);
  try {
    const response = await requestKYCstatus(token as string);
    if (response.count < 1) {
      return ctx.replyWithHTML(
        `
      <b>📖 KYC Verification Status</b>\n\nCurrent Status:  "🟡 PENDING"
      `,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📖 Complete KYC status", url: "https://copperx.io" }],
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
      <b>📖 KYC Verification Status</b>\n\n
      Current Status: "🟢 COMPLETED"
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
      `❌ An Error ocurred while requesting for your KYC status..... ${err}`
    );
  }
});
// Get Wallets with details
const chainIds: Record<NetworkCoefficients, Networks> = {
  "137": "Polygon",
  "42161": "Arbitrum",
  "8453": "Base",
  "23434": "Mode",
  "534352": "Starknet",
};
bot.action("wallets", requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🔃 Fetching your wallets....");
  const token = sessionManager.getToken(ctx);
  try {
    const wallets = await getWallets(token as string);
    let text = ``;
    const walletData: {
      walletType: string;
      walletId: string;
      isDefault: boolean;
      network: Networks;
    }[] = [];
    wallets.length > 0 &&
      wallets.forEach((wallet) => {
        walletData.push({
          walletId: wallet.id,
          walletType: wallet.walletType,
          isDefault: wallet.isDefault,
          network: chainIds[wallet.network],
        });
        text += `<b>${
          wallet.isDefault ? "✅ Default Wallet" : "💵 Wallet"
        }</b> (<i>${chainIds[wallet.network]}</i>)\n<code>${
          wallet.walletAddress
        }</code>\n\ \n`;
      });
    ctx.session.walletData = walletData;
    ctx.replyWithHTML("<b>💳Your Wallets</b>\n\n" + text, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚙️ Set Default", callback_data: "list_wallets" },
            { text: "💰 View Balances", callback_data: "view_balances" },
          ],
          [{ text: "<< Back to menu", callback_data: "back_to_menu" }],
        ],
      },
    });
  } catch (err) {
    console.error(err);
    ctx.reply(
      `❌ Something went wrong while trying to fetch your wallets..... ${err}`
    );
  }
});
bot.action("list_wallets", async (ctx) => {
  await ctx.answerCbQuery();
  const walletData = ctx.session.walletData;
  if (!walletData || walletData.length < 1) {
    return ctx.reply(
      "❌ No wallet data available. Please fetch your wallets first."
    );
  }
  await ctx.reply("🔃 Fetching your wallets....");
  const walletButtons = walletData.map((wallet) => {
    return [
      {
        text: `${wallet.isDefault ? "✅ " : ""}${wallet.network}`,
        callback_data: `select_wallet:${wallet.walletId}`,
      },
    ];
  });
  ctx.replyWithHTML(
    `<b>📁 Set Default Wallet</b>\nChoose a wallet to set as default:`,
    {
      reply_markup: {
        inline_keyboard: [
          ...walletButtons,
          [{ text: "<< Back to Menu", callback_data: "back_to_menu" }],
        ],
      },
    }
  );
});
//set default wallets
bot.action(/select_wallet:(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const walletId = ctx.match[1];
  try {
    const token = sessionManager.getToken(ctx);
    await ctx.reply("🔃 Setting default wallet....");
    const response = await setDefaultWallet(walletId, token as string);
    ctx.replyWithHTML(
      `<b>✅ Default Wallet Updated</b>\nNew default wallet: ${response.walletType}\nAddress: <code>${response.walletAddress}</code>`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Check Balances",
                callback_data: "check_balances",
              },
            ],
            [
              {
                text: "Set Another Default",
                callback_data: "list_wallets",
              },
            ],
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
  } catch (err) {
    console.error(err);
    ctx.reply(
      `❌ An Error Occured when trying to set up your default wallet ${err}`
    );
  }
});
// View Balances
bot.action("view_balances", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🔃 Fetching wallet balances....");
  try {
    const token = sessionManager.getToken(ctx);
    const wallets = await viewBalances(token as string);
    let text = ``;
    wallets.length > 0 &&
      wallets.forEach((wallet) => {
        const balance = wallet.balances.map((balance) => balance.balance)[0];
        const symbol = wallet.balances.map((balance) => balance.symbol)[0];
        const address = wallet.balances.map((balance) => balance.address)[0];
        text += `<b>${
          wallet.isDefault ? "✅ Default Wallet" : "💵 Wallet"
        }</b> (<i>${
          chainIds[wallet.network]
        }</i>)\n${symbol}: ${balance}\n<code>${address}</code>\n\ \n`;
      });
    ctx.replyWithHTML("<b>💰 Your Wallets Balance</b>\n\n" + text, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📩 Deposit", callback_data: "deposit" },
            { text: "⚙️ Set Default", callback_data: "list_wallets" },
          ],
          [{ text: "<< Back to menu", callback_data: "back_to_menu" }],
        ],
      },
    });
  } catch (err) {
    ctx.reply(
      `❌ An error occured while trying to balances for your wallets... ${err}`
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
        🎊 You have successfully logged out from your Copper X account"
      `,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Log in again", callback_data: "login" }]],
        },
      }
    );
    sessionManager.clearToken(ctx);
  } catch (err) {
    console.error(err);
    ctx.reply(
      `❌ An error ocurred while we tried logging you out please try again later ${err}`
    );
  }
});
// session auth status
checkAuthStatus(bot);

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply(
    "❌ An error occurred while processing your request. Please try again later."
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
