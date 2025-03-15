import { Scenes } from "telegraf";
import { MySceneContext } from "../../utils/types";
import { authenticateOtp } from "../../services/copperX.service";

const verifyCodeScene = new Scenes.BaseScene<MySceneContext>("verifyCodeScene");

verifyCodeScene.enter((ctx) => {
  ctx.reply("Please enter the verification code or type 'cancel' to exit:");
});

// Handle cancel command
verifyCodeScene.hears(["/cancel", "cancel"], (ctx) => {
  ctx.reply("Verification process canceled");
  return ctx.scene.leave();
});

verifyCodeScene.on("text", async (ctx) => {
  const input = ctx.message.text.trim();
  
  // Handle non-numeric inputs
  if (!/^\d+$/.test(input)) {
    return ctx.reply("Please enter a valid numeric code or type 'cancel' to exit.");
  }
  
  const otp = Number(input);
  const sid = ctx.session.sid;
  const email = ctx.session.email;
  
  if (!sid || !email) {
    ctx.reply("Session data is missing. Please start the login process again.");
    return ctx.scene.leave();
  }
  
  try {
    await ctx.reply("Please wait while we verify your OTP...");
    
    const response = await authenticateOtp({
      otp,
      email: email as string,
      sid: sid as string,
    });
    //console.log(response);
    await ctx.reply("Successfully logged in!");
    
    // Store authentication status
    ctx.session.isAuthenticated = true;
    ctx.session.token = response.accessToken;
    ctx.session.userInfo = response.user;

    // Exit the scene after successful login
    return ctx.scene.leave();
    
  } catch (err) {
    console.error("OTP validation error:", err);
    
    return ctx.reply(
      "An error occurred while validating your OTP. Please try again or type 'cancel' to exit."
    );
  }
});

// Handle unexpected inputs
verifyCodeScene.on("message", (ctx) => {
  return ctx.reply("Please enter a valid verification code or type 'cancel' to exit.");
});

export default verifyCodeScene;