export const REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  numeric: /[0-9]/,
  symbol: /[!@#$%^&*]/,
  character: /^[a-z A-Z]+$/,
  zip: /^[0-9]{5}$/,
  phone: /^\(\d{3}\)[- ]\d{3}[- ]?\d{4}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  taxId: /^\d{9}$/
};
