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
interface RejectInt {
  message: object | string;
  statusCode: 0;
  error?: "string";
}
export { GeneralReturnInt, RejectInt, KycKybResponse, Networks,NetworkCoefficients};
