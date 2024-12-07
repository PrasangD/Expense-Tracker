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
const upiExpenseEl = document.getElementById("upi-expense");
const cashExpenseEl = document.getElementById("cash-expense");
const otherExpenseEl = document.getElementById("other-expense");
const resetButton = document.getElementById('reset-btn'); // Reset button reference

// Track Totals
let totalExpense = 0;
let upiExpense = 0;
let cashExpense = 0;
let otherExpense = 0;

// Ensure User is Logged In
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchExpenses(user.uid);
  } else {
    alert("Please log in to continue.");
    window.location.href = "login.html";
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
    await addDoc(collection(db, "expenses"), {
      userId: user.uid,
      amount,
      description,
      paymentMethod,
      timestamp: new Date()
    });

    alert("Expense added successfully!");
    updateTotals(amount, paymentMethod);
    addExpenseToHistory(amount, description, paymentMethod);
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

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    updateTotals(data.amount, data.paymentMethod);
    addExpenseToHistory(data.amount, data.description, data.paymentMethod);
  });
}

// Update Totals
function updateTotals(amount, method) {
  totalExpense += amount;
  totalExpenseEl.textContent = totalExpense.toFixed(2);

  if (method === "UPI") upiExpense += amount;
  if (method === "Cash") cashExpense += amount;
  if (method === "Other") otherExpense += amount;

  upiExpenseEl.textContent = upiExpense.toFixed(2);
  cashExpenseEl.textContent = cashExpense.toFixed(2);
  otherExpenseEl.textContent = otherExpense.toFixed(2);
}

// Add Expense to History
function addExpenseToHistory(amount, description, method) {
  const li = document.createElement("li");
  li.textContent = `₹${amount} - ${method} - ${description}`;
  expenseHistory.appendChild(li);
}

// Reset the form and totals on frontend (does not affect Firebase)
resetButton.addEventListener('click', () => {
  // Reset form fields
  document.getElementById("expense-form").reset();

  // Clear totals
  totalExpense = 0;
  upiExpense = 0;
  cashExpense = 0;
  otherExpense = 0;

  // Update displayed totals
  totalExpenseEl.textContent = '0.00';
  upiExpenseEl.textContent = '0.00';
  cashExpenseEl.textContent = '0.00';
  otherExpenseEl.textContent = '0.00';

  // Clear expense history list
  expenseHistory.innerHTML = ''; 
});


// DOM Element
const logoutButton = document.getElementById("logout-btn");

// Logout Functionality
logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("You have been logged out.");
    // Redirect to login page
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout Error:", error.message);
    alert(`Error: ${error.message}`);
  }
});
