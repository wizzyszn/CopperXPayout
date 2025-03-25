"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = infoCommands;
function infoCommands(bot) {
    bot.command("status", (ctx) => {
        const status = ctx.session.isAuthenticated;
        if (status) {
            ctx.reply(`You are logged in as ${ctx.session.userInfo?.email}`);
        }
        else {
            ctx.reply("You are not logged in. Use /login to authenticate.");
        }
        bot.command("about", (ctx) => {
            ctx.reply("CopperX Payout Bot helps you manage payments easily from Telegram.");
        });
    });
}
