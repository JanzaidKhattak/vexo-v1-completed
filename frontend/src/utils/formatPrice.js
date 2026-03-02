// 1500000 → "Rs 15,00,000"
export const formatPrice = (price) => {
  if (!price && price !== 0) return "Price not set";

  const num = Number(price);
  if (isNaN(num)) return "Invalid price";

  return "Rs " + num.toLocaleString("en-PK");
};

// 1500000 → "15 Lac"  or  15000000 → "1.5 Crore"
export const formatPriceShort = (price) => {
  const num = Number(price);
  if (isNaN(num)) return "";

  if (num >= 10000000) {
    return (num / 10000000).toFixed(1).replace(/\.0$/, "") + " Crore";
  }
  if (num >= 100000) {
    return (num / 100000).toFixed(1).replace(/\.0$/, "") + " Lac";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return "Rs " + num.toString();
};

// Negotiable badge k leye
export const priceLabel = (price, isNegotiable) => {
  const base = formatPrice(price);
  return isNegotiable ? base + " (Negotiable)" : base;
};