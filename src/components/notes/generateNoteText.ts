import {
  KycFormData,
  RiskReviewFormData,
  RecordKeepingFormData,
  WatchlistReviewFormData,
} from './types';

// 1. Generador de Nota KYC Review (Proof of Identity)
export function generateKycNote(form: KycFormData): string {
  const country = form.country.trim() || '[País]';
  const corridor = form.corridor.trim() || '[Corridor]';

  const docType =
    form.reviewedDocument === 'Otro Documento Primario' && form.customDocument.trim()
      ? form.customDocument.trim()
      : form.reviewedDocument.trim() || '[Tipo de Documento Primario]';

  const linkLine = form.docLink.trim() || '[Enlace del Documento ID]';

  const photoVisible = form.isPhotoVisible || '[Yes/No]';
  const idNumberVisible = form.isIdNumberVisible || '[Yes/No]';
  const expired = form.isExpired || '[Yes/No]';
  const dobMatch = form.isDobMatch || '[Yes/No]';
  const nameMatch = form.isNameMatch || '[Yes/No]';

  const observations = form.observations.trim() || '[Observaciones del analista]';
  
  let decision = form.reviewDecision.trim() || 'KYC review approved';
  if (!/^kyc review/i.test(decision)) {
    decision = `KYC review ${decision}`;
  }

  const nextActions = form.nextActions.trim() || '[Próximas acciones]';

  return `*** KYC Review (${country}) ***

✔️ Corridor: ${corridor}
✔️ Reviewed Document: ${docType}
${linkLine}
▷ Is Photo Visible: ${photoVisible}
▷ Is Id Number Visible: ${idNumberVisible}
▷ Is it expired: ${expired}
▷ DOB Matches Customer Record: ${dobMatch}
▷ Name Matches Customer Record: ${nameMatch}

✔️ Observations:
${observations}

✔️ Review Decision: ${decision}

✔️ Next agent actions: ${nextActions}`;
}

// 2. Generador de Nota Risk Review (Fraud Review)
export function generateRiskReviewNote(form: RiskReviewFormData): string {
  const corridor = form.corridor.trim() || '[Corridor]';
  const kycStatus = form.kycStatus.trim() || '[Verified / Not verified]';
  const customerName = form.customerName.trim() || '[Customer Name]';
  const customerDob = form.customerDob.trim() || '[Customer DOB]';

  const phoneToName = form.phoneToName || '[match/not match]';
  const emailToName = form.emailToName || '[match/not match]';
  const mobileSmsVerified = form.mobileSmsVerified || '[verified/not verified]';
  const emailValid = form.emailValid || '[valid/not valid]';
  const ssnVerified = form.ssnVerified || '[verified/not verified]';

  const emailsFirstSeen = form.emailsFirstSeen.trim() || '[Emails first seen]';
  const signUp = form.signUp.trim() || '[Sign up]';
  const emailDerivesCxName = form.emailDerivesCxName || '[yes/not]';

  let recentChangeStr = form.recentChangeOnAccount || '[yes/not]';
  if (form.recentChangeOnAccount === 'yes' && form.recentChangeDetails.trim()) {
    recentChangeStr = `yes - ${form.recentChangeDetails.trim()}`;
  }

  const paymentProfile = form.paymentProfileUnderCustomerName || '[yes/not]';

  const sameDevice = form.sameDevice.trim() || '1 device';
  const cellularConn =
    form.cellularConnection.trim() ||
    'Customer is logged in sending corridor, through a cellular connection';

  let duplicateStr = form.duplicateAccount || '[yes/not]';
  if (form.duplicateAccountDetails.trim()) {
    duplicateStr = `${form.duplicateAccount} - ${form.duplicateAccountDetails.trim()}`;
  }

  let suspendedStr = form.suspendedAccount || '[yes/not]';
  if (form.suspendedAccountDetails.trim()) {
    suspendedStr = `${form.suspendedAccount} - ${form.suspendedAccountDetails.trim()}`;
  }

  let highRiskStr = form.highRiskAccount || '[yes/not]';
  if (form.highRiskAccountDetails.trim()) {
    highRiskStr = `${form.highRiskAccount} - ${form.highRiskAccountDetails.trim()}`;
  }

  const transferHistory = form.transferHistory.trim() || '[Detalle de transacciones]';
  const frequency = form.frequency || '[high/medium/low]';

  const docReviewLink = form.docReviewLink.trim() || '[Link del ID]';
  const photoVisible = form.isPhotoVisible || '[Yes/No]';
  const idNumberVisible = form.isIdNumberVisible || '[Yes/No]';
  const isExpired = form.isExpired || '[Yes/No]';
  const dobMatch = form.isDobMatch || '[Yes/No]';
  const nameMatch = form.isNameMatch || '[Yes/No]';
  const externalLink = form.externalLinkFound || 'https://www.edisontd.nl/country-browser/';

  const actionsTaken = form.actionsTaken.trim() || '[Acciones tomadas en la cuenta]';

  return `•••• Risk Review ••••

▷ Corridor: ${corridor}

✔️KYC Status: ${kycStatus}
▷Customer's Name: ${customerName}
▷Customer's DOB: ${customerDob}

📌Attributes are electronically verified:
▷Phone to name: ${phoneToName}
▷Email to name: ${emailToName}
▷Mobile number is SMS verified: ${mobileSmsVerified}
▷Email: ${emailValid}
▷SSN: ${ssnVerified}

📌Findings:
▷ Emails first seen: ${emailsFirstSeen}
▷ Sign up: ${signUp}
▷ Email derives cx name: ${emailDerivesCxName}
▷ Recent change on the account: ${recentChangeStr}

📌Payment Profile information
▷Payment Profile under customer name: ${paymentProfile}

📌RISK SUMMARY on account reviewed
-Same device: ${sameDevice}
-Customer is logged in sending corridor, through a cellular connection: ${cellularConn}

📌 Linked accounts:
▷Duplicate: ${duplicateStr}
▷Suspended: ${suspendedStr}
▷High-Risk: ${highRiskStr}

📌 Sending patterns:
▷Transfer History: ${transferHistory}
▷Frequency: ${frequency}

📌 Doc review: ${docReviewLink}
▷Is Photo Visible: ${photoVisible}
▷Is Id Number Visible: ${idNumberVisible}
▷Is it expired: ${isExpired}
▷Dob Matches Customer Record: ${dobMatch}
▷Name Matches Customer Record: ${nameMatch}
▷External Link Found: ${externalLink}

✔️Actions taken:
${actionsTaken}`;
}

// 3. Generador de Nota Record Keeping Review
export function generateRecordKeepingNote(form: RecordKeepingFormData): string {
  const country = form.country.trim() || '[País]';
  const kycStatus = form.kycStatus || '[Verified/Not verified]';

  let duplicateStr = form.duplicateAccounts || '[yes/not]';
  if (form.duplicateAccounts === 'yes' && form.duplicateAccountsDetails.trim()) {
    duplicateStr = `yes - ${form.duplicateAccountsDetails.trim()}`;
  }

  const docReviewLink = form.docReviewLink.trim() || '[Link del ID / Documentos]';

  const poiPhoto = form.isPhotoVisible || '[Yes/No]';
  const poiIdNum = form.isIdNumberVisible || '[Yes/No]';
  const poiExpired = form.isExpired || '[Yes/No]';
  const poiDob = form.isDobMatch || '[Yes/No]';
  const poiName = form.isNameMatch || '[Yes/No]';
  const poiExternal = form.externalLinkFound || 'https://www.edisontd.nl/country-browser/';

  const poaLink = form.poaDocLink.trim() ? `${form.poaDocLink.trim()}\n` : '';
  const poaExpired = form.isPoaExpiredOrOlder90Days || '[Yes/No]';
  const poaAddr = form.isPoaAddressMatch || '[Yes/No]';
  const poaName = form.isPoaNameMatch || '[Yes/No]';

  const occupation = form.occupation.trim() || '[Current occupation]';
  const employer = form.employer.trim() || '[Employer]';
  const funds = form.fundsSource.trim() || '[Source of funds]';

  let pepStr = form.isPep || '[yes/not]';
  if (form.isPep === 'yes' && form.pepDetails.trim()) {
    pepStr = `yes - ${form.pepDetails.trim()}`;
  }

  let foreignStr = form.foreignTransactions || '[yes/not]';
  if (form.foreignTransactions === 'yes' && form.foreignTransactionsDetails.trim()) {
    foreignStr = `yes - ${form.foreignTransactionsDetails.trim()}`;
  }

  let decisionStr = form.recordKeepingDecision || '[Approved/Denied]';
  if (form.recordKeepingDecision === 'Denied' && form.denialReason.trim()) {
    decisionStr = `Denied - Reason: ${form.denialReason.trim()}`;
  }

  const actionsTaken = form.actionsTaken.trim() || '[Acciones tomadas en la cuenta]';

  return `•••• Record Keeping Review (${country}) ••••

✔️Work Type: RK review
✔️KYC status: ${kycStatus}
✔️Duplicate Accounts: ${duplicateStr}

📝 Doc Review:
${docReviewLink}

🧍 Proof of Identity:
▷Is Photo Visible: ${poiPhoto}
▷Is Id Number Visible: ${poiIdNum}
▷Is it expired: ${poiExpired}
▷Dob Matches Customer Record: ${poiDob}
▷Name Matches Customer Record: ${poiName}
▷External Link Found: ${poiExternal}

🏠 Proof of address:
${poaLink}▷Is POA expired or older than Ninety Days: ${poaExpired}
▷Address Matches Customer Record: ${poaAddr}
▷Name Matches Customer Record: ${poaName}

✔️ Mandatory questions for record keeping:
▷What is your current occupation?: ${occupation}
▷Who is your employer?: ${employer}
▷Where do the funds it will use to operate come from?: ${funds}
▷Are you, a member of management, or a beneficial owner a PEP?: ${pepStr}
▷Do you conduct transactions in foreign currency or have accounts outside the country?: ${foreignStr}

✔️Record Keeping Decision: ${decisionStr}

✔️Actions Taken:
${actionsTaken}`;
}

// 4. Generador de Nota Watchlist Review (Sender & Recipient)
export function generateWatchlistReviewNote(form: WatchlistReviewFormData): string {
  const corridor = form.corridorCountry.trim() || '[Corridor/País]';
  const matchType = form.matchType || 'Sender';
  const idLink = form.idLink.trim() || '[Link del ID]';
  const externalSource = form.externalSource || 'https://www.edisontd.nl/country-browser/';

  const idFullName = form.idFullName.trim() || '[Full Name on ID]';
  const idDob = form.idDob.trim() || '[Date of birth on ID]';
  const idNumber = form.idNumber.trim() || '[ID number]';

  let idExpiration = form.idExpirationDate.trim() || '[Expiration Date]';
  if (form.isIdExpired) {
    idExpiration += ' (EXPIRED - Cannot be used to clear match)';
  }

  const matchFullName = form.matchFullNameAka.trim() || '[Full Name of the match and AKA]';
  const matchDob = form.matchDob.trim() || '[Date of birth of the match]';
  const matchLocation = form.matchLocation.trim() || '[Location of the match]';

  const attributeUsed = form.attributeUsed || 'Name';
  const clearingAttrVal = form.clearingAttributeValue.trim() || `[${attributeUsed} Value]`;
  const matchAttrVal = form.matchAttributeValue.trim() || `[Sanctioned ${attributeUsed} Value]`;

  const falsePositiveBox = form.conclusion === 'FALSE_POSITIVE' ? '[X]' : '[ ]';
  const truePositiveBox = form.conclusion === 'TRUE_POSITIVE' ? '[X]' : '[ ]';
  const truePosDisp = form.truePositiveDisposition.trim() || 'Escalated to MLRO';

  return `••• Working on Watchlist Review •••

▷ Corridor: ${corridor}
▷ Match: ${matchType}

📌 • Findings •
▷ ${matchType} ID: ${idLink}
▷ External source: ${externalSource}

📌 ID Details:
▷ Full Name on ID: ${idFullName}
▷ Date of birth on ID: ${idDob}
▷ ID number: ${idNumber}
▷ Expiration date: ${idExpiration}

📌 Match Details:
▷ Full Name of the match and AKA: ${matchFullName}
▷ Date of birth of the match: ${matchDob}
▷ Location of the match: ${matchLocation}

📌 Resolution:

How: Cleared by ${attributeUsed}
${matchType} attribute used to clear: [ ${attributeUsed} ] ${clearingAttrVal}
Match attribute used: [ Sanctioned ${attributeUsed} ] ${matchAttrVal}

📌 CONCLUSION & RESOLUTION:
${falsePositiveBox} FALSE POSITIVE: The match is confirmed as a false positive due to a non-matching unique identifier (ID/DOB/Location).
${truePositiveBox} TRUE POSITIVE - DISPOSITION: [${truePosDisp}].`;
}
