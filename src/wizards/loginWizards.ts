import { Scenes } from "telegraf";
import { MySceneContext, sessionManager } from "../utils/sessionManager";
import { requestOtp, authenticateOtp } from "../services/copperX.service";

// Define the Wizard Scene with a custom context
const loginWizard = new Scenes.WizardScene<MySceneContext>(
  "loginWizard", 
  // Step 0: Email input
  async (ctx) => {
    await ctx.reply("ℹ️ Please enter your email address or type 'cancel' to exit.");
    return ctx.wizard.next(); 
  },
  // Step 1: Handle email input and request OTP
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("⚠️ Please enter a valid email address or type 'cancel' to exit.");
      return; 
    }

    const input = ctx.message.text.trim();
    if (input.toLowerCase() === "cancel") {
      await ctx.reply("Login process canceled");
      return ctx.scene.leave();
    }

    const ValidateEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!ValidateEmail.test(input)) {
      await ctx.reply("⚠️ Invalid email address. Please try again or type 'cancel' to exit.");
      return; // Stay in this step
    }

    ctx.session.email = input; // Store email in session
    try {
      await ctx.reply("♻️ Please wait while we process your request....");
      const response = await requestOtp(input);
      if (!response.sid) {
        await ctx.reply("❌ Failed to generate verification code. Please try again later.");
        return ctx.scene.leave();
      }

      ctx.session.sid = sessionManager.EncryptData(response.sid); // Encrypt and store SID
      await ctx.reply(
        "ℹ️ If this email is valid and active, you will receive a verification code (OTP). Please enter it now:"
      );
      return ctx.wizard.next(); // Move to OTP verification step
    } catch (err) {
      console.error("OTP Request Error:", err);
      await ctx.reply("❌ An error occurred. Please try again later.");
      return ctx.scene.leave();
    }
  },
  // Step 2: Handle OTP input and authenticate
  async (ctx) => {
    if (!ctx.message ||!("text" in ctx.message)) {
      await ctx.reply("⚠️ Please enter a valid numeric code or type 'cancel' to exit.");
      return; // Stay in this step
    }

    const input = ctx.message.text.trim();
    if (input.toLowerCase() === "cancel") {
      await ctx.reply("❌ Verification process canceled");
      return ctx.scene.leave();
    }

    if (!/^\d+$/.test(input)) {
      await ctx.reply("⚠️ Please enter a valid numeric code or type 'cancel' to exit.");
      return; // Stay in this step
    }

    const otp = Number(input);
    const sid = sessionManager.DecryptData<string>(ctx.session.sid as string);
    const email = ctx.session.email;

    if (!sid || !email) {
      await ctx.reply("⚠️ Session data is missing. Please start the login process again.");
      return ctx.scene.leave();
    }

    try {
      await ctx.reply("♻️ Please wait while we verify your OTP...");
      const response = await authenticateOtp({ otp, email, sid });

      if (response.accessToken) {
        sessionManager.setToken(ctx, response.accessToken);
        ctx.session.userInfo = response.user;
        await ctx.replyWithHTML(
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
      return ctx.scene.leave(); // Exit after success
    } catch (err) {
      console.error("❌ OTP validation error:", err);
      await ctx.reply(`⚠️ ${err}\nPlease try again or type 'cancel' to exit.`);
      return; // Stay in this step to retry
    }
  }
);

export default loginWizard;