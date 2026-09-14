// =========================================================
// MediTrack Pro - Complete Clinical Dashboard Engine
// =========================================================

let activeRole = "Doctor";

// Initial Demo Patients Database
const defaultPatients = [
  {
    id: 101,
    name: "Kavitha Raj",
    age: 42,
    gender: "Female",
    blood: "B+",
    phone: "9876501234",
    bed: "Ward 3 - Bed 08",
    diagnosis: "Type 2 Diabetes Mellitus",
    vitals: { bp: "130/85", pulse: "76", spo2: "98%" },
    status: "Ongoing",
    nextVisit: "2026-09-25",
    history: [
      {
        date: "2026-09-10",
        staff: "Dr. Arvind (Cardiology)",
        rx: "Metformin 500mg BD continued.",
        notes: "FBS under control. Advised morning walk."
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
    vitals: { bp: "170/110", pulse: "102", spo2: "95%" },
    status: "Critical",
    nextVisit: "2026-09-18",
    history: [
      {
        date: "2026-09-12",
        staff: "Dr. Priya (General Medicine)",
        rx: "IV Nitroglycerin infusion running. Continuous BP check.",
        notes: "Strict ICU bed rest and sodium restriction."
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
    diagnosis: "Post Appendectomy",
    vitals: { bp: "118/78", pulse: "72", spo2: "99%" },
    status: "Recovered",
    nextVisit: "Discharged",
    history: [
      {
        date: "2026-09-01",
        staff: "Duty Doctor",
        rx: "Suture line clean. Completed antibiotic course.",
        notes: "Fit for discharge and routine activity."
      }
    ]
  }
];

let patients = JSON.parse(localStorage.getItem("clinical_patient_records")) || defaultPatients;

// --- Role Selection & Authentication ---
function setRole(role) {
  activeRole = role;
  const docBtn = document.getElementById("btnDoctor");
  const nurseBtn = document.getElementById("btnNurse");
  const userInput = document.getElementById("loginUser");

  if (docBtn && nurseBtn) {
    docBtn.classList.toggle("active", role === "Doctor");
    nurseBtn.classList.toggle("active", role === "Nurse");
  }

  if (userInput) {
    userInput.placeholder = role === "Doctor" ? "Type: doctor" : "Type: nurse";
  }
}

function doLogin(e) {
  e.preventDefault();
  const u = (document.getElementById("loginUser")?.value || "").trim().toLowerCase();
  const p = (document.getElementById("loginPass")?.value || "").trim();
  const err = document.getElementById("loginError");

  if ((activeRole === "Doctor" && (u === "doctor" || u === "doc-101") && p === "1234") ||
      (activeRole === "Nurse" && (u === "nurse" || u === "nur-201") && p === "1234")) {
    sessionStorage.setItem("hospital_session_role", activeRole);
    if (err) err.innerText = "";
    showDashboard();
  } else {
    if (err) err.innerText = "Invalid Staff ID or Password for " + activeRole;
  }
}

function showDashboard() {
  const role = sessionStorage.getItem("hospital_session_role") || "Doctor";
  const loginSec = document.getElementById("loginSec");
  const mainSec = document.getElementById("mainSec");
  const navRight = document.getElementById("navRight");
  const userBadge = document.getElementById("userBadge");

  if (loginSec) loginSec.style.display = "none";
  if (mainSec) mainSec.style.display = "block";
  if (navRight) navRight.style.display = "flex";

  if (userBadge) {
    const icon = role === "Doctor" ? "fa-user-doctor" : "fa-user-nurse";
    userBadge.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${role}</span>`;
  }

  refresh();
}

function logout() {
  sessionStorage.removeItem("hospital_session_role");
  const loginSec = document.getElementById("loginSec");
  const mainSec = document.getElementById("mainSec");
  const navRight = document.getElementById("navRight");

  if (loginSec) loginSec.style.display = "flex";
  if (mainSec) mainSec.style.display = "none";
  if (navRight) navRight.style.display = "none";
}

// --- Patient Record Actions ---
function createPatient(e) {
  e.preventDefault();
  const role = sessionStorage.getItem("hospital_session_role") || "Attending Staff";

  const newPatient = {
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    blood: document.getElementById("blood").value,
    phone: document.getElementById("phone").value.trim(),
    bed: document.getElementById("bed").value.trim() || "Unallocated",
    vitals: {
      bp: document.getElementById("vBp").value.trim() || "120/80",
      pulse: document.getElementById("vPulse").value.trim() || "72",
      spo2: document.getElementById("vSpo2").value.trim() || "98%"
    },
    diagnosis: document.getElementById("diagnosis").value.trim(),
    status: document.getElementById("status").value,
    nextVisit: document.getElementById("date").value || "Not Scheduled",
    history: [
      {
        date: new Date().toISOString().split("T")[0],
        staff: role,
        rx: document.getElementById("treatment").value.trim(),
        notes: "Admission Baseline Assessment"
      }
    ]
  };

  patients.unshift(newPatient);
  sync();
  e.target.reset();
}

function appendRx(id) {
  const p = patients.find(item => item.id === id);
  if (!p) return;

  const staff = sessionStorage.getItem("hospital_session_role") || "Staff";
  const newRx = prompt("Enter updated treatment/medication for " + p.name + ":");
  if (!newRx || !newRx.trim()) return;

  const notes = prompt("Enter clinical progress notes:") || "Routine round observation";
  
  p.history.unshift({
    date: new Date().toISOString().split("T")[0],
    staff: staff,
    rx: newRx.trim(),
    notes: notes.trim()
  });

  sync();
}

function discharge(id) {
  const p = patients.find(item => item.id === id);
  if (!p) return;

  if (confirm("Confirm clinical discharge for " + p.name + "?")) {
    p.status = "Recovered";
    p.bed = "Discharged";
    p.nextVisit = "Discharged";
    p.history.unshift({
      date: new Date().toISOString().split("T")[0],
      staff: sessionStorage.getItem("hospital_session_role") || "Doctor",
      rx: "Discharged. Discharge medicines & instructions provided.",
      notes: "Patient stable at time of discharge."
    });
    sync();
  }
}

function printSlip(id) {
  const p = patients.find(item => item.id === id);
  if (!p) return;

  const latest = p.history[0] || { rx: "N/A", date: "N/A", staff: "N/A", notes: "N/A" };
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Prescription - ${p.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          .hdr { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
          .hdr h2 { margin: 0; color: #0284c7; }
          .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
          .info-table td { padding: 6px 0; font-size: 14px; }
          .rx-box { border: 1px solid #cbd5e1; padding: 18px; border-radius: 8px; margin: 20px 0; background: #f8fafc; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="hdr">
          <h2>🩺 MediTrack Pro - City Care Hospital</h2>
          <p style="margin: 4px 0 0; color: #64748b;">Clinical Inpatient & Outpatient Sheet</p>
        </div>
        <table class="info-table">
          <tr>
            <td><strong>Patient Name:</strong> ${p.name}</td>
            <td><strong>Age/Gender:</strong> ${p.age}y / ${p.gender}</td>
            <td><strong>Blood Group:</strong> ${p.blood}</td>
          </tr>
          <tr>
            <td><strong>Ward / Bed:</strong> ${p.bed}</td>
            <td><strong>Phone:</strong> ${p.phone}</td>
            <td><strong>Status:</strong> ${p.status}</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Diagnosis:</strong> ${p.diagnosis}</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Vitals on Admission:</strong> BP: ${p.vitals?.bp || "N/A"} | Pulse: ${p.vitals?.pulse || "N/A"} bpm | SpO2: ${p.vitals?.spo2 || "N/A"}</td>
          </tr>
        </table>
        <div class="rx-box">
          <h3 style="margin-top: 0; color: #0f172a;">℞ Prescription & Doctor Orders</h3>
          <p><strong>Prescribed By:</strong> ${latest.staff} (${latest.date})</p>
          <p><strong>Medications / Therapy:</strong><br>${latest.rx}</p>
          <p><strong>Clinical Notes:</strong> ${latest.notes}</p>
        </div>
        <div class="footer">
          <div>Next Review: ${p.nextVisit}</div>
          <div>Attending Signature: _______________________</div>
        </div>
        <script>window.onload = function() { window.print(); };<\/script>
      </body>
    </html>
  `);
  win.document.close();
}

function deletePatient(id) {
  if (sessionStorage.getItem("hospital_session_role") !== "Doctor") {
    alert("Access Denied: Only Doctors can delete medical files!");
    return;
  }
  if (confirm("Permanently delete this medical file?")) {
    patients = patients.filter(item => item.id !== id);
    sync();
  }
}

// --- Sync & Filter ---
function sync() {
  localStorage.setItem("clinical_patient_records", JSON.stringify(patients));
  refresh();
}

function filterData() {
  const searchElem = document.getElementById("search");
  const q = (searchElem ? searchElem.value : "").toLowerCase();
  
  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.diagnosis.toLowerCase().includes(q) ||
    p.phone.includes(q) ||
    p.bed.toLowerCase().includes(q)
  );
  render(filtered);
}

function refresh() {
  const cTotal = document.getElementById("cTotal");
  const cActive = document.getElementById("cActive");
  const cCritical = document.getElementById("cCritical");
  const cDischarged = document.getElementById("cDischarged");

  if (cTotal) cTotal.innerText = patients.length;
  if (cActive) cActive.innerText = patients.filter(p => p.status === "Ongoing").length;
  if (cCritical) cCritical.innerText = patients.filter(p => p.status === "Critical").length;
  if (cDischarged) cDischarged.innerText = patients.filter(p => p.status === "Recovered").length;

  filterData();
}

// --- DOM Rendering ---
function render(list) {
  const box = document.getElementById("patientList");
  if (!box) return;

  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No clinical files found.</div>';
    return;
  }

  const role = sessionStorage.getItem("hospital_session_role") || "Doctor";

  list.forEach(p => {
    let sc = "ongoing";
    if (p.status === "Critical") sc = "critical";
    if (p.status === "Recovered") sc = "recovered";

    const delBtn = role === "Doctor" 
      ? `<button class="btn-del" title="Delete Patient" onclick="deletePatient(${p.id})"><i class="fa-solid fa-trash-can"></i></button>`
      : "";

    let histHtml = "";
    p.history.forEach((h, i) => {
      histHtml += `
        <div style="padding:8px; margin-top:6px; background:rgba(15,23,42,0.9); border-radius:6px; border-left:3px solid var(--primary); font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between; color:#cbd5e1; font-weight:600; font-size:0.8rem;">
            <span><i class="fa-regular fa-calendar-check"></i> ${h.date} (${h.staff})</span>
            <span style="color:var(--primary);">Entry #${p.history.length - i}</span>
          </div>
          <div style="margin-top:4px; color:#fff;"><strong>Rx:</strong> ${h.rx}</div>
          <div style="color:var(--text-muted); font-size:0.8rem;"><strong>Notes:</strong> ${h.notes}</div>
        </div>
      `;
    });

    const card = document.createElement("div");
    card.className = `patient-card status-${sc}`;
    card.innerHTML = `
      ${delBtn}
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding-right:25px;">
        <h4 style="color:#fff; font-size:1.1rem;">
          <i class="fa-solid fa-circle-user" style="color:var(--primary); margin-right:6px;"></i>
          ${p.name} <span style="font-size:0.8rem; color:var(--text-muted);">(${p.age}y, ${p.gender})</span>
        </h4>
        <span class="badge ${sc}">${p.status}</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.85rem; color:var(--text-muted);">
        <div><i class="fa-solid fa-droplet" style="color:var(--danger);"></i> Blood: <strong style="color:#fff;">${p.blood}</strong></div>
        <div><i class="fa-solid fa-phone"></i> Phone: <strong style="color:#fff;">${p.phone}</strong></div>
        <div><i class="fa-solid fa-bed"></i> Bed: <strong style="color:#38bdf8;">${p.bed}</strong></div>
        <div><i class="fa-solid fa-clock"></i> Next: <strong style="color:#fff;">${p.nextVisit}</strong></div>
      </div>

      <div class="vitals-bar">
        <span><i class="fa-solid fa-heart-pulse" style="color:#ef4444;"></i> BP: <strong>${p.vitals?.bp || "N/A"}</strong></span>
        <span><i class="fa-solid fa-wave-square" style="color:#38bdf8;"></i> Pulse: <strong>${p.vitals?.pulse || "N/A"} bpm</strong></span>
        <span><i class="fa-solid fa-lungs" style="color:#10b981;"></i> SpO2: <strong>${p.vitals?.spo2 || "N/A"}</strong></span>
      </div>

      <div style="font-size:0.9rem; margin-bottom:10px;">
        <span style="color:var(--text-muted);">Diagnosis:</span> <strong style="color:#fff;">${p.diagnosis}</strong>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
        <button onclick="appendRx(${p.id})" style="background:rgba(56,189,248,0.2); border:1px solid var(--primary); color:#fff; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;">
          <i class="fa-solid fa-plus"></i> Add Rx
        </button>
        <button onclick="printSlip(${p.id})" style="background:rgba(255,255,255,0.1); border:1px solid var(--glass-border); color:#fff; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;">
          <i class="fa-solid fa-print"></i> Print Slip
        </button>
        ${p.status !== "Recovered" ? `
          <button onclick="discharge(${p.id})" style="background:rgba(16,185,129,0.2); border:1px solid var(--success); color:var(--success); padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;">
            <i class="fa-solid fa-check"></i> Discharge
          </button>
        ` : ""}
      </div>

      <details style="border-top:1px dashed var(--glass-border); padding-top:6px;">
        <summary style="cursor:pointer; color:var(--primary); font-size:0.8rem; font-weight:600;">
          <i class="fa-solid fa-clock-rotate-left"></i> History Records (${p.history.length})
        </summary>
        <div style="margin-top:6px;">${histHtml}</div>
      </details>
    `;
    box.appendChild(card);
  });
}

// Check session on page load
document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("hospital_session_role")) {
    showDashboard();
  }
});
