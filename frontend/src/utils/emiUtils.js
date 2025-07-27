
export function calculateEMI(principal, months, annualInterestRate) {
  const r = annualInterestRate / 12 / 100;
  if (r === 0) return +(principal / months).toFixed(2);
  return +(
    (principal * r * Math.pow(1 + r, months)) /
    (Math.pow(1 + r, months) - 1)
  ).toFixed(2);
}
