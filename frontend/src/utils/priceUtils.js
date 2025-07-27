// Global tax class rates (edit here to change globally)
export const TAX_CLASS_RATES = {
  standard: 18,
  reduced: 5,
  exempt: 0,
};

export function calculateDiscountPercent(originalPrice, price) {
  if (!originalPrice || !price || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function calculateFinalPrice({ price = 0, taxClass = "standard", taxRate, isTaxInclusive = true }) {
  // Use the global TAX_CLASS_RATES
  let rate = typeof taxRate === "number" ? taxRate : TAX_CLASS_RATES[taxClass] || 0;
  let finalPrice = price;
  let priceAfterTax = price;

  if (!isTaxInclusive && rate > 0) {
    finalPrice = +(price + (price * rate) / 100).toFixed(2);
    priceAfterTax = finalPrice;
  } else if (isTaxInclusive && rate > 0) {
    // Calculate price before tax for info
    priceAfterTax = +(price / (1 + rate / 100)).toFixed(2);
    finalPrice = price;
  }

  return { finalPrice, priceAfterTax };
}
