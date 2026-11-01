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

