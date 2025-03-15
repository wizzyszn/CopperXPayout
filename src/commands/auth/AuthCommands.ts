import { Telegraf } from "telegraf";
import { MySceneContext } from "../../utils/types";

export const loginCommand = (bot : Telegraf<MySceneContext>) =>{
    bot.command("login", (ctx) => {
        ctx.scene.enter("login")
    })
}