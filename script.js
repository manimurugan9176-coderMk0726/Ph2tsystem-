function calculateEnergy() {
  const appliance = document.getElementById("appliance").value;
  const watts = parseFloat(document.getElementById("watts").value);
  const hours = parseFloat(document.getElementById("hours").value);
  const ratePerUnit = 6.5; // தமிழ்நாட்டின் சராசரி tariff (₹ per kWh)

  if (!appliance || isNaN(watts) || isNaN(hours)) {
    alert("Please fill all details correctly!");
    return;
  }

  // Energy Calculation: (Watts * Hours) / 1000 = kWh (Units)
  const units = ((watts * hours) / 1000).toFixed(2);
  const cost = (units * ratePerUnit).toFixed(2);

  // Waste Detection Logic
  let status = "Normal Usage ✅";
  let tip = "Optimal usage. Keep it up!";

  if (hours > 8 && watts > 800) {
    status = "High Energy Wastage ⚠️";
    tip = "Heavy power consumption detected! Consider using a timer or switching off when not needed.";
  } else if (hours > 15) {
    status = "Moderate Wastage ⚠️";
    tip = "This device runs for extended hours. Turn it off when idle.";
  }

  // Displaying Output
  document.getElementById("res-appliance").innerText = appliance;
  document.getElementById("res-energy").innerText = units;
  document.getElementById("res-cost").innerText = cost;
  document.getElementById("res-status").innerText = status;
  document.getElementById("res-tip").innerText = tip;

  document.getElementById("result").style.display = "block";
}
