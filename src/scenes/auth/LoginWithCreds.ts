import { Scenes } from "telegraf";
import { MySceneContext } from "../../utils/types";
import { requestOtp } from "../../services/copperX.service";

const loginScene = new Scenes.BaseScene<MySceneContext>("login");

loginScene.enter((ctx) => {
  ctx.reply("Please enter your email address or type 'cancel' to 'exit");
});
// Handle cancel command
loginScene.hears(["/cancel", "cancel"], (ctx) => {
  ctx.reply("Login process canceled");
  return ctx.scene.leave();
});
loginScene.on("text", async (ctx) => {
  ctx.session.email = ctx.message.text.trim();
  const ValidateEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!ValidateEmail.test(ctx.session.email)) {
    return ctx.reply(
      "Invalid email address. Please try again or type 'cancel' to exit."
    );
  }
  try {
    await ctx.reply("Please wait while we process your request....");
    const response = await requestOtp(ctx.message.text);
    //console.log("response",response);
    if (!response.sid) {
      return ctx.reply(
        "Failed to generate verification code. Please try again later."
      );
    }
    ctx.session.sid = response.sid;
    await ctx.reply(
      "If this email is liked to our platform, you will get to a verification code (otp)"
    );

    ctx.scene.enter("verifyCodeScene");
  } catch (err) {
    console.error("OTP Request Error:", err);
    return ctx.reply(
      "An error occurred while processing your request. Please try again later."
    );
  }
});

// Handle unexpected inputs - moved to top to ensure it doesn't override text handler
loginScene.on("message", (ctx) => {
  return ctx.reply(
    "Please enter a valid email address or type 'cancel' to exit."
  );
});

export default loginScene;
