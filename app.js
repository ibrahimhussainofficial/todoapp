// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

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
      // switchToApp(userCredential.user);
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
  renderTodo(user.uid);
}

// Firestore references
const todosCollection = collection(db, "todos");

// Todo Functions
const userInp = document.getElementById("userInp");
const todosContainer = document.getElementById("todosContainer");

// Add todo to Firestore
async function addTodo() {
  const user = auth.currentUser;
  if (user && userInp.value.trim() !== "") {
    try {
      await addDoc(todosCollection, {
        text: userInp.value.trim(),
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      userInp.value = "";
      renderTodo(user.uid);
    } catch (error) {
      console.error("Error adding todo: ", error);
    }
  } else {
    alert("Please enter a todo item!");
  }
}

async function dltAll() {
  const user = auth.currentUser;

  if (!user) {
    alert("You need to sign in to delete todos.");
    return;
  }

  // Query to fetch todos for the current user
  const todosQuery = query(
    collection(db, "todos"),
    where("userId", "==", user.uid)
  );

  try {
    const snapshot = await getDocs(todosQuery);

    if (snapshot.empty) {
      alert("No todos to delete!");
      return;
    }

    // Create a batch instance
    const batch = writeBatch(db);

    // Add each todo to the batch for deletion
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit the batch
    await batch.commit();

    alert("All todos deleted successfully.");
    renderTodo(user.uid); // Re-render the todos
  } catch (error) {
    console.error("Error deleting all todos:", error);
    alert("Failed to delete all todos. Please try again.");
  }
}

async function editTodo(id, currentText) {
  const updatedTodo = prompt("Edit your todo here", currentText);
  if (updatedTodo !== null && updatedTodo.trim() !== "") {
    try {
      await updateDoc(doc(db, "todos", id), {
        text: updatedTodo.trim(), // Corrected variable name
        timestamp: serverTimestamp(),
      });
      renderTodo(auth.currentUser.uid); // Re-render the list
    } catch (error) {
      console.error("Error editing todo:", error);
      alert("Failed to edit todo. Please try again.");
    }
  } else {
    alert("Todo text cannot be empty!");
  }
}

// Delete a specific todo from Firestore
async function deleteTodo(id) {
  try {
    // const todoDoc = doc(db, "todos", todoId);
    await deleteDoc(doc(db, "todos", id));
    renderTodo(auth.currentUser.uid);
  } catch (error) {
    console.error("Error deleting todo: ", error);
  }
}

async function renderTodo(userId) {
  todosContainer.innerHTML = ""; // Clear the container

  const todosQuery = query(
    collection(db, "todos"),
    where("userId", "==", userId),
    orderBy("timestamp", "asc")
  );

  try {
    console.log("Fetching todos for userId:", userId);
    const snapshot = await getDocs(todosQuery);

    if (snapshot.empty) {
      console.log("No todos found for userId:", userId);
      todosContainer.innerHTML = "<li>No todos found</li>";
      return;
    }
    snapshot.forEach((doc) => {
      const todo = doc.data();
      console.log("Fetched todo:", { id: doc.id, ...todo });
      renderTodoItem(doc.id, todo.text);
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    todosContainer.innerHTML = "<li>Error loading todos</li>";
  }
}

function renderTodoItem(id, text) {
  const todoItem = document.createElement("li");

  todoItem.innerHTML = `
    <p id="text">${text}</p>
    <button onclick="editTodo('${id}', '${text.replace(
    /'/g,
    "\\'"
  )}')">Edit</button>
    <button onclick="deleteTodo('${id}')">Delete</button>
  `;

  todosContainer.appendChild(todoItem);
}

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
window.switchToApp = switchToApp;
window.renderTodo = renderTodo;
window.renderTodoItem = renderTodoItem;
