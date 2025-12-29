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
// Torneo activo (global)
let torneoActivoId = null;

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
if (!torneoActivoId) {
  alert("Primero crea un torneo");
  return;
}
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
    const docRef = await addDoc(collection(db, "torneos"), {
      nombre: nombre,
      deporte: deporte,
      tipo: tipo,
      creado: serverTimestamp(),
      activo: true
    });
    torneoActivoId = docRef.id; 

    document.getElementById("torneoActivo").innerText =
      "Torneo activo: " + nombre;

    alert("Torneo creado correctamente");
  } catch (error) {
    console.error("ERROR FIRESTORE:", error);
    alert("Error al crear torneo: " + error.message);
  }
};
// CREAR EQUIPO
// ================================
window.crearEquipo = async function () {
  const nombre = document.getElementById("eq_nombre").value;
  const grupo = document.getElementById("eq_grupo").value;
  const roster = document.getElementById("eq_roster").value;

  if (!nombre || !grupo) {
    alert("Completa nombre y grupo");
    return;
  }

  try {
    await addDoc(collection(db, "equipos"), {
      nombre,
      grupo,
      roster,
      torneoId: torneoActivoId,
      pj:0,
      gf:0,
      gc:0,
      dif:0,
      pts:0,
      creado: serverTimestamp()
    });
    cargarEquipos();
    cargarTabla();
    cargarSelectEquipos();
    

    // limpiar campos
    document.getElementById("eq_nombre").value = "";
    document.getElementById("eq_grupo").value = "";
    document.getElementById("eq_roster").value = "";

  } catch (error) {
    alert("❌ Error al crear equipo");
    console.error(error);
  }
};

// ================================
// CARGAR EQUIPOS EN PANTALLA
// ================================
async function cargarEquipos() {
  const lista = document.getElementById("listaEquipos");
  lista.innerHTML = "";

  const q = query(
    collection(db, "equipos"),
    where("torneoId", "==", torneoActivoId)
    );
  const snap = await getDocs(q);

  snap.forEach(docu => {
    const e = docu.data();
    const li = document.createElement("li");
    li.textContent = `${e.nombre} (Grupo ${e.grupo})`;
    lista.appendChild(li);
  });
}
// ===============================
// 📊 CARGAR TABLA DE POSICIONES
// ===============================
async function cargarTabla() {
  const tabla = document.getElementById("tablaPosiciones");
  tabla.innerHTML = "";

  const q = query(collection(db, "equipos"));
  const snap = await getDocs(q);

  snap.forEach(docu => {
    const e = docu.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${e.nombre}</td>
      <td>${e.pj || 0}</td>
      <td>${e.gf || 0}</td>
      <td>${e.gc || 0}</td>
      <td>${(e.gf || 0) - (e.gc || 0)}</td>
      <td>${e.pts || 0}</td>
    `;

    tabla.appendChild(tr);
  });
}
async function cargarTablaPosiciones() {
  if (!torneoActivoId) return;

  const tbody = document.getElementById("tablaPosiciones");
  tbody.innerHTML = "";

  const q = query(
    collection(db, "equipos"),
    where("torneoId", "==", torneoActivoId)
  );

  const snap = await getDocs(q);

  snap.forEach(docu => {
    const e = docu.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${e.nombre}</td>
      <td>${e.pj || 0}</td>
      <td>${e.gf || 0}</td>
      <td>${e.gc || 0}</td>
      <td>${(e.gf || 0) - (e.gc || 0)}</td>
      <td>${e.pts || 0}</td>
    `;

    tbody.appendChild(tr);
  });
}
window.registrarPartido = async function () {
  const localId = document.getElementById("p_local").value;
  const visitanteId = document.getElementById("p_visitante").value;
  const gLocal = parseInt(document.getElementById("g_local").value);
  const gVisit = parseInt(document.getElementById("g_visitante").value);

  if (!localId || !visitanteId || isNaN(gLocal) || isNaN(gVisit)) {
    alert("Completa todos los datos");
    return;
  }

  if (localId === visitanteId) {
    alert("No puede jugar contra sí mismo");
    return;
  }

  const refLocal = doc(db, "equipos", localId);
  const refVisit = doc(db, "equipos", visitanteId);

  const localSnap = await getDoc(refLocal);
  const visitSnap = await getDoc(refVisit);

  const local = localSnap.data();
  const visit = visitSnap.data();

  // puntos
  let ptsLocal = 0;
  let ptsVisit = 0;

  if (gLocal > gVisit) ptsLocal = 3;
  else if (gLocal < gVisit) ptsVisit = 3;
  else {
    ptsLocal = 1;
    ptsVisit = 1;
  }

  await updateDoc(refLocal, {
    pj: local.pj + 1,
    gf: local.gf + gLocal,
    gc: local.gc + gVisit,
    dif: (local.gf + gLocal) - (local.gc + gVisit),
    pts: local.pts + ptsLocal
  });

  await updateDoc(refVisit, {
    pj: visit.pj + 1,
    gf: visit.gf + gVisit,
    gc: visit.gc + gLocal,
    dif: (visit.gf + gVisit) - (visit.gc + gLocal),
    pts: visit.pts + ptsVisit
  });

  cargarTabla();
  async function cargarSelectEquipos() {
  if (!torneoActivoId) return;

  const selectLocal = document.getElementById("p_local");
  const selectVisit = document.getElementById("p_visitante");

  selectLocal.innerHTML = `<option value="">Equipo local</option>`;
  selectVisit.innerHTML = `<option value="">Equipo visitante</option>`;

  const q = query(
    collection(db, "equipos"),
    where("torneoId", "==", torneoActivoId)
  );

  const snap = await getDocs(q);

  snap.forEach(docu => {
    const e = docu.data();

    const opt1 = document.createElement("option");
    opt1.value = docu.id;
    opt1.textContent = e.nombre;

    const opt2 = document.createElement("option");
    opt2.value = docu.id;
    opt2.textContent = e.nombre;

    selectLocal.appendChild(opt1);
    selectVisit.appendChild(opt2);
  });
}

  alert("Partido registrado ✅");
};
