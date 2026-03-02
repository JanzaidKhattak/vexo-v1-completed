// Pakistani number formats:
// 03001234567 (local)
// +923001234567 (international)
// 923001234567 (without +)

export const validatePakistaniPhone = (number) => {
  const cleaned = number.replace(/\s+/g, "").replace(/-/g, "");

  // Local format: 03XXXXXXXXX
  const localRegex = /^03[0-9]{9}$/;

  // International format: +923XXXXXXXXX or 923XXXXXXXXX
  const intlRegex = /^(\+92|92)3[0-9]{9}$/;

  return localRegex.test(cleaned) || intlRegex.test(cleaned);
};

// Always convert to +92 format for Twilio
export const formatToE164 = (number) => {
  const cleaned = number.replace(/\s+/g, "").replace(/-/g, "");

  if (cleaned.startsWith("+92")) return cleaned;
  if (cleaned.startsWith("92")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+92${cleaned.slice(1)}`;

  return null;
};

// Display format: 0300 1234567
export const formatForDisplay = (number) => {
  const e164 = formatToE164(number);
  if (!e164) return number;

  const local = "0" + e164.slice(3); // +923001234567 → 03001234567
  return `${local.slice(0, 4)} ${local.slice(4)}`;
};