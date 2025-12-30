import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// ================================
// 🔥 CONFIG FIREBASE
// ================================
const firebaseConfig = {
  apiKey: "AIzaSyD3p6FuP5cUKrKcl-b2dmdxsVe7U7Ts6ZE",
  authDomain: "liga-nogales-f3da8.firebaseapp.com",
  projectId: "liga-nogales",
  storageBucket: "liga-nogales.firebasestorage.app",
  messagingSenderId: "686651350788",
  appId: "1:686651350788:web:3c651a88b9e67b09463a51"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================================
// APP SIN LOGIN
// ================================
document.getElementById("app").classList.remove("hidden");

// Torneo fijo temporal
const torneoActivoId = "TORNEO_TEST";

// ================================
// ➕ CREAR EQUIPO
// ================================
window.crearEquipo = async function () {
  const nombre = document.getElementById("eq_nombre").value.trim();
  const grupo = document.getElementById("eq_grupo").value.trim();
  const roster = document.getElementById("eq_roster").value.trim();

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
      pj: 0,
      gf: 0,
      gc: 0,
      dif: 0,
      pts: 0,
      creado: serverTimestamp()
    });

    // limpiar campos
    document.getElementById("eq_nombre").value = "";
    document.getElementById("eq_grupo").value = "";
    document.getElementById("eq_roster").value = "";
    
   cargarEquipos();
  cargarTablaPosiciones();
     cargarSelectEquipos();

    alert("Equipo agregado correctamente ✅");

  } catch (error) {
    console.error(error);
    alert("Error al crear equipo ❌");
  }
};

// ================================
// 📋 LISTA SIMPLE DE EQUIPOS
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

// ================================
// 📊 TABLA DE POSICIONES (ORDENADA)
// ================================
async function cargarTablaPosiciones() {
  const tabla = document.getElementById("tablaPosiciones");
  tabla.innerHTML = "";

  const q = query(
    collection(db, "equipos"),
    where("torneoId", "==", torneoActivoId),
    orderBy("pts", "desc"),
    orderBy("dif", "desc"),
    orderBy("gf", "desc")
  );

  const snap = await getDocs(q);

  let posicion = 1; // 👈 contador de posiciones

  snap.forEach(docu => {
    const e = docu.data();
    const tr = document.createElement("tr");

    // 🎨 colores opcionales
    if (posicion === 1) tr.style.background = "#d4edda"; // líder
    if (posicion >= snap.size - 1) tr.style.background = "#f8d7da"; // últimos

    tr.innerHTML = `
      <td><strong>${posicion}</strong></td>
      <td>${e.nombre}</td>
      <td>${e.pj || 0}</td>
      <td>${e.gf || 0}</td>
      <td>${e.gc || 0}</td>
      <td>${(e.gf || 0) - (e.gc || 0)}</td>
      <td><strong>${e.pts || 0}</strong></td>
    `;

    tabla.appendChild(tr);
    posicion++;
  });
}
// ================================
// CARGAR SELECT EQUIPOS
// ================================
async function cargarSelectEquipos() {
  const selectLocal = document.getElementById("p_local");
  const selectVisit = document.getElementById("p_visitante");

  // seguridad por si aún no carga el HTML
  if (!selectLocal || !selectVisit) return;

  selectLocal.innerHTML = `<option value="">Equipo local</option>`;
  selectVisit.innerHTML = `<option value="">Equipo visitante</option>`;

  const q = query(
    collection(db, "equipos"),
    where("torneoId", "==", torneoActivoId)
  );

  const snap = await getDocs(q);

  snap.forEach(docu => {
    const equipo = docu.data();

    const optLocal = document.createElement("option");
    optLocal.value = docu.id;
    optLocal.textContent = equipo.nombre;

    const optVisit = document.createElement("option");
    optVisit.value = docu.id;
    optVisit.textContent = equipo.nombre;

    selectLocal.appendChild(optLocal);
    selectVisit.appendChild(optVisit);
  });
}
// ================================
// ⚽ REGISTRAR PARTIDO
// ================================

// RECARGAR TODO
  await cargarEquipos();
  await cargarTablaPosiciones();
  await cargarselectEquipos();
//limpiar inputs
  document.getElementById("g_local").value = "";
  document.getElementById("g_visitante").value = "";
  alert("Partido registrado ✅");
} catch (error) {
  console.error ("ERROR REGISTRAR PARTIDO:", error);
  alert("error.message");
}
};

// ================================
// ⏱️ CARGA INICIAL
// ================================
document.addEventListener("DOMContentLoaded", async () => {
await cargarEquipos();
await cargarTablaPosiciones();
await cargarSelectEquipos();
});
  
