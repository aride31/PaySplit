const peopleList = document.getElementById("peopleList");
const addPersonBtn = document.getElementById("addPersonBtn");
const splitBtn = document.getElementById("splitBtn");
const resetBtn = document.getElementById("resetBtn");
const totalAmountInput = document.getElementById("totalAmount");
const results = document.getElementById("results");
const shareText = document.getElementById("shareText");
const tipButtons = [...document.querySelectorAll(".tip-btn")];
const customTipInput = document.getElementById("customTip");

let selectedTip = null;
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function addPerson(name = "", extra = "") {
  const row = document.createElement("div");
  row.className = "person-row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Name";
  nameInput.value = name;

  const extraInput = document.createElement("input");
  extraInput.type = "number";
  extraInput.placeholder = "Extra $";
  extraInput.inputMode = "decimal";
  extraInput.min = "0";
  extraInput.step = "0.01";
  extraInput.value = extra;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";

  removeBtn.addEventListener("click", () => {
    row.remove();
    renderSplit();
  });

  nameInput.addEventListener("input", renderSplit);
  extraInput.addEventListener("input", renderSplit);

  row.append(nameInput, extraInput, removeBtn);
  peopleList.appendChild(row);
}

function getPeople() {
  return [...document.querySelectorAll(".person-row")]
    .map((row) => {
      const [nameInput, extraInput] = row.querySelectorAll("input");
      const name = nameInput.value.trim();
      let extra = Number(extraInput.value || 0);
      if (extra < 0) {
        extraInput.value = "";
        extra = 0;
      }
      return { name, extra };
    })
    .filter((person) => person.name.length > 0);
}

function getTipPercent() {
  if (selectedTip === null) return 0;
  if (selectedTip === "custom") return Math.max(0, Number(customTipInput.value) || 0);
  return Number(selectedTip);
}

function renderSplit() {
  if (Number(totalAmountInput.value) < 0) totalAmountInput.value = "";
  if (Number(customTipInput.value) < 0) customTipInput.value = "";

  const subtotal = Number(totalAmountInput.value);
  const people = getPeople();

  if (!subtotal || subtotal <= 0) {
    results.innerHTML = '<p class="note">Please enter a subtotal greater than $0.00.</p>';
    shareText.value = "";
    return;
  }
  if (people.length === 0) {
    results.innerHTML = '<p class="note">Please add at least one person name.</p>';
    shareText.value = "";
    return;
  }

  const tipPercent = getTipPercent();
  const tipAmount = subtotal * (tipPercent / 100);
  const totalWithTip = subtotal + tipAmount;
  const baseShare = totalWithTip / people.length;

  const peopleRows = people
    .map((person) => {
      const finalAmount = baseShare + person.extra;
      return `<div class="result-item"><span>${person.name}</span><strong>${currencyFormatter.format(finalAmount)}</strong></div>`;
    })
    .join("");

  results.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><strong>${currencyFormatter.format(subtotal)}</strong></div>
    <div class="summary-row"><span>Tip (${tipPercent.toFixed(1)}%)</span><strong>${currencyFormatter.format(tipAmount)}</strong></div>
    <div class="summary-row total"><span>Total with tip</span><strong>${currencyFormatter.format(totalWithTip)}</strong></div>
    <div class="summary-row total"><span>Equal base split per person</span><strong>${currencyFormatter.format(baseShare)}</strong></div>
    ${peopleRows}
  `;

  shareText.value = `PaySplit Summary\nSubtotal: ${currencyFormatter.format(subtotal)}\nTip (${tipPercent.toFixed(1)}%): ${currencyFormatter.format(tipAmount)}\nTotal with tip: ${currencyFormatter.format(totalWithTip)}\nEqual base split per person: ${currencyFormatter.format(baseShare)}\n\n${people
    .map((person) => `${person.name}: ${currencyFormatter.format(baseShare + person.extra)} (includes extra ${currencyFormatter.format(person.extra)})`)
    .join("\n")}`;
}

function setTipSelection(value) {
  selectedTip = value;
  tipButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tip === value));
  const isCustom = value === "custom";
  customTipInput.classList.toggle("hidden", !isCustom);
  if (!isCustom) customTipInput.value = "";
  renderSplit();
}

function resetApp() {
  totalAmountInput.value = "";
  peopleList.innerHTML = "";
  addPerson("Person 1", "");
  addPerson("Person 2", "");
  selectedTip = null;
  tipButtons.forEach((btn) => btn.classList.remove("active"));
  customTipInput.classList.add("hidden");
  customTipInput.value = "";
  results.innerHTML = '<p class="note">Enter subtotal, tip (optional), and names, then tap Calculate split.</p>';
  shareText.value = "";
}

addPersonBtn.addEventListener("click", () => addPerson());
splitBtn.addEventListener("click", renderSplit);
resetBtn.addEventListener("click", resetApp);
totalAmountInput.addEventListener("input", renderSplit);
customTipInput.addEventListener("input", renderSplit);
tipButtons.forEach((btn) => btn.addEventListener("click", () => setTipSelection(btn.dataset.tip)));

resetApp();
