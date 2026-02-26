export type PaymentType = 'cash' | 'credit';
export type CreditFlag = 0 | 1;

/**
 * フォーム → API
 */
export function paymentTypeToIsCredit(
  isIncome: boolean,
  paymentType?: PaymentType,
): CreditFlag | null {
  if (isIncome) return null;
  return paymentType === 'credit' ? 1 : 0;
}

/**
 * API → フォーム
 */
export function isCreditToPaymentType(
  isIncome: boolean,
  isCredit?: number | null,
): PaymentType | null {
  if (isIncome) return null;
  return isCredit === 1 ? 'credit' : 'cash';
}
