// src/components/notes/types.ts

export interface KycFormData {
  country: string;
  corridor: string;
  reviewedDocument: string;
  customDocument: string;
  docLink: string;
  isPhotoVisible: string;
  isIdNumberVisible: string;
  isExpired: string;
  isDobMatch: string;
  isNameMatch: string;
  observations: string;
  reviewDecision: string;
  nextActions: string;
}

export const initialKycFormData: KycFormData = {
  country: '',
  corridor: '',
  reviewedDocument: '',
  customDocument: '',
  docLink: '',
  isPhotoVisible: '',
  isIdNumberVisible: '',
  isExpired: '',
  isDobMatch: '',
  isNameMatch: '',
  observations: '',
  reviewDecision: 'KYC review approved',
  nextActions: '',
};

export interface RiskReviewFormData {
  corridor: string;
  // KYC Status
  kycStatus: string;
  customerName: string;
  customerDob: string;
  // Attributes electronically verified
  phoneToName: 'match' | 'not match' | '';
  emailToName: 'match' | 'not match' | '';
  mobileSmsVerified: 'verified' | 'not verified' | '';
  emailValid: 'valid' | 'not valid' | '';
  ssnVerified: 'verified' | 'not verified' | '';
  // Findings
  emailsFirstSeen: string;
  signUp: string;
  emailDerivesCxName: 'yes' | 'not' | '';
  recentChangeOnAccount: 'yes' | 'not' | '';
  recentChangeDetails: string;
  // Payment Profile information
  paymentProfileUnderCustomerName: 'yes' | 'not' | '';
  // RISK SUMMARY on account reviewed
  sameDevice: string;
  cellularConnection: string;
  // Linked accounts
  duplicateAccount: 'not' | 'yes' | '';
  duplicateAccountDetails: string;
  suspendedAccount: 'not' | 'yes' | '';
  suspendedAccountDetails: string;
  highRiskAccount: 'not' | 'yes' | '';
  highRiskAccountDetails: string;
  // Sending patterns
  transferHistory: string;
  frequency: 'high' | 'medium' | 'low' | '';
  // Doc review
  docReviewLink: string;
  isPhotoVisible: string;
  isIdNumberVisible: string;
  isExpired: string;
  isDobMatch: string;
  isNameMatch: string;
  externalLinkFound: string;
  // Actions taken
  actionsTaken: string;
}

export const initialRiskReviewFormData: RiskReviewFormData = {
  corridor: '',
  kycStatus: 'Verified',
  customerName: '',
  customerDob: '',
  phoneToName: '',
  emailToName: '',
  mobileSmsVerified: '',
  emailValid: '',
  ssnVerified: '',
  emailsFirstSeen: '',
  signUp: '',
  emailDerivesCxName: '',
  recentChangeOnAccount: '',
  recentChangeDetails: '',
  paymentProfileUnderCustomerName: '',
  sameDevice: '1 device registered',
  cellularConnection: 'Customer is logged in sending corridor, through a cellular connection',
  duplicateAccount: '',
  duplicateAccountDetails: '',
  suspendedAccount: '',
  suspendedAccountDetails: '',
  highRiskAccount: '',
  highRiskAccountDetails: '',
  transferHistory: '',
  frequency: '',
  docReviewLink: '',
  isPhotoVisible: '',
  isIdNumberVisible: '',
  isExpired: '',
  isDobMatch: '',
  isNameMatch: '',
  externalLinkFound: '',
  actionsTaken: '',
};

export interface RecordKeepingFormData {
  country: string;
  workType: string;
  kycStatus: 'Verified' | 'Not verified' | '';
  duplicateAccounts: 'yes' | 'not' | '';
  duplicateAccountsDetails: string;
  // Doc Review
  docReviewLink: string;
  // Proof of Identity
  isPhotoVisible: string;
  isIdNumberVisible: string;
  isExpired: string;
  isDobMatch: string;
  isNameMatch: string;
  externalLinkFound: string;
  // Proof of address
  poaDocLink: string;
  isPoaExpiredOrOlder90Days: string;
  isPoaAddressMatch: string;
  isPoaNameMatch: string;
  // Mandatory questions for record keeping
  occupation: string;
  employer: string;
  fundsSource: string;
  isPep: 'yes' | 'not' | '';
  pepDetails: string;
  foreignTransactions: 'yes' | 'not' | '';
  foreignTransactionsDetails: string;
  // Actions Taken
  actionsTaken: string;
  // Decision
  recordKeepingDecision: 'Approved' | 'Denied' | '';
  denialReason: string;
}

export const initialRecordKeepingFormData: RecordKeepingFormData = {
  country: '',
  workType: 'RK review',
  kycStatus: 'Verified',
  duplicateAccounts: '',
  duplicateAccountsDetails: '',
  docReviewLink: '',
  isPhotoVisible: '',
  isIdNumberVisible: '',
  isExpired: '',
  isDobMatch: '',
  isNameMatch: '',
  externalLinkFound: '',
  poaDocLink: '',
  isPoaExpiredOrOlder90Days: '',
  isPoaAddressMatch: '',
  isPoaNameMatch: '',
  occupation: '',
  employer: '',
  fundsSource: '',
  isPep: '',
  pepDetails: '',
  foreignTransactions: '',
  foreignTransactionsDetails: '',
  actionsTaken: '',
  recordKeepingDecision: 'Approved',
  denialReason: '',
};

export interface WatchlistReviewFormData {
  corridorCountry: string;
  matchType: 'Sender' | 'Recipient';
  // Findings
  idLink: string;
  externalSource: string;
  // ID Details
  idFullName: string;
  idDob: string;
  idNumber: string;
  idExpirationDate: string;
  isIdExpired: boolean;
  // Match Details
  matchFullNameAka: string;
  matchDob: string;
  matchLocation: string;
  // Resolution
  attributeUsed: 'Name' | 'DOB' | 'Location' | '';
  clearingAttributeValue: string;
  matchAttributeValue: string;
  // Conclusion & Resolution
  conclusion: 'FALSE_POSITIVE' | 'TRUE_POSITIVE' | '';
  truePositiveDisposition: string;
}

export const initialWatchlistReviewFormData: WatchlistReviewFormData = {
  corridorCountry: '',
  matchType: 'Sender',
  idLink: '',
  externalSource: 'https://www.edisontd.nl/country-browser/',
  idFullName: '',
  idDob: '',
  idNumber: '',
  idExpirationDate: '',
  isIdExpired: false,
  matchFullNameAka: '',
  matchDob: '',
  matchLocation: '',
  attributeUsed: 'Name',
  clearingAttributeValue: '',
  matchAttributeValue: '',
  conclusion: 'FALSE_POSITIVE',
  truePositiveDisposition: 'Escalated to MLRO',
};
