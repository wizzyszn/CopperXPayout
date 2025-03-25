interface Verification {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kycDetailId?: string;
  kybDetailId?: string;
  kycProviderCode?: string;
  kybProviderCode?: string;
  externalCustomerId: string;
  externalKycId?: string;
  externalKybId?: string;
  status: string;
  externalStatus: string;
  verifiedAt: string;
}

interface Document {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kycDetailId?: string;
  kybDetailId?: string;
  documentType: string;
  status: string;
  frontFileName: string;
  backFileName: string;
}

interface KycDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kybDetailId: string;
  nationality: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  positionAtCompany: string;
  sourceOfFund: string;
  currentKycVerificationId: string;
  currentKycVerification: Verification;
  kycDocuments: Document[];
  kycUrl: string;
  uboType: string;
  percentageOfShares: number;
  joiningDate: string;
}

interface KybDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  companyName: string;
  companyDescription: string;
  website: string;
  incorporationDate: string;
  incorporationCountry: string;
  incorporationNumber: string;
  companyType: string;
  companyTypeOther: string;
  natureOfBusiness: string;
  natureOfBusinessOther: string;
  sourceOfFund: string;
  sourceOfFundOther: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phoneNumber: string;
  currentKybVerificationId: string;
  currentKybVerification: Verification;
  kybDocuments: Document[];
  kycDetails: KycDetail[];
  sourceOfFundDescription: string;
  expectedMonthlyVolume: number;
  purposeOfFund: string;
  purposeOfFundOther: string;
  operatesInProhibitedCountries: boolean;
  taxIdentificationNumber: string;
  highRiskActivities: string[];
}

interface KycAdditionalDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kycId: string;
  name: string;
  fileName: string;
}

interface KycKybData {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  status: string;
  type: string;
  country: string;
  providerCode: string;
  kycProviderCode: string;
  kycDetailId: string;
  kybDetailId: string;
  kycDetail: KycDetail;
  kybDetail: KybDetail;
  kycAdditionalDocuments: KycAdditionalDocument[];
  statusUpdates: string;
}

interface KycKybResponse {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: KycKybData[];
}
type Networks =
  | "Polygon"
  | "Arbitrum"
  | "Base"
  | "Mode"
  | "Starknet";
type NetworkCoefficients = "137" | "42161" | "8453" | "23434" | "534352";
interface GeneralReturnInt<T> {
  message: object | string;
  statusCode: number;
  error?: "string";
  data?: T;
}
interface DepositAccount {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  country: string;
  network: string;
  accountId: string;
  walletAddress: string;
  bankName: string;
  bankAddress: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankDepositMessage: string;
  wireMessage: string;
  payeeEmail: string;
  payeeOrganizationId: string;
  payeeId: string;
  payeeDisplayName: string;
}

interface Transaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  type: string;
  providerCode: string;
  kycId: string;
  transferId: string;
  status: string;
  externalStatus: string;
  fromAccountId: string;
  toAccountId: string;
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  totalFee: string;
  feeCurrency: string;
  transactionHash: string;
  depositAccount: DepositAccount;
  externalTransactionId: string;
  externalCustomerId: string;
  depositUrl: string;
}

interface Customer {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  businessName: string;
  email: string;
  country: string;
}

interface Account {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  country: string;
  network: string;
  accountId: string;
  walletAddress: string;
  bankName: string;
  bankAddress: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankDepositMessage: string;
  wireMessage: string;
  payeeEmail: string;
  payeeOrganizationId: string;
  payeeId: string;
  payeeDisplayName: string;
}

interface DataItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  status: string;
  customerId: string;
  customer: Customer;
  type: string;
  sourceCountry: string;
  destinationCountry: string;
  destinationCurrency: string;
  amount: string;
  currency: string;
  amountSubtotal: string;
  totalFee: string;
  feePercentage: string;
  feeCurrency: string;
  invoiceNumber: string;
  invoiceUrl: string;
  sourceOfFundsFile: string;
  note: string;
  purposeCode: string;
  sourceOfFunds: string;
  recipientRelationship: string;
  sourceAccountId: string;
  destinationAccountId: string;
  paymentUrl: string;
  mode: string;
  isThirdPartyPayment: boolean;
  transactions: Transaction[];
  destinationAccount: Account;
  sourceAccount: Account;
  senderDisplayName: string;
}

interface TransactionsInt {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: DataItem[];
}
interface PayeeResponse {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    nickName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    displayName: string;
    bankAccount?: {
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
    isGuest: boolean;
    hasBankAccount: boolean;
  }[];
}
interface Payee {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  nickName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  displayName: string;
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
  isGuest: boolean;
  hasBankAccount: boolean;
}

interface RejectInt {
  message: object | string;
  statusCode: 0;
  error?: "string";
}
export { GeneralReturnInt, RejectInt, KycKybResponse, Networks,NetworkCoefficients,TransactionsInt, PayeeResponse,Payee};
