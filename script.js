function calculateMortgage(loanAmount, annualInterestRate, loanTermYears) {
  const numberOfPayments = loanTermYears * 12;
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  const monthlyPayment = monthlyInterestRate === 0
    ? loanAmount / numberOfPayments
    : loanAmount * (
      monthlyInterestRate * (1 + monthlyInterestRate) ** numberOfPayments
    ) / ((1 + monthlyInterestRate) ** numberOfPayments - 1);

  const totalPayments = monthlyPayment * numberOfPayments;

  return {
    monthlyPayment,
    totalPayments,
    totalInterest: totalPayments - loanAmount,
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

if (typeof document !== "undefined") {
  const form = document.querySelector("#mortgage-form");
  const results = document.querySelector("#results");
  const errorMessage = document.querySelector("#error-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const loanAmount = Number(form.elements.loanAmount.value);
    const interestRate = Number(form.elements.interestRate.value);
    const loanTerm = Number(form.elements.loanTerm.value);

    if (loanAmount <= 0 || interestRate < 0 || loanTerm <= 0 || !Number.isInteger(loanTerm)) {
      results.hidden = true;
      errorMessage.textContent = "Please enter a positive loan amount, a valid rate, and a whole number of years.";
      return;
    }

    errorMessage.textContent = "";
    const payment = calculateMortgage(loanAmount, interestRate, loanTerm);

    document.querySelector("#monthly-payment").textContent = formatCurrency(payment.monthlyPayment);
    document.querySelector("#total-payments").textContent = formatCurrency(payment.totalPayments);
    document.querySelector("#total-interest").textContent = formatCurrency(payment.totalInterest);
    results.hidden = false;
  });
}

if (typeof module !== "undefined") {
  module.exports = { calculateMortgage };
}
