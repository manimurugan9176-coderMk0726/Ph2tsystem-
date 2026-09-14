// Retrieve existing patient data from localStorage
let patients = JSON.parse(localStorage.getItem('patient_records')) || [];

// Function to add a new patient record
function addPatient(e) {
  e.preventDefault();

  const newPatient = {
    id: Date.now(),
    name: document.getElementById('name').value.trim(),
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    diagnosis: document.getElementById('diagnosis').value.trim(),
    treatment: document.getElementById('treatment').value.trim(),
    status: document.getElementById('status').value,
    followup: document.getElementById('followup').value || 'None'
  };

  patients.unshift(newPatient);
  saveAndRender();
  document.getElementById('recordForm').reset();
}

// Function to delete a patient record
function removePatient(id) {
  if (confirm('Delete this patient entry?')) {
    patients = patients.filter(item => item.id !== id);
    saveAndRender();
  }
}

// Save records to localStorage and refresh the display
function saveAndRender() {
  localStorage.setItem('patient_records', JSON.stringify(patients));
  renderList(patients);
}

// Filter records by patient name or diagnosis
function filterPatients() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.diagnosis.toLowerCase().includes(query)
  );
  renderList(filtered);
}

// Render patient cards into the DOM
function renderList(list) {
  const container = document.getElementById('patientList');
  if (!container) return;

  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-msg">No patient records available.</div>';
    return;
  }

  list.forEach(p => {
    let badgeClass = 'badge-ongoing';
    if (p.status === 'Critical') badgeClass = 'badge-critical';
    if (p.status === 'Recovered') badgeClass = 'badge-recovered';

    const card = document.createElement('div');
    card.className = 'patient-card';
    card.innerHTML = `
      <button class="btn-del" onclick="removePatient(${p.id})">✕</button>
      <div class="patient-card-header">
        <div class="patient-title">${p.name} (${p.age} yrs, ${p.gender})</div>
        <span class="badge ${badgeClass}">${p.status}</span>
      </div>
      <div class="patient-details">
        <div>Diagnosis: <span>${p.diagnosis}</span></div>
        <div>Treatment: <span>${p.treatment}</span></div>
        <div>Next Follow-Up: <span>${p.followup}</span></div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Load patient records on initial page load
document.addEventListener('DOMContentLoaded', () => {
  renderList(patients);
});
