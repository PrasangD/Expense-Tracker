import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
let upiExpense = 0;
let cashExpense = 0;
let otherExpense = 0;

// Ensure User is Logged In
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchExpenses(user.uid);
    resetDailyExpenseIfNeeded();
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
      timestamp: now,
    });

    alert("Expense added successfully!");
    updateTotals(amount, paymentMethod);
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

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const date = new Date(data.timestamp.toDate()).toLocaleDateString();

    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(data);

    updateTotals(data.amount, data.paymentMethod);
  });

  // Render grouped expenses
  renderGroupedExpenses(groupedExpenses);
}

// Update Totals
function updateTotals(amount, method) {
  const now = new Date();
  dailyExpense += amount;
  weeklyExpense += amount;
  monthlyExpense += amount;

  totalExpenseEl.textContent = dailyExpense.toFixed(2);
  weeklyExpenseEl.textContent = weeklyExpense.toFixed(2);
  monthlyExpenseEl.textContent = monthlyExpense.toFixed(2);

  if (method === "UPI") upiExpense += amount;
  if (method === "Cash") cashExpense += amount;
  if (method === "Other") otherExpense += amount;

  upiExpenseEl.textContent = upiExpense.toFixed(2);
  cashExpenseEl.textContent = cashExpense.toFixed(2);
  otherExpenseEl.textContent = otherExpense.toFixed(2);
}

// Render Grouped Expenses
function renderGroupedExpenses(groupedExpenses) {
  expenseHistory.innerHTML = "";

  Object.keys(groupedExpenses).forEach((date) => {
    const dateSection = document.createElement("li");
    dateSection.textContent = date;
    dateSection.style.backgroundColor = "#f0f8ff"; // Light blue background for date
    dateSection.style.padding = "10px";
    dateSection.style.fontWeight = "bold";
    dateSection.style.marginTop = "15px";
    expenseHistory.appendChild(dateSection);

    groupedExpenses[date].forEach((expense) => {
      const li = document.createElement("li");
      li.textContent = `₹${expense.amount} - ${expense.paymentMethod} - ${expense.description}`;
      expenseHistory.appendChild(li);
    });
  });
}

// Add Expense to History
function addExpenseToHistory(amount, description, paymentMethod, timestamp) {
  const formattedDate = new Date(timestamp).toLocaleDateString();
  const li = document.createElement("li");
  li.textContent = `₹${amount} - ${paymentMethod} - ${description}`;
  
  // Check if a date section exists for the current date
  let dateSection = document.querySelector(`[data-date="${formattedDate}"]`);
  if (!dateSection) {
    dateSection = document.createElement("li");
    dateSection.textContent = formattedDate;
    dateSection.style.backgroundColor = "#f0f8ff"; // Light blue background for date
    dateSection.style.padding = "10px";
    dateSection.style.fontWeight = "bold";
    dateSection.style.marginTop = "15px";
    dateSection.setAttribute("data-date", formattedDate);
    expenseHistory.appendChild(dateSection);
  }
  
  // Add the new expense to the current date section
  dateSection.appendChild(li);
}

// Reset Daily Expense If Needed
function resetDailyExpenseIfNeeded() {
  const now = new Date();
  const lastReset = localStorage.getItem("lastReset") || now.toDateString();

  if (lastReset !== now.toDateString()) {
    dailyExpense = 0;
    localStorage.setItem("lastReset", now.toDateString());
    totalExpenseEl.textContent = dailyExpense.toFixed(2);
  }

  // Schedule Reset at Midnight
  const timeToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  setTimeout(resetDailyExpenseIfNeeded, timeToMidnight);
}

// Reset Current Day Expenses
resetButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const now = new Date();
  const today = now.toDateString();

  // Remove Expenses from Firestore for Today
  const q = query(
    collection(db, "expenses"),
    where("userId", "==", user.uid),
    where("timestamp", ">=", new Date().setHours(0, 0, 0, 0)),
    where("timestamp", "<=", new Date().setHours(23, 59, 59, 999))
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  // Reset UI and Totals
  dailyExpense = 0;
  totalExpenseEl.textContent = dailyExpense.toFixed(2);
  expenseHistory.innerHTML = "";
  alert("Today's expenses have been reset.");
});

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
