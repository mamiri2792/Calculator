const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");

const historyButton = document.getElementById("historyButton");
const historyPanel = document.getElementById("historyPanel");
const closeHistory = document.getElementById("closeHistory");
const backdrop = document.getElementById("backdrop");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

const installButton = document.getElementById("installButton");


/* =========================
   CALCULATOR STATE
========================= */

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForNewValue = false;
let currentExpression = "";

let history = JSON.parse(
  localStorage.getItem("calcnova-history") || "[]"
);


/* =========================
   DISPLAY
========================= */

function updateDisplay() {
  display.textContent = currentValue;

  expressionDisplay.textContent = currentExpression;

  display.scrollLeft = display.scrollWidth;
  expressionDisplay.scrollLeft =
    expressionDisplay.scrollWidth;
}


/* =========================
   NUMBER INPUT
========================= */

function inputNumber(number) {

  if (currentValue === "Error") {
    clearCalculator();
  }

  if (waitingForNewValue) {
    currentValue = number;
    waitingForNewValue = false;
  } else if (currentValue === "0") {
    currentValue = number;
  } else {
    currentValue += number;
  }

  updateDisplay();
}


/* =========================
   DECIMAL
========================= */

function inputDecimal() {

  if (currentValue === "Error") {
    clearCalculator();
  }

  if (waitingForNewValue) {
    currentValue = "0.";
    waitingForNewValue = false;
    updateDisplay();
    return;
  }

  if (!currentValue.includes(".")) {
    currentValue += ".";
  }

  updateDisplay();
}


/* =========================
   OPERATOR
========================= */

function chooseOperator(nextOperator) {

  if (currentValue === "Error") {
    return;
  }

  const inputValue = parseFloat(currentValue);

  if (operator && waitingForNewValue) {
    operator = nextOperator;

    updateExpression();

    return;
  }

  if (previousValue === null) {

    previousValue = inputValue;

  } else if (operator) {

    const result = calculate(
      previousValue,
      inputValue,
      operator
    );

    if (result === "Error") {
      currentValue = "Error";
      previousValue = null;
      operator = null;
      currentExpression = "";

      updateDisplay();

      return;
    }

    currentValue = formatNumber(result);
    previousValue = result;
  }

  operator = nextOperator;
  waitingForNewValue = true;

  updateExpression();
  updateDisplay();
}


/* =========================
   EXPRESSION DISPLAY
========================= */

function updateExpression() {

  if (previousValue === null || !operator) {
    currentExpression = "";
    updateDisplay();
    return;
  }

  const operatorSymbol = getOperatorSymbol(operator);

  currentExpression =
    `${formatNumber(previousValue)} ${operatorSymbol}`;

  updateDisplay();
}


function getOperatorSymbol(operation) {

  switch (operation) {

    case "+":
      return "+";

    case "-":
      return "−";

    case "*":
      return "×";

    case "/":
      return "÷";

    default:
      return "";
  }
}


/* =========================
   CALCULATE
========================= */

function calculate(first, second, operation) {

  switch (operation) {

    case "+":
      return first + second;

    case "-":
      return first - second;

    case "*":
      return first * second;

    case "/":

      if (second === 0) {
        return "Error";
      }

      return first / second;

    default:
      return second;
  }
}


/* =========================
   EQUALS
========================= */

function equals() {

  if (
    operator === null ||
    previousValue === null ||
    currentValue === "Error"
  ) {
    return;
  }

  const secondValue = parseFloat(currentValue);

  const result = calculate(
    previousValue,
    secondValue,
    operator
  );

  const readableOperator =
    getOperatorSymbol(operator);

  const fullExpression =
    `${formatNumber(previousValue)} ${readableOperator} ${formatNumber(secondValue)}`;

  if (result === "Error") {

    currentValue = "Error";

  } else {

    currentValue = formatNumber(result);

    addToHistory(
      fullExpression,
      currentValue
    );
  }

  previousValue = null;
  operator = null;
  waitingForNewValue = true;
  currentExpression = "";

  updateDisplay();
}


/* =========================
   CLEAR
========================= */

function clearCalculator() {

  currentValue = "0";
  previousValue = null;
  operator = null;
  waitingForNewValue = false;
  currentExpression = "";

  updateDisplay();
}


/* =========================
   DELETE
========================= */

function deleteLast() {

  if (
    currentValue === "Error" ||
    waitingForNewValue
  ) {
    clearCalculator();
    return;
  }

  if (
    currentValue.length === 1 ||
    (
      currentValue.length === 2 &&
      currentValue.startsWith("-")
    )
  ) {

    currentValue = "0";

  } else {

    currentValue =
      currentValue.slice(0, -1);
  }

  updateDisplay();
}


/* =========================
   POSITIVE / NEGATIVE
========================= */

function toggleSign() {

  if (
    currentValue === "0" ||
    currentValue === "Error"
  ) {
    return;
  }

  currentValue =
    currentValue.startsWith("-")
      ? currentValue.slice(1)
      : "-" + currentValue;

  updateDisplay();
}


/* =========================
   PERCENT
========================= */

function percentage() {

  if (currentValue === "Error") {
    return;
  }

  const value =
    parseFloat(currentValue);

  currentValue =
    formatNumber(value / 100);

  updateDisplay();
}


/* =========================
   NUMBER FORMATTING
========================= */

function formatNumber(number) {

  if (!Number.isFinite(number)) {
    return "Error";
  }

  const rounded =
    Number.parseFloat(
      Number(number).toPrecision(12)
    );

  return String(rounded);
}


/* =========================
   HISTORY
========================= */

function addToHistory(expression, result) {

  const item = {
    expression: expression,
    result: result,
    time: Date.now()
  };

  history.unshift(item);

  /*
    Keep the most recent 50
    calculations.
  */

  history = history.slice(0, 50);

  localStorage.setItem(
    "calcnova-history",
    JSON.stringify(history)
  );

  renderHistory();
}


function renderHistory() {

  historyList.innerHTML = "";

  if (history.length === 0) {

    const empty =
      document.createElement("p");

    empty.className =
      "empty-history";

    empty.textContent =
      "No calculations yet.";

    historyList.appendChild(empty);

    return;
  }

  history.forEach(item => {

    const historyItem =
      document.createElement("div");

    historyItem.className =
      "history-item";


    const expression =
      document.createElement("div");

    expression.className =
      "history-expression";

    expression.textContent =
      item.expression;


    const result =
      document.createElement("div");

    result.className =
      "history-result";

    result.textContent =
      "= " + item.result;


    historyItem.appendChild(expression);
    historyItem.appendChild(result);

    historyList.appendChild(historyItem);
  });
}


function clearHistory() {

  history = [];

  localStorage.removeItem(
    "calcnova-history"
  );

  renderHistory();
}


/* =========================
   HISTORY PANEL
========================= */

function openHistory() {

  historyPanel.classList.add("open");

  historyPanel.setAttribute(
    "aria-hidden",
    "false"
  );

  backdrop.hidden = false;
}


function closeHistoryPanel() {

  historyPanel.classList.remove("open");

  historyPanel.setAttribute(
    "aria-hidden",
    "true"
  );

  backdrop.hidden = true;
}


historyButton.addEventListener(
  "click",
  openHistory
);


closeHistory.addEventListener(
  "click",
  closeHistoryPanel
);


backdrop.addEventListener(
  "click",
  closeHistoryPanel
);


clearHistoryButton.addEventListener(
  "click",
  clearHistory
);


/* =========================
   BUTTON EVENTS
========================= */

document
  .querySelectorAll("[data-number]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        inputNumber(
          button.dataset.number
        );
      }
    );
  });


document
  .querySelectorAll("[data-operator]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        chooseOperator(
          button.dataset.operator
        );
      }
    );
  });


document
  .querySelector('[data-action="decimal"]')
  .addEventListener(
    "click",
    inputDecimal
  );


document
  .querySelector('[data-action="equals"]')
  .addEventListener(
    "click",
    equals
  );


document
  .querySelector('[data-action="clear"]')
  .addEventListener(
    "click",
    clearCalculator
  );


document
  .querySelector('[data-action="delete"]')
  .addEventListener(
    "click",
    deleteLast
  );


document
  .querySelector('[data-action="sign"]')
  .addEventListener(
    "click",
    toggleSign
  );


document
  .querySelector('[data-action="percent"]')
  .addEventListener(
    "click",
    percentage
  );


/* =========================
   KEYBOARD SUPPORT
========================= */

document.addEventListener(
  "keydown",
  event => {

    const key = event.key;


    if (/^[0-9]$/.test(key)) {

      inputNumber(key);

      return;
    }


    if (key === ".") {

      inputDecimal();

      return;
    }


    if (
      ["+", "-", "*", "/"]
        .includes(key)
    ) {

      chooseOperator(key);

      return;
    }


    if (
      key === "Enter" ||
      key === "="
    ) {

      event.preventDefault();

      equals();

      return;
    }


    if (key === "Escape") {

      clearCalculator();

      return;
    }


    if (key === "Backspace") {

      deleteLast();

      return;
    }


    if (key === "%") {

      percentage();
    }
  }
);


/* =========================
   PWA INSTALLATION
========================= */

let deferredInstallPrompt = null;


window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredInstallPrompt = event;

    installButton.hidden = false;
  }
);


installButton.addEventListener(
  "click",
  async () => {

    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();

    const choice =
      await deferredInstallPrompt.userChoice;

    if (
      choice.outcome === "accepted"
    ) {
      installButton.hidden = true;
    }

    deferredInstallPrompt = null;
  }
);


window.addEventListener(
  "appinstalled",
  () => {

    installButton.hidden = true;

    deferredInstallPrompt = null;
  }
);


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .catch(error => {

          console.error(
            "Service worker registration failed:",
            error
          );

        });

    }
  );
}


/* =========================
   START APP
========================= */

renderHistory();
updateDisplay();
