import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// 🔥 CONFIG REAL DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD3p6FuP5cUKrKcl-b2dmdxsVe7U7Ts6ZE",
  authDomain: "liga-nogales-f3da8.firebaseapp.com",
  projectId: "liga-nogales-f3da8",
  storageBucket: "liga-nogales-f3da8.appspot.com",
  messagingSenderId: "387509589760",
  appId: "1:686651350788:web:3c651a88b9e67b09463a51"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
};

// LOGOUT
window.logout = async function () {
  await signOut(auth);
};

// CONTROL DE SESIÓN
onAuthStateChanged(auth, (user) => {
  const loginBox = document.getElementById("loginBox");
  const appBox = document.getElementById("app");

  if (user) {
    loginBox.classList.add("hidden");
    appBox.classList.remove("hidden");
  } else {
    loginBox.classList.remove("hidden");
    appBox.classList.add("hidden");
  }
});
