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
    : loanAmount * (monthlyInterestRate * (1 + monthlyInterestRate) ** numberOfPayments)
      / ((1 + monthlyInterestRate) ** numberOfPayments - 1);
  const totalPayments = monthlyPayment * numberOfPayments;
  const monthlyPropertyTaxes = annualPropertyTaxes / 12;
  const monthlyHomeownersInsurance = annualHomeownersInsurance / 12;

  return {
    monthlyPayment,
    monthlyPropertyTaxes,
    monthlyHomeownersInsurance,
    monthlyMortgageInsurance,
    totalMonthlyPayment: monthlyPayment + monthlyPropertyTaxes
      + monthlyHomeownersInsurance + monthlyMortgageInsurance,
    totalPayments,
    totalInterest: totalPayments - loanAmount,
  };
}

function compareAmounts(optionA, optionB) {
  if (optionA === optionB) return "tie";
  return optionA < optionB ? "a" : "b";
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function readOption(form, prefix) {
  const value = (name) => Number(form.elements[`${prefix}${name}`].value);
  return {
    loanAmount: value("LoanAmount"),
    interestRate: value("InterestRate"),
    loanTerm: value("LoanTerm"),
    propertyTaxes: value("PropertyTaxes"),
    homeownersInsurance: value("HomeownersInsurance"),
    mortgageInsurance: value("MortgageInsurance"),
    cashToClose: value("CashToClose"),
  };
}

function isValidOption(option) {
  const values = Object.values(option);
  return values.every(Number.isFinite)
    && option.loanAmount > 0
    && option.interestRate >= 0
    && option.loanTerm > 0
    && Number.isInteger(option.loanTerm)
    && option.propertyTaxes >= 0
    && option.homeownersInsurance >= 0
    && option.mortgageInsurance >= 0
    && option.cashToClose >= 0;
}

if (typeof document !== "undefined") {
  const form = document.querySelector("#mortgage-form");
  const results = document.querySelector("#results");
  const errorMessage = document.querySelector("#error-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const options = { a: readOption(form, "a"), b: readOption(form, "b") };

    if (!isValidOption(options.a) || !isValidOption(options.b)) {
      results.hidden = true;
      errorMessage.textContent = "Please review both options. Loan amounts must be positive, terms must be whole years, and all other amounts must be zero or more.";
      return;
    }

    errorMessage.textContent = "";
    Object.entries(options).forEach(([key, option]) => {
      const payment = calculateMortgage(
        option.loanAmount,
        option.interestRate,
        option.loanTerm,
        option.propertyTaxes,
        option.homeownersInsurance,
        option.mortgageInsurance,
      );
      Object.assign(option, payment);
      const card = document.querySelector(`[data-option="${key}"]`);
      const displayed = {
        loanAmount: formatCurrency(option.loanAmount),
        interestRate: `${option.interestRate}%`,
        loanTerm: `${option.loanTerm} years`,
        monthlyPayment: formatCurrency(option.monthlyPayment),
        monthlyMortgageInsurance: formatCurrency(option.monthlyMortgageInsurance),
        monthlyPropertyTaxes: formatCurrency(option.monthlyPropertyTaxes),
        monthlyHomeownersInsurance: formatCurrency(option.monthlyHomeownersInsurance),
        totalMonthlyPayment: formatCurrency(option.totalMonthlyPayment),
        cashToClose: formatCurrency(option.cashToClose),
      };
      Object.entries(displayed).forEach(([name, value]) => {
        card.querySelector(`[data-result="${name}"]`).textContent = value;
      });
    });

    document.querySelectorAll(".featured-result").forEach((element) => {
      element.classList.remove("is-lower", "is-tie");
      element.querySelector("[data-lower-label]").textContent = "";
    });
    [["payment", "totalMonthlyPayment"], ["cash", "cashToClose"]].forEach(([kind, property]) => {
      const winner = compareAmounts(options.a[property], options.b[property]);
      if (winner === "tie") {
        document.querySelectorAll(`[data-comparison="${kind}"]`).forEach((element) => element.classList.add("is-tie"));
      } else {
        const lower = document.querySelector(`[data-option="${winner}"] [data-comparison="${kind}"]`);
        lower.classList.add("is-lower");
        lower.querySelector("[data-lower-label]").textContent = "Lower amount";
      }
    });

    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (typeof module !== "undefined") {
  module.exports = { calculateMortgage, compareAmounts, isValidOption };
}
