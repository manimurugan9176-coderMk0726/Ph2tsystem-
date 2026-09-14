// =========================================================
// MediTrack Pro - Multi-Staff Hospital Model (v4.0)
// =========================================================

let currentRole = "Doctor";

// Hospital Staff Database (Saved in LocalStorage)
const defaultStaff = [
  // Doctors Roster
  { id: "DOC-101", username: "doc-101", pass: "1234", role: "Doctor", name: "Dr. Arvind", dept: "Cardiology" },
  { id: "DOC-102", username: "doc-102", pass: "1234", role: "Doctor", name: "Dr. Priya", dept: "General Medicine" },
  { id: "DOC-103", username: "doctor", pass: "1234", role: "Doctor", name: "Duty Medical Officer", dept: "Emergency" },

  // Nurses & Ward Staff Roster
  { id: "NUR-201", username: "nur-201", pass: "1234", role: "Nurse", name: "Staff Anita", dept: "ICU Care" },
  { id: "NUR-202", username: "nur-202", pass: "1234", role: "Nurse", name: "Staff Saranya", dept: "General Ward" },
  { id: "NUR-203", username: "nurse", pass: "1234", role: "Nurse", name: "Duty Staff Nurse", dept: "Inpatient Ward" }
];

let hospitalStaff = JSON.parse(localStorage.getItem("hospital_staff_roster")) || defaultStaff;

// Patients Database
const seedPatients = [
  {
    id: 101,
    name: "Kavitha Raj",
    age: 42,
    gender: "Female",
    blood: "B+",
    phone: "9876501234",
    bed: "Ward 3 - Bed 08",
    diagnosis: "Type 2 Diabetes Mellitus",
    status: "Ongoing",
    nextVisit: "2026-09-25",
    history: [
      {
        date: "2026-09-10",
        doctor: "Dr. Arvind (Cardiology)",
        treatment: "FBS 140 mg/dL. Prescribed Metformin 500mg BD.",
        notes: "Advised low-carb diet and regular walking."
      }
    ]
  },
  {
    id: 102,
    name: "Murugan S",
    age: 58,
    gender: "Male",
    blood: "O+",
    phone: "9840123456",
    bed: "ICU - Bed 02",
    diagnosis: "Acute Hypertension & Angina",
    status: "Critical",
    nextVisit: "2026-09-18",
    history: [
      {
        date: "2026-09-12",
        doctor: "Dr. Priya (General Medicine)",
        treatment: "Emergency admission. BP 170/110 mmHg. IV started.",
        notes: "Continuous ECG monitoring and sodium restriction."
      }
    ]
  },
  {
    id: 103,
    name: "Aakash V",
    age: 24,
    gender: "Male",
    blood: "A+",
    phone: "9123456780",
    bed: "Discharged",
    diagnosis: "Post Appendectomy Recovery",
    status: "Recovered",
    nextVisit: "Discharged",
    history: [
      {
        date: "2026-09-01",
        doctor: "Duty Medical Officer (Emergency)",
        treatment: "Suture healed cleanly. Antibiotic course completed.",
        notes: "Patient cleared for discharge."
      }
    ]
  }
];

let patients = JSON.parse(localStorage.getItem("patient_records")) || seedPatients;

// --- Tab & Role Management ---
function switchAuthTab(tab) {
  document.getElementById("tabLogin").classList.toggle("active", tab === "login");
  document.getElementById("tabRegister").classList.toggle("active", tab === "register");
  
  document.getElementById("formLogin").style.display = tab === "login" ? "block" : "none";
  document.getElementById("formRegister").style.display = tab === "register" ? "block" : "none";
  
  if (tab === "register") {
    autoGenerateId();
  }
}

function selectRole(role) {
  currentRole = role;
  document.getElementById("btnRoleDoctor").classList.toggle("active", role === "Doctor");
  document.getElementById("btnRoleNurse").classList.toggle("active", role === "Nurse");
  
  const idInput = document.getElementById("loginId");
  idInput.placeholder = role === "Doctor" ? "e.g. DOC-101 or doctor" : "e.g. NUR-201 or nurse";
}

function autoGenerateId() {
  const role = document.getElementById("regRole").value;
  const prefix = role === "Doctor" ? "DOC" : "NUR";
  const randomNum = Math.floor(100 + Math.random() * 900);
  document.getElementById("regId").value = `${prefix}-${randomNum}`;
}

// --- Multi-Staff Registration ---
function handleStaffRegister(e) {
  e.preventDefault();
  const role = document.getElementById("regRole").value;
  const name = document.getElementById("regName").value.trim();
  const dept = document.getElementById("regDept").value.trim();
  const staffId = document.getElementById("regId").value.trim();
  const pin = document.getElementById("regPin").value.trim();

  const newStaff = {
    id: staffId,
    username: staffId.toLowerCase(),
    pass: pin,
    role: role,
    name: name,
    dept: dept
  };

  hospitalStaff.push(newStaff);
  localStorage.setItem("hospital_staff_roster", JSON.stringify(hospitalStaff));

  const successElem = document.getElementById("regSuccess");
  successElem.innerText = `Staff Created Successfully! Your Staff ID is: ${staffId}`;

  setTimeout(() => {
    e.target.reset();
    successElem.innerText = "";
    switchAuthTab("login");
    document.getElementById("loginId").value = staffId;
  }, 1800);
}

// --- Login Validation ---
function handleStaffLogin(e) {
  e.preventDefault();
  const inputId = document.getElementById("loginId").value.trim().toLowerCase();
  const inputPin = document.getElementById("loginPin").value.trim();
  const err = document.getElementById("loginError");

  // Multi-Staff Check
  const foundUser = hospitalStaff.find(s => 
    (s.username === inputId || s.id.toLowerCase() === inputId) &&
    s.pass === inputPin &&
    s.role.toLowerCase() === currentRole.toLowerCase()
  );

  if (foundUser) {
    sessionStorage.setItem("meditrack_auth_user", foundUser.role);
    sessionStorage.setItem("meditrack_user_name", `${foundUser.name} (${foundUser.dept})`);
    err.innerText = "";
    loadDashboard();
  } else {
    err.innerText = `Login Failed! Incorrect ID or PIN for ${currentRole}.`;
  }
}

function loadDashboard() {
  const role = sessionStorage.getItem("meditrack_auth_user") || "Doctor";
  const fullName = sessionStorage.getItem("meditrack_user_name") || role;

  document.getElementById("loginSection").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
  document.getElementById("navRight").style.display = "flex";
  
  document.getElementById("currentRole").innerText = fullName;
  const icon = role === "Doctor" ? "fa-user-doctor" : "fa-user-nurse";
  document.getElementById("currentUserBadge").innerHTML = `<i class="fa-solid ${icon}"></i> <span>${fullName}</span>`;

  refreshUI();
}

function logout() {
  sessionStorage.removeItem("meditrack_auth_user");
  sessionStorage.removeItem("meditrack_user_name");
  document.getElementById("loginSection").style.display = "flex";
  document.getElementById("mainApp").style.display = "none";
  document.getElementById("navRight").style.display = "none";
}

// --- Patient Record Management ---
function addPatient(e) {
  e.preventDefault();
  const loggedStaff = sessionStorage.getItem("meditrack_user_name") || "Hospital Staff";

  const newPatient = {
    id: Date.now(),
    name: document.getElementById("pName").value.trim(),
    age: document.getElementById("pAge").value,
    gender: document.getElementById("pGender").value,
    blood: document.getElementById("pBlood").value,
    phone: document.getElementById("pPhone").value.trim(),
    bed: document.getElementById("pBed").value.trim() || "Not Assigned",
    diagnosis: document.getElementById("pDiagnosis").value.trim(),
    status: document.getElementById("pStatus").value,
    nextVisit: document.getElementById("pDate").value || "Not Scheduled",
    history: [
      {
        date: new Date().toISOString().split("T")[0],
        doctor: loggedStaff,
        treatment: document.getElementById("pTreatment").value.trim(),
        notes: "Admission & Initial Assessment"
      }
    ]
  };

  patients.unshift(newPatient);
  syncData();
  e.target.reset();
}

function dischargePatient(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;
  const loggedStaff = sessionStorage.getItem("meditrack_user_name") || "Attending Staff";

  if (confirm(`Confirm clinical discharge for ${patient.name}?`)) {
    patient.status = "Recovered";
    patient.bed = "Discharged";
    patient.nextVisit = "Discharged";
    patient.history.unshift({
      date: new Date().toISOString().split("T")[0],
      doctor: loggedStaff,
      treatment: "Patient Discharged. Summary & Discharge medicines issued.",
      notes: "Condition stable on discharge."
    });
    syncData();
  }
}

function addTreatmentToHistory(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;

  const loggedStaff = sessionStorage.getItem("meditrack_user_name") || "Clinical Staff";
  const newRx = prompt(`Enter prescription/clinical order update for ${patient.name}:`);
  if (!newRx || !newRx.trim()) return;

  const newNotes = prompt("Enter observation notes:") || "Ward round assessment";
  
  patient.history.unshift({
    date: new Date().toISOString().split("T")[0],
    doctor: loggedStaff,
    treatment: newRx.trim(),
    notes: newNotes.trim()
  });

  syncData();
}

function printPrescription(patientId) {
  const p = patients.find(item => item.id === patientId);
  if (!p) return;

  const latestRx = p.history[0] || { treatment: "None", date: "N/A", doctor: "N/A" };

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Prescription Slip - ${p.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; color: #0284c7; font-weight: bold; }
          .info { margin-bottom: 20px; line-height: 1.8; }
          .rx-box { border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin-top: 15px; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🩺 MediTrack Pro - City Care Hospital</div>
          <div>Clinical Health Center & Inpatient Services</div>
        </div>
        <div class="info">
          <strong>Patient:</strong> ${p.name} | <strong>Age/Gender:</strong> ${p.age}y / ${p.gender}<br>
          <strong>Blood Group:</strong> ${p.blood} | <strong>Contact:</strong> ${p.phone}<br>
          <strong>Bed:</strong> ${p.bed} | <strong>Status:</strong> ${p.status}<br>
          <strong>Diagnosis:</strong> ${p.diagnosis}
        </div>
        <div class="rx-box">
          <h3>℞ Prescription & Orders</h3>
          <p><strong>Attending Clinician:</strong> ${latestRx.doctor}</p>
          <p><strong>Date:</strong> ${latestRx.date}</p>
          <p><strong>Prescription:</strong><br>${latestRx.treatment}</p>
          <p><strong>Observation:</strong> ${latestRx.notes}</p>
        </div>
        <div class="footer">
          <div>Next Follow-up: ${p.nextVisit}</div>
          <div>Clinician Signature: __________________</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function removePatient(patientId) {
  if (sessionStorage.getItem("meditrack_auth_user") !== "Doctor") {
    alert("Permission Denied: Only Doctors can erase medical records!");
    return;
  }
  if (confirm("Delete this patient's medical file completely?")) {
    patients = patients.filter(p => p.id !== patientId);
    syncData();
  }
}

function syncData() {
  localStorage.setItem("patient_records", JSON.stringify(patients));
  refreshUI();
}

function filterPatients() {
  const q = (document.getElementById("searchBox")?.value || "").toLowerCase();
  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.diagnosis.toLowerCase().includes(q) || 
    p.phone.includes(q) ||
    p.bed.toLowerCase().includes(q)
  );
  renderPatientList(filtered);
}

function refreshUI() {
  const total = document.getElementById("statTotal");
  const ongoing = document.getElementById("statOngoing");
  const critical = document.getElementById("statCritical");
  const recovered = document.getElementById("statRecovered");

  if (total) total.innerText = patients.length;
  if (ongoing) ongoing.innerText = patients.filter(p => p.status === "Ongoing").length;
  if (critical) critical.innerText = patients.filter(p => p.status === "Critical").length;
  if (recovered) recovered.innerText = patients.filter(p => p.status === "Recovered").length;

  filterPatients();
}

function renderPatientList(records) {
  const container = document.getElementById("patientList");
  if (!container) return;

  container.innerHTML = "";

  if (records.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No matching clinical files found.</div>';
    return;
  }

  const role = sessionStorage.getItem("meditrack_auth_user") || "Doctor";

  records.forEach(p => {
    let statusClass = "ongoing";
    if (p.status === "Critical") statusClass = "critical";
    if (p.status === "Recovered") statusClass = "recovered";

    const deleteBtn = role === "Doctor" 
      ? `<button class="btn-remove" title="Delete Patient" onclick="removePatient(${p.id})"><i class="fa-solid fa-trash-can"></i></button>` 
      : "";

    let historyItems = "";
    p.history.forEach((h, i) => {
      historyItems += `
        <div style="padding:8px; margin-top:6px; background:rgba(15,23,42,0.9); border-radius:6px; border-left:3px solid var(--primary); font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between; color:#cbd5e1; font-weight:600; font-size:0.8rem;">
            <span><i class="fa-regular fa-calendar-check"></i> ${h.date} (${h.doctor})</span>
            <span style="color:var(--primary);">Entry #${p.history.length - i}</span>
          </div>
          <div style="margin-top:4px; color:#fff;"><strong>Rx:</strong> ${h.treatment}</div>
          <div style="color:var(--text-muted); font-size:0.8rem;"><strong>Notes:</strong> ${h.notes}</div>
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
          ${p.name} <span style="font-size:0.85rem; color:var(--text-muted);">(${p.age}y, ${p.gender})</span>
        </h4>
        <span class="badge ${statusClass}">${p.status}</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.85rem; margin-bottom:10px; color:var(--text-muted);">
        <div><i class="fa-solid fa-droplet" style="color:var(--danger);"></i> Blood: <strong style="color:#fff;">${p.blood}</strong></div>
        <div><i class="fa-solid fa-phone"></i> Phone: <strong style="color:#fff;">${p.phone}</strong></div>
        <div><i class="fa-solid fa-bed"></i> Ward/Bed: <strong style="color:#38bdf8;">${p.bed}</strong></div>
        <div><i class="fa-solid fa-clock"></i> Next: <strong style="color:#fff;">${p.nextVisit}</strong></div>
      </div>

      <div style="font-size:0.9rem; margin-bottom:12px; background:rgba(0,0,0,0.25); padding:8px; border-radius:6px;">
        <span style="color:var(--text-muted);">Diagnosis:</span> <strong style="color:#fff;">${p.diagnosis}</strong>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
        <button onclick="addTreatmentToHistory(${p.id})" style="background:rgba(56,189,248,0.2); border:1px solid var(--primary); color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;">
          <i class="fa-solid fa-plus-circle"></i> Add Rx Update
        </button>

        <button onclick="printPrescription(${p.id})" style="background:rgba(255,255,255,0.1); border:1px solid var(--glass-border); color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;">
          <i class="fa-solid fa-print"></i> Print Slip
        </button>

        ${p.status !== "Recovered" ? `
          <button onclick="dischargePatient(${p.id})" style="background:rgba(16,185,129,0.2); border:1px solid var(--success); color:var(--success); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;">
            <i class="fa-solid fa-check-to-slot"></i> Discharge
          </button>
        ` : ""}
      </div>

      <details style="border-top:1px dashed var(--glass-border); padding-top:8px;">
        <summary style="cursor:pointer; color:var(--primary); font-size:0.85rem; font-weight:600;">
          <i class="fa-solid fa-clock-rotate-left"></i> Treatment History (${p.history.length})
        </summary>
        <div style="margin-top:6px;">
          ${historyItems}
        </div>
      </details>
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("meditrack_auth_user")) {
    loadDashboard();
  }
});
