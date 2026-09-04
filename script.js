function calculateMortgage(
  loanAmount,
  annualInterestRate,
  loanTermYears,
  annualPropertyTaxes = 0,
  annualHomeownersInsurance = 0,
  monthlyMortgageInsurance = 0,
) {
  const numberOfPayments = loanTermYears * 12;
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  const monthlyPayment = monthlyInterestRate === 0
    ? loanAmount / numberOfPayments
    : loanAmount * (
      monthlyInterestRate * (1 + monthlyInterestRate) ** numberOfPayments
    ) / ((1 + monthlyInterestRate) ** numberOfPayments - 1);

  const totalPayments = monthlyPayment * numberOfPayments;

  const monthlyPropertyTaxes = annualPropertyTaxes / 12;
  const monthlyHomeownersInsurance = annualHomeownersInsurance / 12;

  return {
    monthlyPayment,
    monthlyPropertyTaxes,
    monthlyHomeownersInsurance,
    monthlyMortgageInsurance,
    totalMonthlyPayment: monthlyPayment
      + monthlyPropertyTaxes
      + monthlyHomeownersInsurance
      + monthlyMortgageInsurance,
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
    const propertyTaxes = Number(form.elements.propertyTaxes.value);
    const homeownersInsurance = Number(form.elements.homeownersInsurance.value);
    const mortgageInsurance = Number(form.elements.mortgageInsurance.value);

    const additionalCosts = [propertyTaxes, homeownersInsurance, mortgageInsurance];
    if (
      !Number.isFinite(loanAmount)
      || !Number.isFinite(interestRate)
      || !Number.isFinite(loanTerm)
      || additionalCosts.some((cost) => !Number.isFinite(cost))
      || loanAmount <= 0
      || interestRate < 0
      || loanTerm <= 0
      || !Number.isInteger(loanTerm)
      || additionalCosts.some((cost) => cost < 0)
    ) {
      results.hidden = true;
      errorMessage.textContent = "Please enter a positive loan amount, a valid rate, a whole number of years, and costs of zero or more.";
      return;
    }

    errorMessage.textContent = "";
    const payment = calculateMortgage(
      loanAmount,
      interestRate,
      loanTerm,
      propertyTaxes,
      homeownersInsurance,
      mortgageInsurance,
    );

    document.querySelector("#monthly-payment").textContent = formatCurrency(payment.monthlyPayment);
    document.querySelector("#monthly-property-taxes").textContent = formatCurrency(payment.monthlyPropertyTaxes);
    document.querySelector("#monthly-homeowners-insurance").textContent = formatCurrency(payment.monthlyHomeownersInsurance);
    document.querySelector("#monthly-mortgage-insurance").textContent = formatCurrency(payment.monthlyMortgageInsurance);
    document.querySelector("#total-monthly-payment").textContent = formatCurrency(payment.totalMonthlyPayment);
    document.querySelector("#total-payments").textContent = formatCurrency(payment.totalPayments);
    document.querySelector("#total-interest").textContent = formatCurrency(payment.totalInterest);
    results.hidden = false;
  });
}

if (typeof module !== "undefined") {
  module.exports = { calculateMortgage };
}
