import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkJX7v3iX0wfDAvcppz6OnF3nH079LgMw",
  authDomain: "expense-tracker-d5572.firebaseapp.com",
  projectId: "expense-tracker-d5572",
  storageBucket: "expense-tracker-d5572.appspot.com",
  messagingSenderId: "55145542330",
  appId: "1:55145542330:web:086d5d645fabb15e320883",
  measurementId: "G-KFWXCNXN13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const expenseForm = document.getElementById("expense-form");
const expenseHistory = document.getElementById("expense-history");
const totalExpenseEl = document.getElementById("total-expense");
const weeklyExpenseEl = document.getElementById("weekly-expense");
const monthlyExpenseEl = document.getElementById("monthly-expense");
const upiExpenseEl = document.getElementById("upi-expense");
const cashExpenseEl = document.getElementById("cash-expense");
const otherExpenseEl = document.getElementById("other-expense");
const resetButton = document.getElementById("reset-btn");

// Track Totals
let dailyExpense = 0;
let weeklyExpense = 0;
let monthlyExpense = 0;
let dailyUpiExpense = 0;
let dailyCashExpense = 0;
let dailyOtherExpense = 0;

// Ensure User is Logged In
onAuthStateChanged(auth, (user) => {
  if (user) {
    resetDailyExpenseIfNeeded(); // Reset daily totals if needed
    fetchExpenses(user.uid);
  } else {
    alert("Please log in to continue.");
    window.location.href = "index.html";
  }
});

// Add Expense
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

  if (!paymentMethod) {
    alert("Please select a payment method.");
    return;
  }

  try {
    const now = new Date();
    await addDoc(collection(db, "expenses"), {
      userId: user.uid,
      amount,
      description,
      paymentMethod,
      timestamp: now
    });

    alert("Expense added successfully!");
    updateTotals(amount, paymentMethod, now);
    addExpenseToHistory(amount, description, paymentMethod, now);
    expenseForm.reset();
  } catch (error) {
    console.error("Error adding expense:", error);
    alert(`Error: ${error.message}`);
  }
});

// Fetch Expenses from Firestore
async function fetchExpenses(userId) {
  const q = query(collection(db, "expenses"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  const groupedExpenses = {};
  const today = new Date().toLocaleDateString();

  // Reset totals
  dailyExpense = 0;
  dailyUpiExpense = 0;
  dailyCashExpense = 0;
  dailyOtherExpense = 0;
  weeklyExpense = 0;
  monthlyExpense = 0;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const date = new Date(data.timestamp.toDate()).toLocaleDateString();

    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(data);

    const amount = data.amount;
    const method = data.paymentMethod;

    // Update today's total only
    if (date === today) {
      dailyExpense += amount;
      if (method === "UPI") dailyUpiExpense += amount;
      if (method === "Cash") dailyCashExpense += amount;
      if (method === "Other") dailyOtherExpense += amount;
    }

    // Update weekly and monthly totals
    weeklyExpense += amount;
    monthlyExpense += amount;
  });

  // Update UI
  totalExpenseEl.textContent = dailyExpense.toFixed(2);
  weeklyExpenseEl.textContent = weeklyExpense.toFixed(2);
  monthlyExpenseEl.textContent = monthlyExpense.toFixed(2);
  upiExpenseEl.textContent = dailyUpiExpense.toFixed(2);
  cashExpenseEl.textContent = dailyCashExpense.toFixed(2);
  otherExpenseEl.textContent = dailyOtherExpense.toFixed(2);

  // Render grouped expenses
  renderGroupedExpenses(groupedExpenses);
}

// Update Totals
function updateTotals(amount, method, timestamp) {
  const today = new Date().toDateString();
  const expenseDate = new Date(timestamp).toDateString();

  if (expenseDate === today) {
    dailyExpense += amount;
    if (method === "UPI") dailyUpiExpense += amount;
    if (method === "Cash") dailyCashExpense += amount;
    if (method === "Other") dailyOtherExpense += amount;
  }

  weeklyExpense += amount;
  monthlyExpense += amount;

  totalExpenseEl.textContent = dailyExpense.toFixed(2);
  weeklyExpenseEl.textContent = weeklyExpense.toFixed(2);
  monthlyExpenseEl.textContent = monthlyExpense.toFixed(2);
  upiExpenseEl.textContent = dailyUpiExpense.toFixed(2);
  cashExpenseEl.textContent = dailyCashExpense.toFixed(2);
  otherExpenseEl.textContent = dailyOtherExpense.toFixed(2);
}

// Render Grouped Expenses
function renderGroupedExpenses(groupedExpenses) {
  expenseHistory.innerHTML = "";

  Object.keys(groupedExpenses).forEach((date) => {
    const dateSection = document.createElement("li");
    dateSection.textContent = date;
    dateSection.style.fontWeight = "bold";
    dateSection.style.marginTop = "10px";
    expenseHistory.appendChild(dateSection);

    groupedExpenses[date].forEach((expense) => {
      const li = document.createElement("li");
      li.textContent = `₹${expense.amount} - ${expense.paymentMethod} - ${expense.description}`;
      expenseHistory.appendChild(li);
    });
  });
}

// Reset Daily Expense If Needed
function resetDailyExpenseIfNeeded() {
  const now = new Date();
  const todayDate = now.toDateString();
  const lastResetDate = localStorage.getItem("lastReset") || todayDate;

  // Check if it's a new day
  if (lastResetDate !== todayDate) {
    dailyExpense = 0;
    dailyUpiExpense = 0;
    dailyCashExpense = 0;
    dailyOtherExpense = 0;

    localStorage.setItem("lastReset", todayDate); // Update the reset date

    // Update UI
    totalExpenseEl.textContent = dailyExpense.toFixed(2);
    upiExpenseEl.textContent = dailyUpiExpense.toFixed(2);
    cashExpenseEl.textContent = dailyCashExpense.toFixed(2);
    otherExpenseEl.textContent = dailyOtherExpense.toFixed(2);
  }
}

// Logout Functionality
document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("You have been logged out.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout Error:", error.message);
    alert(`Error: ${error.message}`);
  }
});




// Add Expense to History
function addExpenseToHistory(amount, description, paymentMethod, timestamp) {
  const date = new Date(timestamp).toLocaleDateString();

  // Check if a section for this date already exists
  let dateSection = document.querySelector(`#date-${date.replace(/\//g, '-')}`);
  if (!dateSection) {
    dateSection = document.createElement("div");
    dateSection.id = `date-${date.replace(/\//g, '-')}`;
    dateSection.className = "date-section";
    dateSection.style.backgroundColor = "#f0f8ff"; // Light blue background for date
    dateSection.style.padding = "10px";
    dateSection.style.fontWeight = "bold";
    dateSection.style.marginTop = "15px";
    dateSection.textContent = date; // Add date as a header
    expenseHistory.appendChild(dateSection);
  }

  // Create a single line of text for the expense
  const expenseItem = document.createElement("div");
  expenseItem.className = "expense-item";
  expenseItem.style.backgroundColor = "#f8f8f8"; // Light grey background for items
  expenseItem.style.margin = "5px 0"; // Spacing between items
  expenseItem.style.padding = "8px";
  expenseItem.style.borderRadius = "5px";
  expenseItem.textContent = `₹${amount} - ${paymentMethod} - ${description}`;

  // Append the expense item to the date section
  dateSection.appendChild(expenseItem);
}

