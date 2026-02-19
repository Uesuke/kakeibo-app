export type PaymentType = 'cash' | 'credit';

/**
 * フォーム → API 変換
 */
export function paymentTypeToIsCredit(
  isIncome: boolean,
  paymentType?: PaymentType,
): 0 | 1 | undefined {
  if (isIncome) return undefined;
  return paymentType === 'credit' ? 1 : 0;
}

/**
 * API → フォーム変換
 */
export function isCreditToPaymentType(
  isIncome: boolean,
  isCredit?: number | null,
): PaymentType | null {
  if (isIncome) return null;
  return isCredit === 1 ? 'credit' : 'cash';
}
