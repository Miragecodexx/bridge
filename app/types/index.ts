export type Screen =
  | "welcome"
  | "signup"
  | "kyc-upload"
  | "kyc-selfie"
  | "dashboard"
  | "send-country"
  | "send-amount"
  | "send-rate"
  | "send-beneficiary"
  | "send-funding"
  | "send-confirm"
  | "send-success"
  | "history"
  | "profile"

export interface Country {
  code: string
  name: string
  currency: string
  flag: string
}

export interface Transaction {
  id: string
  recipient: string
  amount: number
  currency: string
  toCurrency: string
  toAmount: number
  status: "completed" | "pending"
  date: string
  country: string
}

export interface SendData {
  country: string
  countryName: string
  countryCurrency: string
  countryFlag: string
  amount: string
  rate: number
  beneficiary: string
  funding: string
  fee: number
} 