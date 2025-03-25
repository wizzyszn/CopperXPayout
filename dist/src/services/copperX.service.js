"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPayee = exports.getAllPayees = exports.transactionHistoryReq = exports.viewBalances = exports.setDefaultWallet = exports.getWallets = exports.logout = exports.requestKYCstatus = exports.requestUserProfile = exports.authenticateOtp = exports.requestOtp = void 0;
const config_1 = require("./config");
// Request OTP via email
const requestOtp = (email) => {
    const url = (0, config_1.urlGenerator)("auth", "email-otp/request");
    return (0, config_1.requestHandler)(url, (0, config_1.options)("POST", { email }));
};
exports.requestOtp = requestOtp;
// Autheticate Otp
const authenticateOtp = ({ email, sid, otp, }) => {
    const url = (0, config_1.urlGenerator)("auth", "email-otp/authenticate");
    return (0, config_1.requestHandler)(url, (0, config_1.options)("POST", { email, otp, sid }));
};
exports.authenticateOtp = authenticateOtp;
// Request User Profile
const requestUserProfile = (token) => {
    const url = (0, config_1.urlGenerator)("auth", "me");
    return (0, config_1.requestHandler)(url, (0, config_1.options)("GET", null, token));
};
exports.requestUserProfile = requestUserProfile;
// Request KYC status
const requestKYCstatus = (token) => {
    const url = (0, config_1.urlGenerator)("kyc", "", false, `page=1&limit=10`);
    return (0, config_1.requestHandler)(url, (0, config_1.options)("GET", null, token));
};
exports.requestKYCstatus = requestKYCstatus;
//Get all wallets in an account
const getWallets = (token) => {
    const url = (0, config_1.urlGenerator)("wallets", "");
    return (0, config_1.requestHandler)(url, (0, config_1.options)("GET", null, token));
};
exports.getWallets = getWallets;
// Set Default Wallet
const setDefaultWallet = (walletId, token) => {
    const url = (0, config_1.urlGenerator)("wallets", "default");
    return (0, config_1.requestHandler)(url, (0, config_1.options)("POST", { walletId }, token));
};
exports.setDefaultWallet = setDefaultWallet;
// View Balances of each wallets
const viewBalances = (token) => {
    const url = (0, config_1.urlGenerator)("wallets", "balances");
    return (0, config_1.requestHandler)(url, (0, config_1.options)("GET", null, token));
};
exports.viewBalances = viewBalances;
// Request Transaction history
const transactionHistoryReq = (token, page = 1, limit = 10) => {
    const url = (0, config_1.urlGenerator)("transfers", "", false, `limit=${limit}&page=${page}`);
    return (0, config_1.requestHandler)(url, (0, config_1.options)("GET", null, token));
};
exports.transactionHistoryReq = transactionHistoryReq;
//Get all the list of payees
const getAllPayees = (token, page = 1, limit = 10) => {
    const url = (0, config_1.urlGenerator)("payees", "", false, `limit=${limit}&page=${page}`);
    return (0, config_1.requestHandler)(url, (0, config_1.options)("GET", null, token));
};
exports.getAllPayees = getAllPayees;
// Add a payee
const addPayee = (token, data) => {
    const url = (0, config_1.urlGenerator)("payees", "", false);
    return (0, config_1.requestHandler)(url, (0, config_1.options)("POST", data, token));
};
exports.addPayee = addPayee;
// Logout
const logout = (token) => {
    const url = (0, config_1.urlGenerator)("auth", "logout");
    return (0, config_1.requestHandler)(url, (0, config_1.options)("POST", null, token));
};
exports.logout = logout;
