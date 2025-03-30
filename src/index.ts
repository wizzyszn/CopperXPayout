import { Scenes, session, Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { MySceneContext, sessionManager } from "./utils/sessionManager";
import { requireAuth } from "./middlewares/Auth";
import { checkAuthStatus } from "./commands/auth/AuthCommands";
import {
  getAllPayees,
  getPayee,
  getWallets,
  logout,
  requestKYCstatus,
  requestUserProfile,
  setDefaultWallet,
  transactionHistoryReq,
  viewBalances,
} from "./services/copperX.service";
import { NetworkCoefficients, Networks, TransactionsInt } from "./utils/types";
import loginWizard from "./wizards/loginWizards";
import transferViaEmailWizard from "./wizards/TransferViaEmail";
import addPayeeWizard from "./wizards/AddPayee";

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
const stage = new Scenes.Stage<MySceneContext>([
  loginWizard,
  transferViaEmailWizard,
  addPayeeWizard,
]);

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
          { text: "📤 Send Money", callback_data: "send_money" },
          { text: "📥 Deposit", callback_data: "deposit_money" },
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
// Handle login via inline button
bot.action("login", async (ctx) => {
  try {
    await ctx.answerCbQuery("Starting login process...", { show_alert: false });
    if (ctx.session.isAuthenticated) {
      await ctx.reply("You’re already logged in!");
      return;
    }
    await ctx.scene.enter("loginWizard");
  } catch (err) {
    console.error("Error entering loginWizard from action:", err);
    await ctx.reply("❌ Something went wrong. Please try again.");
  }
});

// Handle login via command
bot.command("login", async (ctx) => {
  try {
    if (ctx.session.isAuthenticated) {
      await ctx.reply("You’re already logged in!");
      return;
    }
    await ctx.scene.enter("loginWizard");
  } catch (err) {
    console.error("Error entering loginWizard from command:", err);
    await ctx.reply("❌ Something went wrong. Please try again.");
  }
});
//profile
bot.action("profile", requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  const token = sessionManager.getToken(ctx);
  try {
    await ctx.reply("♻️ Requesting your Profile.......");
    const response = await requestUserProfile(token as string);
    ctx.replyWithHTML(
      `<b>👤 Your CopperX Profile</b>\n\n<b>Personal Details:</b>\n📧 Email: ${
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
              { text: "📖 Check KYC Status", callback_data: "kyc" },
              { text: "🛅 Manage Wallets", callback_data: "wallets" },
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
      <b>📖 KYC Verification Status</b>\n\nCurrent Status:  "🟡 PENDING\nYou need to complete your KYC verification on the Copperx platform to unlock all features of your account."
      `,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📖 Complete KYC", url: "https://copperx.io" }],
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
bot.action("list_wallets", requireAuth, async (ctx) => {
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
//set default wallet
bot.action(/select_wallet:(.+)/, requireAuth, async (ctx) => {
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
bot.action("view_balances", requireAuth, async (ctx) => {
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
//Get transactions
bot.action("transactions", async (ctx) => {
  await ctx.answerCbQuery();
  const generateHistoryText = (history: TransactionsInt): string => {
    const { data, count, page, limit } = history;

    let text = `📋 *Transaction History*\n`;
    text += `Showing ${Math.min(
      data.length,
      limit
    )} of ${count} transactions\n\n`;

    data.forEach((item, index) => {
      // Transaction header with type and status
      text += `*${index + 1}. ${item.type.toUpperCase()} - ${item.status}*\n`;

      // Date
      const date = new Date(item.createdAt).toLocaleDateString();
      text += `📅 Date: ${date}\n`;

      // Amount and currency
      text += `💰 Amount: ${item.amount} ${item.currency}\n`;

      // Fees if applicable
      if (item.totalFee && parseFloat(item.totalFee) > 0) {
        text += `💸 Fee: ${item.totalFee} ${item.feeCurrency}\n`;
      }

      // Source/destination details
      if (item.sourceAccount) {
        text += `📤 From: ${
          item.sourceAccount.payeeDisplayName || "Unknown"
        }\n`;
      }

      if (item.destinationAccount) {
        text += `📥 To: ${
          item.destinationAccount.payeeDisplayName || "Unknown"
        }\n`;
      }

      // Transaction ID
      text += `🔢 ID: ${item.id.substring(0, 8)}...\n`;

      // Add separator between transactions
      text += `\n${index < data.length - 1 ? "───────────────────\n\n" : ""}`;
    });

    // Pagination info
    if (count > limit) {
      text += `\nPage ${page} of ${Math.ceil(count / limit)}`;
    }

    return text;
  };
  try {
    const token = sessionManager.getToken(ctx);
    await ctx.reply("🔃 Fetching your transaction history.....");
    const response = await transactionHistoryReq(token as string);
    const history = response.data;
    if (history.length < 1) {
      return ctx.reply(
        `❌ No transation found. Start by sending or receiving USDC.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "💰 Check Balance", callback_data: "view_balances" }],
              [{ text: "📤 Send USDC", callback_data: "send_usdc" }],
            ],
          },
        }
      );
    } else {
      const text = generateHistoryText(response);
      return ctx.reply(text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "◀️ Previous",
                callback_data: `history_${Math.max(1, response.page - 1)}`,
              },
              {
                text: "Next ▶️",
                callback_data: `history_${response.page + 1}`,
              },
            ],
            [
              { text: "Check Balance", callback_data: "view_balances" },
              { text: "📤 Send USDC", callback_data: "send_usdc" },
            ],
          ],
        },
      });
    }
  } catch (err) {
    console.error(err);
    ctx.reply(
      `An Error occured while trying to fetch your transaction history\n${err}`
    );
  }
});
bot.action("send_money", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.editMessageText(
    `📤 Send Money
\n👇 Choose how you'd like to send funds:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Send to Email", callback_data: "send_via_email" }],
          [{ text: "Send to Wallet", callback_data: "send_to_wallet" }],
          [{ text: "Bank Withdraw", callback_data: "bank_withdraw" }],
          [{ text: "<< Back to Menu", callback_data: "back_to_menu" }],
        ],
      },
    }
  );
});

bot.action("send_via_email", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("Fetching your payees...");
  try {
    const token = sessionManager.getToken(ctx);
    const response = await getAllPayees(token as string);
    const payees = response.data;
    if (payees.length < 1) {
      return ctx.replyWithHTML(
        `<b>📭 No Payees Found
</b>\nYou need to add a payee before sending USDC via email. Use /addpayee to add one now.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Add Payee", callback_data: "add_payee" }],
            ],
          },
        }
      );
    } else {
      const payeeBtns = payees.map((payee) => {
        return [
          {
            text: `${payee.displayName} (${payee.email})`,
            callback_data: `payee_id:${payee.id}`,
          },
        ];
      });
      return ctx.reply(
        "Send USDC via Email\n\nChoose a payee to send USDC to:",
        {
          reply_markup: {
            inline_keyboard: [...payeeBtns],
          },
        }
      );
    }
  } catch (err) {
    console.error(err);
    ctx.reply(`Something went wrong while fetching your payees.... ${err}`);
  }
});
//send to a payee via email
bot.action(/payee_id:(.+)/, requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  const payeeId = ctx.match[1];
  ctx.scene.enter("tf_via_email",{payeeId});

});
// Add a payee
bot.action("add_payee", requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  // Command to start the wizard
  bot.command("addpayee", (ctx) => ctx.scene.enter("addpayee"));

  // Handle addpayee action
  bot.action("cancel_add_payee", async (ctx) => {
    await ctx.reply("Add payee cancelled");
    return ctx.scene.leave();
  });
  // Handle cancel send via email op
  bot.action("cancel_send_via_email", async (ctx) => {
    await ctx.reply("Send Via Email Cancelled");
    return ctx.scene.leave();
  });

  // Handle Back buttons
  const backActions: { [key: string]: number } = {
    back_to_nickname: 0, // Step 1: Nickname
    back_to_email: 2, // Step 3: Email
    back_to_firstname: 4, // Step 5: First Name
    back_to_lastname: 6, // Step 7: Last Name
    back_to_phonenumber: 8, // Step 9: Phone Number
    back_to_country: 10, // Step 11: Country
    back_to_bankname: 12, // Step 13: Bank Name
    back_to_bankaddress: 14, // Step 15: Bank Address
    back_to_type: 16, // Step 17: Type
    back_to_bankaccounttype: 18, // Step 19: Bank Account Type
    back_to_routingnumber: 20, // Step 21: Routing Number
    back_to_accountnumber: 22, // Step 23: Account Number
    back_to_beneficiaryname: 24, // Step 25: Beneficiary Name
    back_to_beneficiaryaddress: 26, // Step 27: Beneficiary Address
    back_to_swiftcode: 28, // Step 29: SWIFT Code
  };

  Object.keys(backActions).forEach((action) => {
    bot.action(action, async (ctx) => {
      await ctx.answerCbQuery("Going back...");
      return ctx.wizard.selectStep(backActions[action]);
    });
  });
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
