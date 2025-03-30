import { Scenes } from "telegraf";
import { MySceneContext, SceneState } from "../utils/sessionManager";

const transferViaEmailWizard = new Scenes.WizardScene<MySceneContext>(
  "tf_via_email",
  // step 1
  async (ctx) => {
    const state = ctx.scene.state as SceneState;
    const payeeId = state.payeeId;
    console.log(payeeId)
  if (!payeeId) {
    ctx.reply("Error: No payee ID provided.");
    return ctx.scene.leave(); // Exit scene if missing
  }
  await ctx.replyWithHTML(
      `Send USDC via Email\n\nEmail: \n\nPlease enter the amount in USDC:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Cancel", callback_data: "cancel_send_via_email" }],
          ],
        },
      }
    );
    ctx.wizard.next();
  },
  //step 2  Collect amount to be sent
  async (ctx) =>{

  }
);

export default transferViaEmailWizard;
