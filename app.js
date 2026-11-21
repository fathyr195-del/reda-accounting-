
const defaultAccounts = [
  {name:"الصندوق",type:"أصول"},
  {name:"البنك",type:"أصول"},
  {name:"رأس المال",type:"حقوق ملكية"},
  {name:"المبيعات",type:"إيرادات"},
  {name:"مصروفات عمومية",type:"مصروفات"}
];

let accounts = JSON.parse(localStorage.getItem("ra_accounts") || "null") || defaultAccounts;
let entries = JSON.parse(localStorage.getItem("ra_entries") || "[]");

const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toLocaleString("ar-EG", {
  minimumFractionDigits:2,
  maximumFractionDigits:2
});

function save() {
  localStorage.setItem("ra_accounts", JSON.stringify(accounts));
  localStorage.setItem("ra_entries", JSON.stringify(entries));
  render();
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(x =>
    x.classList.toggle("active", x.id === page)
  );
  document.querySelectorAll("nav button").forEach(x =>
    x.classList.toggle("active", x.dataset.page === page)
  );
}

document.querySelectorAll("nav button").forEach(button => {
  button.onclick = () => showPage(button.dataset.page);
});

$("accountForm").onsubmit = e => {
  e.preventDefault();
  accounts.push({
    name:$("accountName").value.trim(),
    type:$("accountType").value
  });
  $("accountName").value = "";
  save();
};

$("entryForm").onsubmit = e => {
  e.preventDefault();

  const amount = Number($("entryAmount").value);
  const debit = $("debitAccount").value;
  const credit = $("creditAccount").value;

  if (!debit || !credit || debit === credit || amount <= 0) {
    alert("اختر حسابين مختلفين وأدخل مبلغًا صحيحًا");
    return;
  }

  entries.unshift({
    date:$("entryDate").value,
    note:$("entryNote").value,
    debit,
    credit,
    amount
  });

  $("entryNote").value = "";
  $("entryAmount").value = "";
  save();
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function render() {
  $("accountsList").innerHTML = accounts.map(a =>
    `<div class="item"><b>${esc(a.name)}</b><span>${esc(a.type)}</span></div>`
  ).join("");

  const options = accounts.map(a =>
    `<option>${esc(a.name)}</option>`
  ).join("");

  $("debitAccount").innerHTML = options;
  $("creditAccount").innerHTML = options;

  $("entriesList").innerHTML = entries.map(x =>
    `<div class="item">
      <div>
        <b>${esc(x.note)}</b>
        <div>${esc(x.date)} · مدين: ${esc(x.debit)} / دائن: ${esc(x.credit)}</div>
      </div>
      <strong>${money(x.amount)} ج</strong>
    </div>`
  ).join("") || "لا توجد قيود مسجلة حتى الآن.";

  const total = entries.reduce((sum,x) => sum + x.amount, 0);

  $("entryCount").textContent = entries.length;
  $("accountCount").textContent = accounts.length;
  $("debitTotal").textContent = money(total);
  $("rDebit").textContent = money(total);
  $("rCredit").textContent = money(total);
  $("rDiff").textContent = money(0);
}

function exportData() {
  const blob = new Blob(
    [JSON.stringify({accounts,entries},null,2)],
    {type:"application/json"}
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "reda-accounting-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

$("entryDate").value = new Date().toISOString().slice(0,10);
render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
