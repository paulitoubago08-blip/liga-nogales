import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🔥 CONFIG REAL DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD3p6FuP5cUKrKcl-b2dmdxsVe7U7Ts6ZE",
  authDomain: "liga-nogales-f3da8.firebaseapp.com",
  projectId: "liga-nogales",
  storageBucket: "liga-nogales.firebasestorage.app",
  messagingSenderId: "686651350788",
  appId: "1:686651350788:web:3c651a88b9e67b09463a51"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
// 🏆 CREAR TORNEO
window.crearTorneo = async function () {
  const nombre = document.getElementById("t_nombre").value;
  const deporte = document.getElementById("t_deporte").value;
  const tipo = document.getElementById("t_tipo").value;
  console.log ("Datos:", nombre, deporte, tipo);

  if (!nombre || !tipo) {
    alert("Completa todos los campos");
    return;
  }

  try {
    await addDoc(collection(db, "torneos"), {
      nombre: nombre,
      deporte: deporte,
      tipo: tipo,
      creado: serverTimestamp(),
      activo: true
    });

    document.getElementById("torneoActivo").innerText =
      "Torneo activo: " + nombre;

    alert("Torneo creado correctamente");
  } catch (error) {
    console.error("ERROR FIRESTORE:", error);
    alert("Error al crear torneo: " + error.message);
  }
};
// 🏃‍♂️ CREAR EQUIPO
window.crearEquipo = async function () {
  console.log("crearEquipo ejecutando");
  const nombre = document.getElementById("eq_nombre").value;
  const grupo = document.getElementById("eq_grupo").value;
  const roster = document
    .getElementById("eq_roster")
    .value
    .split("\n")
    .filter(j => j.trim() !== "");

  if (!nombre) {
    alert("Falta el nombre del equipo");
    return;
  }

  try {
    await addDoc(collection(db, "equipos"), {
      nombre,
      grupo,
      jugadores: roster,
      pj: 0,
      gf: 0,
      gc: 0,
      dif: 0,
      pts: 0,
      creado: serverTimestamp()
    });

    alert("✅ Equipo agregado");

    // limpiar campos
    document.getElementById("eq_nombre").value = "";
    document.getElementById("eq_grupo").value = "";
    document.getElementById("eq_roster").value = "";

  } catch (error) {
    alert("❌ Error al crear equipo");
    console.error(error);
  }
};
