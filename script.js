let students = []; // Main array to store student data

// Save students array to localStorage
function saveToLocalStorage() {
  localStorage.setItem("students", JSON.stringify(students));
}

// Load students array from localStorage
function loadFromLocalStorage() {
  const stored = localStorage.getItem("students");
  if (stored) {
    students = JSON.parse(stored);
  } else {
    students = [];
  }
}

// Open Add Student modal
function openAddModal() {
  document.getElementById("addStudentModal").classList.remove("hidden");
}

// Close Add Student modal and reset form
function closeAddModal() {
  document.getElementById("addStudentForm").reset();
  document.getElementById("addStudentModal").classList.add("hidden");
}

// Add new student
function addStudent() {
  const name = document.getElementById("studentName").value;
  const contact = document.getElementById("studentContact").value;
  const fee = parseFloat(document.getElementById("studentFee").value);
  const lastPayment = document.getElementById("studentLastPayment").value;
  const status = document.getElementById("studentStatus").value;

  const newStudent = {
    id: students.length + 1,
    name,
    contact,
    fee,
    status,
    lastPayment,
  };

  students.push(newStudent);

  saveToLocalStorage();   // Save data to localStorage after update

  closeAddModal();
  renderStudents();
  updateDashboard();
}

// Render students table (with optional search filter)
function renderStudents(filtered = "") {
  const tableBody = document.getElementById("studentTableBody");
  tableBody.innerHTML = "";

  const visibleStudents = students.filter(s =>
    s.name.toLowerCase().includes(filtered.toLowerCase())
  );

  visibleStudents.forEach(student => {
    const row = `<tr>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.contact}</td>
      <td>₹${student.fee}</td>
      <td>${student.status}</td>
      <td>${formatMonth(student.lastPayment)}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

// Format "YYYY-MM" to "Month Year" e.g. "June 2025"
function formatMonth(iso) {
  if (!iso) return "";  // Handle empty or invalid values
  const [year, month] = iso.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

// Update dashboard stats
function updateDashboard() {
  document.getElementById("totalStudents").innerText = students.length;

  let totalPaid = 0;
  let totalPending = 0;

  students.forEach(s => {
    if (s.status === "Paid") {
      totalPaid += s.fee;
    } else {
      totalPending += s.fee;
    }
  });

  document.getElementById("totalPaid").innerText = `₹${totalPaid}`;
  document.getElementById("totalPending").innerText = `₹${totalPending}`;
  document.getElementById("currentMonth").innerText = `₹${totalPaid}`;
}

// Search students on input
function searchStudent() {
  const input = document.getElementById("searchInput").value;
  renderStudents(input);
}

// Export students data to Excel
function exportToExcel() {
  const data = students.map(s => ({
    ID: s.id,
    Name: s.name,
    Contact: s.contact,
    "Monthly Fee": s.fee,
    Status: s.status,
    "Last Payment": formatMonth(s.lastPayment),
  }));

  const sheet = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Students");

  XLSX.writeFile(wb, "Mess_Student_Data.xlsx");
}

// On page load, initialize data from localStorage and render
window.onload = () => {
  loadFromLocalStorage();
  renderStudents();
  updateDashboard();
};

// Called on input in the search bar
function searchStudent() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  renderStudents(input);
}

// Renders students table filtered by optional search text
function renderStudents(filtered = "") {
  const tableBody = document.getElementById("studentTableBody");
  tableBody.innerHTML = "";

  // Filter students whose name includes the search text (case-insensitive)
  const visibleStudents = students.filter(student =>
    student.name.toLowerCase().includes(filtered)
  );

  if (visibleStudents.length === 0) {
    // Show a "No results" row if nothing matches
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">No students found</td>
      </tr>
    `;
    return;
  }

  // Otherwise, create table rows for filtered students
  visibleStudents.forEach(student => {
    const row = `<tr>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.contact}</td>
      <td>₹${student.fee}</td>
      <td>${student.status}</td>
      <td>${formatMonth(student.lastPayment)}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}
// Open and close Record Payment modal
function openPaymentModal() {
  const dropdown = document.getElementById("paymentStudent");
  dropdown.innerHTML = `<option value="">Select Student</option>`;

  // Populate student dropdown
  students.forEach((s, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${s.name} (${s.id})`;
    dropdown.appendChild(option);
  });

  document.getElementById("paymentModal").classList.remove("hidden");
}

function closePaymentModal() {
  document.getElementById("recordPaymentForm").reset();
  document.getElementById("paymentModal").classList.add("hidden");


}
function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  // Simple hardcoded credentials
  if (user === "admin" && pass === "admin123") {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").style.display = "block";
  }
}

// Show View Payment Section and hide main content
function openViewPayment() {
  document.querySelector(".container").classList.add("hidden"); // main dashboard container
  document.getElementById("viewPaymentSection").classList.remove("hidden");
  renderViewPaymentList();
}

// Close View Payment section, show main dashboard
function closeViewPaymentSection() {
  document.getElementById("viewPaymentSection").classList.add("hidden");
  document.querySelector(".container").classList.remove("hidden");
}

// Render enrolled students list in View Payment Section
function renderViewPaymentList() {
  const tbody = document.getElementById("viewPaymentTableBody");
  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No enrolled students</td></tr>`;
    return;
  }

  students.forEach((student, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${student.id}</td>
      <td><a href="#" onclick="openStudentDetail(${index});return false;">${student.name}</a></td>
      <td>${student.contact}</td>
      <td>₹${student.fee}</td>
      <td>${student.status}</td>
      <td>${formatMonth(student.lastPayment)}</td>
      <td><button onclick="deleteStudent(${index})">Delete</button></td>
    `;

    tbody.appendChild(tr);
  });
}

// Open student detail modal
function openStudentDetail(index) {
  window.currentStudentIndex = index;
  const student = students[index];

  document.getElementById("detailName").innerText = student.name;
  document.getElementById("detailPhoto").src = student.photo || "https://via.placeholder.com/150?text=No+Photo";

  const historyBody = document.getElementById("detailPaymentHistory");
  historyBody.innerHTML = "";

  if (!student.payments || student.payments.length === 0) {
    historyBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No payment history</td></tr>`;
  } else {
    student.payments.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatMonth(p.month)}</td>
        <td>₹${p.amount}</td>
        <td>${p.status || "Paid"}</td>
        <td>${p.date}</td>
      `;
      historyBody.appendChild(tr);
    });
  }

  document.getElementById("studentDetailModal").classList.remove("hidden");
}

// Close student detail modal
function closeStudentDetailModal() {
  document.getElementById("studentDetailModal").classList.add("hidden");
}

// Handle photo upload for student detail modal
function handleDetailPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    students[window.currentStudentIndex].photo = reader.result;
    saveToLocalStorage();
    document.getElementById("detailPhoto").src = reader.result;
    renderViewPaymentList(); // update photo if displayed in list
  };
  reader.readAsDataURL(file);
}

// Delete student from list (and localStorage)
function deleteStudent(index) {
  if (confirm(`Delete student ${students[index].name}? This action cannot be undone.`)) {
    students.splice(index, 1);
    saveToLocalStorage();
    renderViewPaymentList();
    updateDashboard();
  }
}

function exportToExcel() {
  // Prepare array of data objects for students
  const data = students.map(student => {
    // Flatten payment history info into a readable string (optional)
    let paymentHistory = "No payments";
    if (student.payments && student.payments.length > 0) {
      paymentHistory = student.payments
        .map(p => {
          const month = formatMonth(p.month);
          return `${month}: ₹${p.amount} (${p.status || "Paid"}) on ${p.date}`;
        })
        .join("\n");
    }

    return {
      ID: student.id,
      Name: student.name,
      Contact: student.contact,
      "Monthly Fee": student.fee,
      Status: student.status,
      "Last Payment": formatMonth(student.lastPayment),
      "Payment History": paymentHistory,
      // Photo is a base64 string; skipping in Excel export for simplicity
    };
  });

  // Convert to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data, { cellDates: true });

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  // Trigger download of Excel file
  XLSX.writeFile(workbook, "Mess_Student_Data.xlsx");
}
