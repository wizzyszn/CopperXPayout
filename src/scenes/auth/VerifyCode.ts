import { Scenes } from "telegraf";
import { MySceneContext, sessionManager } from "../../utils/sessionManager";
import { authenticateOtp } from "../../services/copperX.service";

const verifyCodeScene = new Scenes.BaseScene<MySceneContext>("verifyCodeScene");

verifyCodeScene.enter((ctx) => {
  ctx.reply("ℹ️ Please enter the verification code or type 'cancel' to exit:");
});

// Handle cancel command
verifyCodeScene.hears(["/cancel", "cancel"], (ctx) => {
  ctx.reply("❌ Verification process canceled");
  return ctx.scene.leave();
});

verifyCodeScene.on("text", async (ctx) => {
  const input = ctx.message.text.trim();

  // Handle non-numeric inputs
  if (!/^\d+$/.test(input)) {
    return ctx.reply(
      "⚠️ Please enter a valid numeric code or type 'cancel' to exit."
    );
  }

  const otp = Number(input);
  const sid = sessionManager.DecryptData<string>(ctx.session.sid as string);
  const email = ctx.session.email;

  if (!sid || !email) {
    ctx.reply("⚠️ Session data is missing. Please start the login process again.");
    return ctx.scene.leave();
  }

  try {
    await ctx.reply("♻️ Please wait while we verify your OTP...");

    const response = await authenticateOtp({
      otp,
      email: email as string,
      sid: sid as string,
    });
    //Securely Store authentication status
    if (response.accessToken) {
      sessionManager.setToken(ctx, response.accessToken);
      ctx.session.userInfo = response.user;
      ctx.replyWithHTML(
        `🎊 Login successful!\n\n🚀 Welcome to CopperX Bot, ${response.user.email}!\n\nI'm here to help you manage your CopperX account. Choose an option below:`,
        {
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
        }
      );
    } else {
      await ctx.reply("Authentication successful, but no token was provided.");
    }

    // Exit the scene after successful login
    return ctx.scene.leave();
  } catch (err) {
    console.error("❌ OTP validation error:", err);

    return ctx.reply(
      `⚠️ ${err}\n
      Please try again or type 'cancel' to exit.`
    );
  }
});

// Handle unexpected inputs
verifyCodeScene.on("message", (ctx) => {
  return ctx.reply(
    "⚠️ Please enter a valid verification code or type 'cancel' to exit."
  );
});

export default verifyCodeScene;
