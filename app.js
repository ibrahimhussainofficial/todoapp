// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWZARGv29KBBUGutusl3OKda_JcOjvlQ8",
  authDomain: "todo-app-7af5f.firebaseapp.com",
  projectId: "todo-app-7af5f",
  storageBucket: "todo-app-7af5f.firebasestorage.app",
  messagingSenderId: "774819130698",
  appId: "1:774819130698:web:a56aef1157457660e3e5b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Authentication elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const userEmailDisplay = document.getElementById("user-email");

// Authentication Functions
function signUp() {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Sign Up Successful!");
      switchToApp(userCredential.user);
    })
    .catch((error) => {
      console.error("Error signing up: ", error);
      alert(error.message);
    });
}

function signIn() {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Sign In Successful!");
      switchToApp(userCredential.user);
    })
    .catch((error) => {
      console.error("Error signing in: ", error);
      alert(error.message);
    });
}

function signOut() {
  auth
    .signOut()
    .then(() => {
      alert("Sign Out Successful!");
      authSection.style.display = "block";
      appSection.style.display = "none";
    })
    .catch((error) => {
      console.error("Error signing out: ", error);
    });
}

// Switch to app section
function switchToApp(user) {
  authSection.style.display = "none";
  appSection.style.display = "block";
  userEmailDisplay.textContent = user.email;
  renderTodo();
}

// Todo Functions
const userInp = document.getElementById("userInp");
const todosContainer = document.getElementById("todosContainer");
let todos = [];

function addTodo() {
  if (userInp.value.trim() !== "") {
    todos.push(userInp.value.trim());
    userInp.value = "";
    renderTodo();
  } else {
    alert("Please enter a todo item!");
  }
}

function dltAll() {
  todos = [];
  renderTodo();
}

function editTodo(editIndex) {
  const updatedTodo = prompt("Edit your todo here", todos[editIndex]);
  if (updatedTodo !== null && updatedTodo.trim() !== "") {
    todos[editIndex] = updatedTodo.trim();
    renderTodo();
  }
}

function deleteTodo(deleteIndex) {
  todos.splice(deleteIndex, 1);
  renderTodo();
}

function renderTodo() {
  todosContainer.innerHTML = "";
  for (let i = 0; i < todos.length; i++) {
    todosContainer.innerHTML += `
        <li>
          <p id="text">${todos[i]}</p>
          <button onclick="editTodo(${i})">Edit</button>
          <button onclick="deleteTodo(${i})">Delete</button>
        </li>
      `;
  }
}

// Monitor auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    switchToApp(user);
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});

// Expose functions to the global window object
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.addTodo = addTodo;
window.dltAll = dltAll;
window.editTodo = editTodo;
window.deleteTodo = deleteTodo;
