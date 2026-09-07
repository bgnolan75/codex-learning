const test = require("node:test");
const assert = require("node:assert/strict");

const { calculateMortgage, compareAmounts, isValidOption } = require("./script");

test("keeps the fixed-rate principal-and-interest calculation", () => {
  const result = calculateMortgage(300000, 6.5, 30);
  assert.ok(Math.abs(result.monthlyPayment - 1896.2041) < 0.001);
  assert.ok(Math.abs(result.totalPayments - 682633.47) < 0.01);
  assert.ok(Math.abs(result.totalInterest - 382633.47) < 0.01);
});

test("adds monthly taxes and insurance to the estimated payment", () => {
  const result = calculateMortgage(300000, 6.5, 30, 4800, 1800, 125);
  assert.equal(result.monthlyPropertyTaxes, 400);
  assert.equal(result.monthlyHomeownersInsurance, 150);
  assert.equal(result.monthlyMortgageInsurance, 125);
  assert.ok(Math.abs(result.totalMonthlyPayment - 2571.2041) < 0.001);
});

test("supports a zero-interest loan and zero additional costs", () => {
  const result = calculateMortgage(120000, 0, 10);
  assert.equal(result.monthlyPayment, 1000);
  assert.equal(result.totalMonthlyPayment, 1000);
  assert.equal(result.totalInterest, 0);
});

test("identifies either lower option and treats matching amounts as a tie", () => {
  assert.equal(compareAmounts(1000, 1200), "a");
  assert.equal(compareAmounts(1200, 1000), "b");
  assert.equal(compareAmounts(1000, 1000), "tie");
});

test("validates all comparison inputs", () => {
  const option = { loanAmount: 300000, interestRate: 6.5, loanTerm: 30, propertyTaxes: 4800, homeownersInsurance: 1800, mortgageInsurance: 0, cashToClose: 25000 };
  assert.equal(isValidOption(option), true);
  assert.equal(isValidOption({ ...option, loanAmount: 0 }), false);
  assert.equal(isValidOption({ ...option, loanTerm: 30.5 }), false);
  assert.equal(isValidOption({ ...option, cashToClose: -1 }), false);
});
