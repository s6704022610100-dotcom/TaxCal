"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const tiers = [
    { min: 0, max: 150000, rate: 0, label: "0 – 150,000" },
    { min: 150000, max: 300000, rate: .05, label: "150,001 – 300,000" },
    { min: 300000, max: 500000, rate: .10, label: "300,001 – 500,000" },
    { min: 500000, max: 750000, rate: .15, label: "500,001 – 750,000" },
    { min: 750000, max: 1000000, rate: .20, label: "750,001 – 1,000,000" },
    { min: 1000000, max: 2000000, rate: .25, label: "1,000,001 – 2,000,000" },
    { min: 2000000, max: 5000000, rate: .30, label: "2,000,001 – 5,000,000" },
    { min: 5000000, max: Infinity, rate: .35, label: "5,000,001 ขึ้นไป" }
  ];
  const money = (n) => new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const rate = (n) => `${n * 100}%`;

  function renderRates() {
    $("rate-body").innerHTML = tiers.map(t =>
      `<tr><td>${t.label} บาท</td><td>${t.rate === 0 ? "ยกเว้น" : rate(t.rate)}</td></tr>`
    ).join("");
  }

  function calculate(event) {
    if (event) event.preventDefault();
    const incomeInput = $("monthly-income");
    const deductionInput = $("deductions");
    const monthly = incomeInput.value.trim();
    const deductionText = deductionInput.value.trim();
    let valid = true;

    $("income-error").textContent = "";
    $("deduction-error").textContent = "";
    for (const [raw, input, error, label] of [
      [monthly, incomeInput, $("income-error"), "รายได้"],
      [deductionText, deductionInput, $("deduction-error"), "ค่าลดหย่อน"]
    ]) {
      const value = Number(raw);
      if (raw === "" || !Number.isFinite(value) || value < 0) {
        error.textContent = `กรุณากรอก${label}เป็นตัวเลขตั้งแต่ 0 ขึ้นไป`;
        input.setAttribute("aria-invalid", "true");
        valid = false;
      } else {
        input.removeAttribute("aria-invalid");
      }
    }
    if (!valid) return;

    const annual = Number(monthly) * 12;
    const deductions = Number(deductionText);
    const net = Math.max(0, annual - deductions);
    let totalTax = 0;

    const rows = tiers.map((tier) => {
      const taxable = Math.max(0, Math.min(net, tier.max) - tier.min);
      const tax = taxable * tier.rate;
      totalTax += tax;
      const active = taxable > 0 ? "active-row" : "";
      return `<tr class="${active}"><td>${tier.label}</td><td>${money(taxable)}</td><td>${rate(tier.rate)}</td><td>${money(tax)}</td></tr>`;
    }).join("");

    $("annual-income").textContent = `${money(annual)} บาท`;
    $("deduction-total").textContent = `${money(deductions)} บาท`;
    $("net-income").textContent = `${money(net)} บาท`;
    $("tax-total").innerHTML = `${money(totalTax)} <small>บาท</small>`;
    $("breakdown-body").innerHTML = rows;
    $("breakdown-total").textContent = `${money(totalTax)} บาท`;
  }

  $("tax-form").addEventListener("submit", calculate);
  $("reset-btn").addEventListener("click", () => {
    $("tax-form").reset();
    $("income-error").textContent = "";
    $("deduction-error").textContent = "";
    $("monthly-income").removeAttribute("aria-invalid");
    $("deductions").removeAttribute("aria-invalid");
    calculate();
  });
  renderRates();
  calculate();
})();
