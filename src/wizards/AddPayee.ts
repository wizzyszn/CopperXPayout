import { MySceneContext, sessionManager } from "../utils/sessionManager";
import { addPayee } from "../services/copperX.service";
import { cancelOperation } from "../utils/helpers";
import { Scenes } from "telegraf";

// Define the WizardScene
const addPayeeWizard = new Scenes.WizardScene<MySceneContext>(
  "addpayee",
  // Step 1: Collect Nickname (optional)
  async (ctx) => {
    ctx.reply(
      "Add Payee\n\nPlease enter the payee's nickname (optional, press Enter to skip):",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 2: Handle Nickname
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      ctx.wizard.state.payee = ctx.wizard.state.payee || {};
      ctx.wizard.state.payee.nickName = ""; // Optional, defaults to empty
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
await cancelOperation(ctx, input, "Add payee cancelled");
    ctx.wizard.state.payee = ctx.wizard.state.payee || {};
    ctx.wizard.state.payee.nickName = input || ""; // Optional
    return ctx.wizard.next();
  },
  // Step 3: Collect Email
  async (ctx) => {
    await ctx.reply("Please enter the payee's email address:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_nickname" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 4: Handle Email
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply(
        "⚠️ Please enter a valid email address or type 'cancel' to exit."
      );
      return;
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    const ValidateEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!ValidateEmail.test(input)) {
      await ctx.reply(
        "⚠️ Invalid email address. Please try again or type 'cancel' to exit."
      );
      return;
    }
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.email = input;
    return ctx.wizard.next();
  },
  // Step 5: Collect First Name
  async (ctx) => {
    await ctx.reply("Please enter the payee's first name:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_email" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 6: Handle First Name
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply(
        "⚠️ Please enter the first name or type 'cancel' to exit."
      );
      return;
    }
    const input = ctx.message.text.trim();
    if (input === "") {
      await ctx.reply("⚠️ First name cannot be empty. Please try again.");
      return;
    }
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.firstName = input;
    return ctx.wizard.next();
  },
  // Step 7: Collect Last Name
  async (ctx) => {
    await ctx.reply("Please enter the payee's last name:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_firstname" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 8: Handle Last Name
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply(
        "⚠️ Please enter the last name or type 'cancel' to exit."
      );
      return;
    }
    const input = ctx.message.text.trim();
    if (input === "") {
      await ctx.reply("⚠️ Last name cannot be empty. Please try again.");
      return;
    }
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.lastName = input;
    return ctx.wizard.next();
  },
  // Step 9: Collect Phone Number (optional)
  async (ctx) => {
    await ctx.reply(
      "Please enter the payee's phone number (optional, press Enter to skip):",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back", callback_data: "back_to_lastname" }],
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 10: Handle Phone Number
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.phoneNumber = ""; // Optional, defaults to empty
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.phoneNumber = input || ""; // Optional
    return ctx.wizard.next();
  },
  // Step 11: Collect Country
  async (ctx) => {
    await ctx.reply(
      "Please enter the payee's country (optional, e.g., 'usa'):",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back", callback_data: "back_to_phonenumber" }],
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 12: Handle Country
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.country = "usa"; // Optional, defaults to "usa"
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.country = input || "usa";
    return ctx.wizard.next();
  },
  // Step 13: Collect Bank Name
  async (ctx) => {
    await ctx.reply("Please enter the bank name (optional):", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_country" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 14: Handle Bank Name
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.bankName = ""; // Optional
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.bankName = input || "";
    return ctx.wizard.next();
  },
  // Step 15: Collect Bank Address
  async (ctx) => {
    await ctx.reply("Please enter the bank address (optional):", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_bankname" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 16: Handle Bank Address
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.bankAddress = ""; // Optional
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.bankAddress = input || "";
    return ctx.wizard.next();
  },
  // Step 17: Collect Type
  async (ctx) => {
    await ctx.reply(
      "Please enter the account type (optional, e.g., 'web3_wallet'):",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back", callback_data: "back_to_bankaddress" }],
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 18: Handle Type
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.type = "web3_wallet"; // Optional, default
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.type = input || "web3_wallet";
    return ctx.wizard.next();
  },
  // Step 19: Collect Bank Account Type
  async (ctx) => {
    await ctx.reply(
      "Please enter the bank account type (optional, e.g., 'savings'):",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back", callback_data: "back_to_type" }],
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 20: Handle Bank Account Type
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.bankAccountType = "savings"; // Optional, default
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.bankAccountType = input || "savings";
    return ctx.wizard.next();
  },
  // Step 21: Collect Bank Routing Number
  async (ctx) => {
    await ctx.reply(
      "Please enter the bank routing number (optional, 9 digits):",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back", callback_data: "back_to_bankaccounttype" }],
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 22: Handle Bank Routing Number
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.bankRoutingNumber = ""; // Optional
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (input && !/^\d{9}$/.test(input)) {
      await ctx.reply(
        "⚠️ Routing number must be 9 digits if provided. Please try again."
      );
      return;
    }
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.bankRoutingNumber = input || "";
    return ctx.wizard.next();
  },
  // Step 23: Collect Bank Account Number
  async (ctx) => {
    await ctx.reply("Please enter the bank account number (optional):", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_routingnumber" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 24: Handle Bank Account Number
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.bankAccountNumber = ""; // Optional
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.bankAccountNumber = input || "";
    return ctx.wizard.next();
  },
  // Step 25: Collect Bank Beneficiary Name
  async (ctx) => {
    await ctx.reply("Please enter the bank beneficiary name (optional):", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_accountnumber" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 26: Handle Bank Beneficiary Name
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.bankBeneficiaryName = ""; // Optional
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.bankBeneficiaryName = input || "";
    return ctx.wizard.next();
  },
  // Step 27: Collect Bank Beneficiary Address
  async (ctx) => {
    await ctx.reply("Please enter the bank beneficiary address (optional):", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "back_to_beneficiaryname" }],
          [{ text: "Cancel", callback_data: "cancel_add_payee" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 28: Handle Bank Beneficiary Address
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.bankBeneficiaryAddress = ""; // Optional
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.bankBeneficiaryAddress = input || "";
    return ctx.wizard.next();
  },
  // Step 29: Collect SWIFT Code
  async (ctx) => {
    await ctx.reply(
      "Please enter the SWIFT code (optional, 8-11 characters):",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back", callback_data: "back_to_beneficiaryaddress" }],
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 30: Handle SWIFT Code
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      if (!ctx.wizard.state.payee) return;
      ctx.wizard.state.payee.swiftCode = ""; // Optional
      return ctx.wizard.next();
    }
    const input = ctx.message.text.trim();
    await cancelOperation(ctx, input, "Add payee cancelled");
    if (input && !/^[A-Z0-9]{8,11}$/.test(input)) {
      await ctx.reply(
        "⚠️ SWIFT code must be 8-11 alphanumeric characters if provided. Please try again."
      );
      return;
    }
    if (!ctx.wizard.state.payee) return;
    ctx.wizard.state.payee.swiftCode = input || "";
    return ctx.wizard.next();
  },
  // Step 31: Confirmation
  async (ctx) => {
    const payee = ctx.wizard.state.payee;
    await ctx.reply(
      `Please confirm the payee details:\n\n` +
        `Nickname: ${payee?.nickName || "Not provided"}\n` +
        `Email: ${payee?.email}\n` +
        `First Name: ${payee?.firstName}\n` +
        `Last Name: ${payee?.lastName}\n` +
        `Phone Number: ${payee?.phoneNumber || "Not provided"}\n` +
        `Country: ${payee?.country || "Not provided"}\n` +
        `Bank Name: ${payee?.bankName || "Not provided"}\n` +
        `Bank Address: ${payee?.bankAddress || "Not provided"}\n` +
        `Type: ${payee?.type || "Not provided"}\n` +
        `Bank Account Type: ${payee?.bankAccountType || "Not provided"}\n` +
        `Routing Number: ${payee?.bankRoutingNumber || "Not provided"}\n` +
        `Account Number: ${payee?.bankAccountNumber || "Not provided"}\n` +
        `Beneficiary Name: ${payee?.bankBeneficiaryName || "Not provided"}\n` +
        `Beneficiary Address: ${
          payee?.bankBeneficiaryAddress || "Not provided"
        }\n` +
        `SWIFT Code: ${payee?.swiftCode || "Not provided"}\n\n` +
        `Type 'yes' to save, 'no' to cancel, or 'edit' to change details.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back", callback_data: "back_to_swiftcode" }],
            [{ text: "Cancel", callback_data: "cancel_add_payee" }],
          ],
        },
      }
    );
    return ctx.wizard.next();
  },
  // Step 32: Handle Confirmation
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("⚠️ Please type 'yes', 'no', or 'edit'.");
      return;
    }
    const input = ctx.message.text.trim().toLowerCase();
    if (input === "yes") {
      const payee = ctx.wizard.state.payee;
      try {
        const token = sessionManager.getToken(ctx);
        const response = await addPayee(token as string, {
          nickName: payee?.nickName || "",
          firstName: payee?.firstName || "",
          lastName: payee?.lastName || "",
          email: payee?.email || "",
          phoneNumber: payee?.phoneNumber || "",
          bankAccount: {
            country: payee?.country || "",
            bankName: payee?.bankName || "",
            bankAddress: payee?.bankAddress || "",
            type: (payee?.type as "web3_wallet") || "web3_wallet",
            bankAccountType:
              (payee?.bankAccountType as "savings" | "checking") || "savings",
            bankRoutingNumber: payee?.bankRoutingNumber || "",
            bankAccountNumber: payee?.bankAccountNumber || "",
            bankBeneficiaryName: payee?.bankBeneficiaryName || "",
            bankBeneficiaryAddress: payee?.bankBeneficiaryAddress || "",
            swiftCode: payee?.swiftCode || "",
          },
        });
        await ctx.reply("Payee added successfully!");
      } catch (err) {
        await ctx.reply(`Something went wrong while adding the payee: ${err}`);
      }
      return ctx.scene.leave();
    } else if (input === "no") {
      await ctx.reply("Add payee cancelled.");
      return ctx.scene.leave();
    } else if (input === "edit") {
      await ctx.reply(
        "Which field would you like to edit? Please enter the field name (e.g., 'email'):"
      );
      return ctx.wizard.next();
    } else {
      await ctx.reply(
        "⚠️ Invalid response. Please type 'yes', 'no', or 'edit'."
      );
      return;
    }
  },
  // Step 33: Handle Edit Request
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply(
        "⚠️ Please enter the field name to edit (e.g., 'email')."
      );
      return;
    }
    const field = ctx.message.text.trim().toLowerCase();
    const validFields = [
      "nickname",
      "email",
      "firstname",
      "lastname",
      "phonenumber",
      "country",
      "bankname",
      "bankaddress",
      "type",
      "bankaccounttype",
      "bankroutingnumber",
      "bankaccountnumber",
      "bankbeneficiaryname",
      "bankbeneficiaryaddress",
      "swiftcode",
    ];
    if (!validFields.includes(field)) {
      await ctx.reply(
        `⚠️ Invalid field. Valid options: ${validFields.join(", ")}`
      );
      return;
    }
    const stepMap: { [key: string]: number } = {
      nickname: 0,
      email: 2,
      firstname: 4,
      lastname: 6,
      phonenumber: 8,
      country: 10,
      bankname: 12,
      bankaddress: 14,
      type: 16,
      bankaccounttype: 18,
      bankroutingnumber: 20,
      bankaccountnumber: 22,
      bankbeneficiaryname: 24,
      bankbeneficiaryaddress: 26,
      swiftcode: 28,
    };
    await ctx.reply(`Please enter the new value for ${field}:`);
    return ctx.wizard.selectStep(stepMap[field]);
  }
);

export default addPayeeWizard;
