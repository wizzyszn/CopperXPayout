import { Scenes } from "telegraf";
import { MySceneContext, sessionManager } from "../../utils/sessionManager";
import { bot } from "../../bot";
import { addPayee } from "../../services/copperX.service";

const addPayeeScene = new Scenes.BaseScene<MySceneContext>("add_payee");

addPayeeScene.enter((ctx) =>{
    ctx.reply(`Add Payee\n\nPlease enter the payee's email address: `, {
        reply_markup : {
            inline_keyboard : [
                [{text : "Cancel", callback_data : "cancel_add_payee"}]
            ]
        }
    })
})
addPayeeScene.on("text", async (ctx) =>{
    const input = ctx.message.text.trim();
    const ValidateEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!ValidateEmail.test(input)) {
    return ctx.reply(
      "⚠️ Invalid email address. Please try again or type 'cancel' to exit."
    );
  }
})

addPayeeScene.on("text", async (ctx) =>{
    const input = ctx.message.text.trim();  
  
})
bot.action("cancel_add_payee", (ctx) =>{
    addPayeeScene.leave();
     ctx.reply("Process cancelled")
})
// Handle cancel command
addPayeeScene.hears(["/cancel", "cancel"], (ctx) => {
    ctx.reply("❌ Process canceled");
    return ctx.scene.leave();
  });
export default addPayeeScene;