// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

// Register Form Handling
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Account created successfully! You can now log in.');
    // Redirect to login page
    window.location.href = "index.html";
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
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
