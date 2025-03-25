"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setUpCommands;
const AuthCommands_1 = require("./auth/AuthCommands");
function setUpCommands(bot) {
    (0, AuthCommands_1.loginCommand)(bot);
    //general commands
    bot.command("help", (ctx) => {
        ctx.reply("Here's how to use this bot: ...");
    });
}
