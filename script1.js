import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

// DOM Elements
const loginForm = document.getElementById("login-form");
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const googleLoginButton = document.getElementById("google-login-button");
const logoutButton = document.getElementById("logout-btn");

// Handle Login with Email/Password
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login Successful!");
    // Redirect to app.html
    window.location.href = "app.html";
  } catch (error) {
    console.error("Login Failed:", error.message);
    alert(`Error: ${error.message}`);
  }
});

// Google Login
googleLoginButton.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  
  try {
    await signInWithPopup(auth, provider);
    alert("Login Successful!");
    // Redirect to app.html
    window.location.href = "app.html";
  } catch (error) {
    console.error("Google Login Failed:", error.message);
    alert(`Error: ${error.message}`);
  }
});

// Handle Logout
logoutButton.addEventListener("click", async () => {
  await signOut(auth);
  appContainer.style.display = "none";
  loginContainer.style.display = "block";
});

// Show/Hide Password
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Change icon based on password visibility
  togglePassword.textContent = type === "password" ? "\u{1F441}" : "\u{1F576}"; // Eye and Eye-slash icons
});

