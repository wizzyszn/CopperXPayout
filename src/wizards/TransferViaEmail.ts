import { Scenes } from "telegraf";
import {
  MySceneContext,
  SceneState,
  sessionManager,
} from "../utils/sessionManager";
import { getPayee } from "../services/copperX.service";

const transferViaEmailWizard = new Scenes.WizardScene<MySceneContext>(
  "tf_via_email",
  // step 1
  async (ctx) => {
    const state = ctx.scene.state as SceneState;
    const payeeId = state.payeeId;
    if (!payeeId) {
      ctx.reply("Error: No payee ID provided.");
      return ctx.scene.leave();
    }
    try {
      const token = sessionManager.getToken(ctx) as string;

      const response = getPayee(token, payeeId as string);
      ctx.replyWithHTML(
        `Send USDC via Email\n\nEmail:${
          (await response).email
        }\n\nPlease enter the amount in USDC:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Cancel", callback_data: "cancel_send_via_email" }],
            ],
          },
        }
      );
    } catch (err) {
      console.error(err);
      ctx.reply(
        `Somehting went wrong while trying to send funds via Email..... ${err}`
      );
    }
    ctx.wizard.next();
  },
  //step 2  Collect amount to be sent
  async (ctx) => {
    if (!ctx.message ||!("text" in ctx.message)) {
      await ctx.reply("⚠️ Please enter a valid numeric code or type 'cancel' to exit.");
      return; // Stay in this step;
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
    const amount = Number(input);
  }
);

export default transferViaEmailWizard;
