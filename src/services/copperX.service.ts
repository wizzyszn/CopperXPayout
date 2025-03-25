import { UserInfoInt } from "../utils/sessionManager";
import {
  GeneralReturnInt,
  KycKybResponse,
  NetworkCoefficients,
  Networks,
  Payee,
  PayeeResponse,
  TransactionsInt,
} from "../utils/types";
import { options, requestHandler, urlGenerator } from "./config";
type RequestOtpReturnType = {
  email: string;
  sid: string;
};
type VerifyOtpReturnType = {
  scheme: "string";
  accessToken: "string";
  accessTokenId: "string";
  expireAt: "2025-03-15T13:52:50.532Z";
  user: UserInfoInt;
};
// Request OTP via email
const requestOtp = (email: string) => {
  const url = urlGenerator("auth", "email-otp/request");
  return requestHandler<RequestOtpReturnType>(url, options("POST", { email }));
};
// Autheticate Otp
const authenticateOtp = ({
  email,
  sid,
  otp,
}: {
  email: string;
  otp: number;
  sid: string;
}) => {
  const url = urlGenerator("auth", "email-otp/authenticate");
  return requestHandler<VerifyOtpReturnType>(
    url,
    options("POST", { email, otp, sid })
  );
};
// Request User Profile
const requestUserProfile = (token: string) => {
  const url = urlGenerator("auth", "me");
  return requestHandler<UserInfoInt>(url, options("GET", null, token));
};
// Request KYC status
const requestKYCstatus = (token: string) => {
  const url = urlGenerator("kyc", "", false, `page=1&limit=10`);
  return requestHandler<KycKybResponse>(url, options("GET", null, token));
};
//Get all wallets in an account
const getWallets = (token: string) => {
  const url = urlGenerator("wallets", "");
  return requestHandler<
    [
      {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        walletType: string;
        network: NetworkCoefficients;
        walletAddress: string;
        isDefault: boolean;
      }
    ]
  >(url, options("GET", null, token));
};
// Set Default Wallet
const setDefaultWallet = (walletId: string, token: string) => {
  const url = urlGenerator("wallets", "default");
  return requestHandler<{
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    walletType: string;
    network: string;
    walletAddress: string;
    isDefault: boolean;
  }>(url, options("POST", { walletId }, token));
};
// View Balances of each wallets
const viewBalances = (token: string) => {
  const url = urlGenerator("wallets", "balances");
  return requestHandler<
    {
      walletId: string;
      isDefault: boolean;
      network: NetworkCoefficients;
      balances: {
        decimals: 0;
        balance: string;
        symbol: "USDC";
        address: string;
      }[];
    }[]
  >(url, options("GET", null, token));
};
// Request Transaction history
const transactionHistoryReq = (token: string, page = 1, limit = 10) => {
  const url = urlGenerator(
    "transfers",
    "",
    false,
    `limit=${limit}&page=${page}`
  );
  return requestHandler<TransactionsInt>(url, options("GET", null, token));
};
//Get all the list of payees
const getAllPayees = (token: string, page = 1, limit = 10) => {
  const url = urlGenerator("payees", "", false, `limit=${limit}&page=${page}`);
  return requestHandler<PayeeResponse>(url, options("GET", null, token));
};
// Add a payee
const addPayee = (
  token: string,
  data: {
    nickName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    bankAccount: {
      country: string;
      bankName: string;
      bankAddress: string;
      type: "web3_wallet";
      bankAccountType: "savings" | "checking";
      bankRoutingNumber: string;
      bankAccountNumber: string;
      bankBeneficiaryName: string;
      bankBeneficiaryAddress: string;
      swiftCode: string;
    };
  }
) => {
  const url = urlGenerator("payees", "", false);
  return requestHandler<Payee>(url, options("POST", data, token));
};
// Logout
const logout = (token: string) => {
  const url = urlGenerator("auth", "logout");
  return requestHandler<{
    message: object | string;
    statusCode: 0;
    error: string;
  }>(url, options("POST", null, token));
};
export {
  requestOtp,
  authenticateOtp,
  requestUserProfile,
  requestKYCstatus,
  logout,
  getWallets,
  setDefaultWallet,
  viewBalances,
  transactionHistoryReq,
  getAllPayees,
  addPayee
};
