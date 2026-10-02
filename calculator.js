"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const tiers = [
    {min:0,max:150000,rate:0,label:"0 – 150,000"},
    {min:150000,max:300000,rate:.05,label:"150,001 – 300,000"},
    {min:300000,max:500000,rate:.10,label:"300,001 – 500,000"},
    {min:500000,max:750000,rate:.15,label:"500,001 – 750,000"},
    {min:750000,max:1000000,rate:.20,label:"750,001 – 1,000,000"},
    {min:1000000,max:2000000,rate:.25,label:"1,000,001 – 2,000,000"},
    {min:2000000,max:5000000,rate:.30,label:"2,000,001 – 5,000,000"},
    {min:5000000,max:Infinity,rate:.35,label:"5,000,001 ขึ้นไป"}
  ];
  const money=n=>new Intl.NumberFormat("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const percent=n=>`${n*100}%`;
  function renderRates(){
    $("rate-body").innerHTML=tiers.map(t=>`<tr><td>${t.label} บาท</td><td>${t.rate===0?"ยกเว้น":percent(t.rate)}</td><td>${t.rate===0?"0.00":Number.isFinite(t.max)?money((t.max-t.min)*t.rate):"ไม่จำกัด"}</td></tr>`).join("");
  }
  function calculate(e){
    if(e)e.preventDefault();
    const rawIncome=$("monthly-income").value.trim(),rawDeduction=$("deductions").value.trim();
    let valid=true;
    [["income-error",rawIncome,"รายได้","monthly-income"],["deduction-error",rawDeduction,"ค่าลดหย่อน","deductions"]].forEach(([err,raw,label,inputId])=>{
      const input=$(inputId),value=Number(raw);
      if(raw===""||!Number.isFinite(value)||value<0){$(err).textContent=`กรุณากรอก${label}เป็นตัวเลขตั้งแต่ 0 ขึ้นไป`;input.setAttribute("aria-invalid","true");valid=false;}
      else{ $(err).textContent="";input.removeAttribute("aria-invalid");}
    });
    if(!valid)return;
    const annual=Number(rawIncome)*12,deduction=Number(rawDeduction),net=Math.max(0,annual-deduction);
    let total=0;
    $("breakdown-body").innerHTML=tiers.map(t=>{
      const base=Math.max(0,Math.min(net,t.max)-t.min),tax=base*t.rate;total+=tax;
      return `<tr class="${base>0?"active-row":""}"><td>${t.label}</td><td>${money(base)}</td><td>${percent(t.rate)}</td><td>${money(tax)}</td></tr>`;
    }).join("");
    $("annual-income").textContent=`${money(annual)} บาท`;
    $("deduction-total").textContent=`${money(deduction)} บาท`;
    $("net-income").textContent=`${money(net)} บาท`;
    $("tax-total").innerHTML=`${money(total)} <small>บาท/ปี</small>`;
    $("breakdown-total").textContent=`${money(total)} บาท`;
  }
  $("tax-form").addEventListener("submit",calculate);
  $("reset-btn").addEventListener("click",()=>{setTimeout(()=>{ $("income-error").textContent="";$("deduction-error").textContent="";$("monthly-income").removeAttribute("aria-invalid");$("deductions").removeAttribute("aria-invalid");calculate();},0);});
  // Update results as the user types, while retaining submit-time validation.
  ["monthly-income","deductions"].forEach(id=>$(id).addEventListener("input",()=>{if($("monthly-income").value!==""&&$("deductions").value!=="")calculate();}));
  renderRates();calculate();
})();