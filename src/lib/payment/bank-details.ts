import { allowOfflineFallback } from "@/lib/auth/offline-mode";
import type { PaymentInstructionsSettings } from "@/lib/settings/settings-service";

export interface PaymentAccount {
  id: string;
  type: "bank" | "wallet";
  name: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchCode?: string;
  instructions: string;
  badge: string;
}

/**
 * Dynamically resolves active bank and wallet accounts from store settings.
 * In production, strictly prevents dummy placeholder accounts from being displayed.
 */
export function formatPaymentAccountsFromSettings(
  settings: PaymentInstructionsSettings
): PaymentAccount[] {
  const accounts: PaymentAccount[] = [];

  const hasRealBank =
    settings.bankName &&
    settings.accountNumber &&
    settings.accountNumber !== "01020304050607" &&
    settings.accountNumber !== "02100109876543" &&
    settings.accountNumber.trim().length > 5;

  if (hasRealBank) {
    accounts.push({
      id: "bank_transfer",
      type: "bank",
      name: settings.bankName,
      accountTitle: settings.accountTitle,
      accountNumber: settings.accountNumber,
      iban: settings.iban || undefined,
      instructions: settings.instructions,
      badge: "Direct Bank Transfer",
    });
  }

  if (settings.easypaisaNumber && settings.easypaisaNumber.trim().length > 5) {
    accounts.push({
      id: "easypaisa",
      type: "wallet",
      name: "EasyPaisa",
      accountTitle: settings.easypaisaTitle || settings.accountTitle,
      accountNumber: settings.easypaisaNumber,
      instructions: "Transfer to EasyPaisa account. Include your order reference in remarks.",
      badge: "Instant Mobile Wallet",
    });
  }

  if (settings.jazzcashNumber && settings.jazzcashNumber.trim().length > 5) {
    accounts.push({
      id: "jazzcash",
      type: "wallet",
      name: "JazzCash",
      accountTitle: settings.jazzcashTitle || settings.accountTitle,
      accountNumber: settings.jazzcashNumber,
      instructions: "Transfer to JazzCash account. Include your order reference in remarks.",
      badge: "Instant Mobile Wallet",
    });
  }

  // Fallback ONLY allowed in offline development or test runs
  if (accounts.length === 0 && allowOfflineFallback()) {
    accounts.push(
      {
        id: "meezan",
        type: "bank",
        name: settings.bankName || "Meezan Bank Limited",
        accountTitle: settings.accountTitle || "Laira Charms Workshop (Dev Mode)",
        accountNumber: "DEV-ACCOUNT-CONFIG-PENDING",
        iban: settings.iban || "PK00MEZN0000000000000000",
        branchCode: "0210 (Development Sandbox)",
        instructions: settings.instructions || "Please configure your real bank details in Admin Settings.",
        badge: "Development / Offline Account",
      },
      {
        id: "easypaisa",
        type: "wallet",
        name: "EasyPaisa (Dev Mock)",
        accountTitle: "Laira Charms (Dev)",
        accountNumber: "0300-DEV-MOCK",
        instructions: "Offline dev mock account for testing proof upload.",
        badge: "Dev Wallet",
      },
      {
        id: "jazzcash",
        type: "wallet",
        name: "JazzCash (Dev Mock)",
        accountTitle: "Laira Charms (Dev)",
        accountNumber: "0300-DEV-MOCK",
        instructions: "Offline dev mock account for testing proof upload.",
        badge: "Dev Wallet",
      }
    );
  }

  return accounts;
}

export function isPaymentConfigured(accounts: PaymentAccount[]): boolean {
  return accounts.some((a) => !a.accountNumber.includes("DEV-"));
}

/**
 * Offline/testing static accounts for backwards-compatible test fixtures
 */
export const PAKISTANI_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: "meezan",
    type: "bank",
    name: "Meezan Bank Limited",
    accountTitle: "Laira Charms Studio",
    accountNumber: "02100109876543",
    iban: "PK42MEZN0002100109876543",
    branchCode: "0210 (F-7 Markaz, Islamabad)",
    instructions: "Please enter your Order Reference as the transaction remarks / reference in your banking app.",
    badge: "Islamic Banking",
  },
  {
    id: "easypaisa",
    type: "wallet",
    name: "EasyPaisa",
    accountTitle: "Laira Charms",
    accountNumber: "03001234567",
    instructions: "Send via EasyPaisa App > Send Money > EasyPaisa Account. Mention your Order Reference.",
    badge: "Instant Wallet",
  },
  {
    id: "jazzcash",
    type: "wallet",
    name: "JazzCash",
    accountTitle: "Laira Charms",
    accountNumber: "03007654321",
    instructions: "Send via JazzCash App > Money Transfer > Mobile Account. Mention your Order Reference.",
    badge: "Instant Wallet",
  },
];
