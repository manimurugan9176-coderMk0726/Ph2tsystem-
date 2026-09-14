// =========================================================
// MediTrack Pro - Core Engine (Bugs Free & Auto-Sync Engine)
// =========================================================

const APP_VERSION = "2.4.0"; // Cache Buster & Sync version
let currentRole = "Doctor";

// Initial Demo Patients with Detailed Treatment History
const seedData = [
  {
    id: 101,
    name: "Kavitha Raj",
    age: 42,
    gender: "Female",
    diagnosis: "Type 2 Diabetes Mellitus",
    status: "Ongoing",
    nextVisit: "2026-09-25",
    history: [
      {
        date: "2026-08-10",
        doctor: "Dr. Arvind",
        treatment: "Fasting Blood Sugar: 180 mg/dL. Prescribed Metformin 500mg BD.",
        notes: "Advised 30 mins morning walk and low glycemic diet."
      },
      {
        date: "2026-09-10",
        doctor: "Dr. Arvind",
        treatment: "FBS reduced to 140 mg/dL. Continued Metformin 500mg, added Glimepiride 1mg.",
        notes: "Follow up scheduled after 2 weeks."
      }
    ]
  },
  {
    id: 102,
    name: "Murugan S",
    age: 58,
    gender: "Male",
    diagnosis: "Acute Hypertension & Angina",
    status: "Critical",
    nextVisit: "2026-09-18",
    history: [
      {
        date: "2026-09-12",
        doctor: "Dr. Priya",
        treatment: "Emergency admission. BP 170/110 mmHg. IV Nitroglycerin administered.",
        notes: "Shifted to step-down ICU. Strict low-sodium diet and ECG monitoring."
      }
    ]
  },
  {
    id: 103,
    name: "Aakash V",
    age: 24,
    gender: "Male",
    diagnosis: "Post Appendectomy Recovery",
    status: "Recovered",
    nextVisit: "Discharged",
    history: [
      {
        date: "2026-08-20",
        doctor: "Dr. Arvind",
        treatment: "Laparoscopic Appendectomy performed. Post-op Cefotaxime & Tramadol.",
        notes: "Wound clean. Suture removal done on day 8."
      },
      {
        date: "2026-09-01",
        doctor: "Dr. Priya",
        treatment: "Final ultrasound normal. Discontinued pain medications.",
        notes: "Patient declared fit to resume work."
      }
    ]
  }
];

// Initialize LocalStorage with Version Control (Ensures update reaches all devices)
function initStorage() {
  const savedVersion = localStorage.getItem("meditrack_version");
  if (!savedVersion || savedVersion !== APP_VERSION) {
    if (!localStorage.getItem("patient_records")) {
      localStorage.setItem("patient_records", JSON.stringify(seedData));
    }
    localStorage.setItem("meditrack_version", APP_VERSION);
  }
}

initStorage();

let patients = JSON.parse(localStorage.getItem("patient_records")) || seedData;

// --- Role Switcher ---
function selectRole(role) {
  currentRole = role;
  const docBtn = document.getElementById("btnRoleDoctor");
  const nurseBtn = document.getElementById("btnRoleNurse");
  const userInput = document.getElementById("loginUser");

  if (docBtn && nurseBtn) {
    docBtn.classList.toggle("active", role === "Doctor");
    nurseBtn.classList.toggle("active", role === "Nurse");
  }

  if (userInput) {
    userInput.placeholder = role === "Doctor" ? "Username: doctor" : "Username: nurse";
  }
}

// --- Login & Session Handler ---
function handleLogin(e) {
  if (e) e.preventDefault();
  const u = (document.getElementById("loginUser")?.value || "").trim().toLowerCase();
  const p = (document.getElementById("loginPass")?.value || "").trim();
  const err = document.getElementById("loginError");

  if ((currentRole === "Doctor" && u === "doctor" && p === "1234") ||
      (currentRole === "Nurse" && u === "nurse" && p === "1234")) {
    sessionStorage.setItem("meditrack_auth_user", currentRole);
    if (err) err.innerText = "";
    loadDashboard();
  } else {
    if (err) err.innerText = `Invalid credentials for ${currentRole}!`;
  }
}

function loadDashboard() {
  const role = sessionStorage.getItem("meditrack_auth_user") || "Doctor";
  
  const loginSec = document.getElementById("loginSection");
  const mainApp = document.getElementById("mainApp");
  const navRight = document.getElementById("navRight");
  const roleBadge = document.getElementById("currentUserBadge");
  const roleText = document.getElementById("currentRole");

  if (loginSec) loginSec.style.display = "none";
  if (mainApp) mainApp.style.display = "block";
  if (navRight) navRight.style.display = "flex";
  
  if (roleText) roleText.innerText = role;
  if (roleBadge) {
    const icon = role === "Doctor" ? "fa-user-doctor" : "fa-user-nurse";
    roleBadge.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${role}</span>`;
  }

  refreshUI();
}

function logout() {
  sessionStorage.removeItem("meditrack_auth_user");
  const loginSec = document.getElementById("loginSection");
  const mainApp = document.getElementById("mainApp");
  const navRight = document.getElementById("navRight");

  if (loginSec) loginSec.style.display = "flex";
  if (mainApp) mainApp.style.display = "none";
  if (navRight) navRight.style.display = "none";
}

// --- Record Operations ---
function addPatient(e) {
  e.preventDefault();

  const name = document.getElementById("pName")?.value.trim();
  const age = document.getElementById("pAge")?.value;
  const gender = document.getElementById("pGender")?.value;
  const diagnosis = document.getElementById("pDiagnosis")?.value.trim();
  const initialTreatment = document.getElementById("pTreatment")?.value.trim();
  const status = document.getElementById("pStatus")?.value;
  const date = document.getElementById("pDate")?.value || "Not Scheduled";
  const loggedUser = sessionStorage.getItem("meditrack_auth_user") || "Doctor";

  if (!name || !diagnosis || !initialTreatment) {
    alert("Please fill all mandatory fields!");
    return;
  }

  const newPatient = {
    id: Date.now(),
    name: name,
    age: age,
    gender: gender,
    diagnosis: diagnosis,
    status: status,
    nextVisit: date,
    history: [
      {
        date: new Date().toISOString().split("T")[0],
        doctor: loggedUser,
        treatment: initialTreatment,
        notes: "Initial admission and prescription record."
      }
    ]
  };

  patients.unshift(newPatient);
  syncData();
  e.target.reset();
}

function addTreatmentToHistory(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;

  const currentRole = sessionStorage.getItem("meditrack_auth_user") || "Staff";
  const newRx = prompt(`Enter new treatment / medication for ${patient.name}:`);
  if (!newRx || newRx.trim() === "") return;

  const newNotes = prompt("Enter clinical observation or condition update:") || "Regular assessment";
  const today = new Date().toISOString().split("T")[0];

  patient.history.unshift({
    date: today,
    doctor: currentRole,
    treatment: newRx.trim(),
    notes: newNotes.trim()
  });

  syncData();
}

function updatePatientStatus(patientId, newStatus) {
  const patient = patients.find(p => p.id === patientId);
  if (patient) {
    patient.status = newStatus;
    syncData();
  }
}

function removePatient(patientId) {
  const currentRole = sessionStorage.getItem("meditrack_auth_user");
  if (currentRole !== "Doctor") {
    alert("Permission Denied: Only Doctors can delete medical history!");
    return;
  }

  if (confirm("Are you sure you want to completely erase this patient's treatment file?")) {
    patients = patients.filter(p => p.id !== patientId);
    syncData();
  }
}

function syncData() {
  localStorage.setItem("patient_records", JSON.stringify(patients));
  refreshUI();
}

// --- Live Search & Filters ---
function filterPatients() {
  const query = (document.getElementById("searchBox")?.value || "").toLowerCase();
  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.diagnosis.toLowerCase().includes(query) || 
    p.status.toLowerCase().includes(query)
  );
  renderPatientList(filtered);
}

// --- UI Rendering ---
function refreshUI() {
  updateLiveCounters();
  filterPatients();
}

function updateLiveCounters() {
  const totalElem = document.getElementById("statTotal");
  const ongoingElem = document.getElementById("statOngoing");
  const criticalElem = document.getElementById("statCritical");
  const recElem = document.getElementById("statRecovered");

  if (totalElem) totalElem.innerText = patients.length;
  if (ongoingElem) ongoingElem.innerText = patients.filter(p => p.status === "Ongoing").length;
  if (criticalElem) criticalElem.innerText = patients.filter(p => p.status === "Critical").length;
  if (recElem) recElem.innerText = patients.filter(p => p.status === "Recovered").length;
}

function renderPatientList(records) {
  const listContainer = document.getElementById("patientList");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  if (records.length === 0) {
    listContainer.innerHTML = '<div style="text-align:center; padding:30px; color:var(--muted);">No matching clinical records found.</div>';
    return;
  }

  const role = sessionStorage.getItem("meditrack_auth_user") || "Doctor";

  records.forEach(p => {
    let statusClass = "ongoing";
    if (p.status === "Critical") statusClass = "critical";
    if (p.status === "Recovered") statusClass = "recovered";

    const deleteBtn = role === "Doctor" 
      ? `<button class="btn-remove" title="Delete Patient Record" onclick="removePatient(${p.id})"><i class="fa-solid fa-trash-can"></i></button>` 
      : "";

    // Build timeline/history items
    let historyHTML = "";
    p.history.forEach((h, index) => {
      historyHTML += `
        <div style="padding: 8px; margin-top: 6px; background: rgba(15,23,42,0.9); border-radius: 6px; border-left: 3px solid var(--primary); font-size: 0.85rem;">
          <div style="display:flex; justify-content:space-between; color:#cbd5e1; font-weight:600; font-size:0.8rem;">
            <span><i class="fa-regular fa-calendar-check"></i> ${h.date} (By: ${h.doctor})</span>
            <span style="color:var(--primary);">Session #${p.history.length - index}</span>
          </div>
          <div style="margin-top:4px; color:#fff;"><strong>Rx:</strong> ${h.treatment}</div>
          <div style="color:var(--muted); font-size:0.8rem;"><strong>Notes:</strong> ${h.notes}</div>
        </div>
      `;
    });

    const card = document.createElement("div");
    card.className = `patient-card status-${statusClass}`;
    card.innerHTML = `
      ${deleteBtn}
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-right:30px;">
        <h4 style="color:#fff; font-size:1.1rem;">
          <i class="fa-solid fa-circle-user" style="color:var(--primary); margin-right:6px;"></i>
          ${p.name} <span style="font-size:0.85rem; color:var(--muted);">(${p.age}y, ${p.gender})</span>
        </h4>
        <span class="badge ${statusClass}">${p.status}</span>
      </div>

      <div style="font-size:0.9rem; margin-bottom:8px;">
        <span style="color:var(--muted);">Diagnosis:</span> <strong style="color:#fff;">${p.diagnosis}</strong> | 
        <span style="color:var(--muted);">Next Round:</span> <strong style="color:var(--primary);">${p.nextVisit}</strong>
      </div>

      <!-- Quick Action Buttons -->
      <div style="display:flex; gap:8px; margin: 10px 0;">
        <button onclick="addTreatmentToHistory(${p.id})" style="background:rgba(56,189,248,0.2); border:1px solid var(--primary); color:#fff; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;">
          <i class="fa-solid fa-plus-circle"></i> Add Rx Update
        </button>
        <select onchange="updatePatientStatus(${p.id}, this.value)" style="width:auto; padding:4px 8px; font-size:0.8rem; background:#0f172a; border-radius:5px;">
          <option value="" disabled selected>Change Status</option>
          <option value="Ongoing">Mark Ongoing</option>
          <option value="Critical">Mark Critical</option>
          <option value="Recovered">Mark Recovered</option>
        </select>
      </div>

      <!-- Treatment History Toggle Accordion -->
      <details style="margin-top:10px; border-top:1px dashed var(--glass-border); padding-top:8px;">
        <summary style="cursor:pointer; color:var(--primary); font-size:0.85rem; font-weight:600;">
          <i class="fa-solid fa-clock-rotate-left"></i> View Full Treatment History (${p.history.length})
        </summary>
        <div style="margin-top:6px;">
          ${historyHTML}
        </div>
      </details>
    `;

    listContainer.appendChild(card);
  });
}

// Ensure session persistence on browser refresh
document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("meditrack_auth_user")) {
    loadDashboard();
  }
});
