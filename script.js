// Check Session on page load
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    showDashboard();
  }
});

// Login Handler
function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  const err = document.getElementById('loginError');

  if (u === 'doctor' && p === '1234') {
    sessionStorage.setItem('isLoggedIn', 'true');
    err.innerText = '';
    showDashboard();
  } else {
    err.innerText = 'Invalid username or password!';
  }
}

function showDashboard() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  document.getElementById('navLinks').style.display = 'flex';
  renderRecords();
}

function logout() {
  sessionStorage.removeItem('isLoggedIn');
  document.getElementById('loginSection').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('navLinks').style.display = 'none';
}

// Patient Data Operations
let patients = JSON.parse(localStorage.getItem('patient_records')) || [];

function addPatient(e) {
  e.preventDefault();

  const record = {
    id: Date.now(),
    name: document.getElementById('pName').value.trim(),
    age: document.getElementById('pAge').value,
    gender: document.getElementById('pGender').value,
    diagnosis: document.getElementById('pDiagnosis').value.trim(),
    treatment: document.getElementById('pTreatment').value.trim(),
    status: document.getElementById('pStatus').value,
    date: document.getElementById('pDate').value || 'Not Scheduled'
  };

  patients.unshift(record);
  saveData();
  e.target.reset();
}

function removePatient(id) {
  if (confirm('Delete this record?')) {
    patients = patients.filter(item => item.id !== id);
    saveData();
  }
}

function saveData() {
  localStorage.setItem('patient_records', JSON.stringify(patients));
  renderRecords();
}

function filterPatients() {
  const query = document.getElementById('searchBox').value.toLowerCase();
  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.diagnosis.toLowerCase().includes(query)
  );
  renderList(filtered);
}

function updateStats() {
  document.getElementById('statTotal').innerText = patients.length;
  document.getElementById('statOngoing').innerText = patients.filter(p => p.status === 'Ongoing').length;
  document.getElementById('statCritical').innerText = patients.filter(p => p.status === 'Critical').length;
  document.getElementById('statRecovered').innerText = patients.filter(p => p.status === 'Recovered').length;
}

function renderRecords() {
  updateStats();
  renderList(patients);
}

function renderList(list) {
  const box = document.getElementById('patientList');
  box.innerHTML = '';

  if (list.length === 0) {
    box.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:30px;">No patient records available.</p>';
    return;
  }

  list.forEach(p => {
    let statusClass = 'ongoing';
    if (p.status === 'Critical') statusClass = 'critical';
    if (p.status === 'Recovered') statusClass = 'recovered';

    const card = document.createElement('div');
    card.className = `patient-card status-${statusClass}`;
    card.innerHTML = `
      <button class="btn-remove" onclick="removePatient(${p.id})"><i class="fa-solid fa-trash-can"></i></button>
      <div class="patient-header">
        <h4>${p.name} (${p.age} yrs, ${p.gender})</h4>
        <span class="badge ${statusClass}">${p.status}</span>
      </div>
      <div class="patient-details">
        <div><strong>Diagnosis:</strong> <span>${p.diagnosis}</span></div>
        <div><strong>Treatment:</strong> <span>${p.treatment}</span></div>
        <div><strong>Next Visit:</strong> <span>${p.date}</span></div>
      </div>
    `;
    box.appendChild(card);
  });
}
