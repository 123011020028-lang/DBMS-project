/* =========================================================
   FINAL CLEAN & COMPLETE script.js - All Features Working
   ========================================================= */

// =========================================================
// UTILITIES
// =========================================================
function saveDonorObject(donor) {
    const raw = localStorage.getItem("donors");
    const arr = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex(d => d.email === donor.email);

    if (idx >= 0) arr[idx] = donor;
    else arr.push(donor);

    localStorage.setItem("donors", JSON.stringify(arr));
}

function getDonorByEmail(email) {
    const raw = localStorage.getItem("donors");
    const arr = raw ? JSON.parse(raw) : [];
    return arr.find(d => d.email === email);
}

/* -------------------- REGISTRATION -------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const reg = document.getElementById('registerForm');

  if (reg) {
    reg.addEventListener('submit', (e) => {
      e.preventDefault();

      const donor = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        age: document.getElementById('age').value,
        phone: document.getElementById('phone').value,
        blood: document.getElementById('blood').value,
        city: document.getElementById('city').value
      };

      if (!donor.email || !donor.password || !donor.name) {
        alert('Please fill required fields.');
        return;
      }

      saveDonorObject(donor);
      localStorage.setItem('loggedInEmail', donor.email);

      alert('Registration successful!');
      window.location.href = 'dashboard.html';  // ✔ FIXED
    });
  }
});


/* -------------------- LOGIN -------------------- */

document.addEventListener('DOMContentLoaded', () => {
    const login = document.getElementById('loginForm');

    if (login) {
        login.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const pass = document.getElementById('loginPassword').value;

            const donor = getDonorByEmail(email);

            if (donor && donor.password === pass) {
                localStorage.setItem('loggedInEmail', email);
                alert('Login successful!');
                window.location.href = 'dashboard.html';  // ✔ FIXED
            } else {
                document.getElementById('loginMessage').innerText = 'Invalid credentials.';
            }
        });
    }
});

// =========================================================
// DASHBOARD BUTTONS
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const historyBtn = document.getElementById("historyBtn");
    const campsBtn = document.getElementById("campsBtn");

    if (historyBtn) {
        historyBtn.addEventListener("click", () => {
            window.location.href = "donation_history.html";
        });
    }

    if (campsBtn) {
        campsBtn.addEventListener("click", () => {
            window.location.href = "upcoming_camps.html";
        });
    }
});

// Common function
function goHome() {
    window.location.href = "index.html";
}

// -------------------- HOSPITAL PORTAL --------------------
document.addEventListener("DOMContentLoaded", () => {
    const findDonorsBtn = document.getElementById("findDonorsBtn");
    const emergencyBtn = document.getElementById("emergencyBtn");

    // FIXED: Redirect to donor list
    if (findDonorsBtn) {
        findDonorsBtn.addEventListener("click", () => {
            window.location.href = "donor_list.html";
        });
    }

    if (emergencyBtn) {
        emergencyBtn.addEventListener("click", () => {
            if (!navigator.geolocation) {
                alert("Geolocation not supported on this device.");
                return;
            }

            navigator.geolocation.getCurrentPosition((pos) => {
                alert(`Emergency request sent!\nLat: ${pos.coords.latitude}\nLon: ${pos.coords.longitude}`);
            }, () => {
                alert("Location permission is required.");
            });
        });
    }
});


// =========================================================
// DONOR LIST PAGE
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("donorTable");
    const filter = document.getElementById("bloodFilter");

    if (table && filter) {
        loadDonors();
        filter.addEventListener("change", loadDonors);

        function loadDonors() {
            const donors = JSON.parse(localStorage.getItem("donors")) || [];
            const selected = filter.value;

            table.innerHTML = "";

            donors
                .filter(d => (selected === "ALL" ? true : d.blood === selected))
                .forEach(d => {
                    table.innerHTML += `
                        <tr>
                            <td>${d.name}</td>
                            <td>${d.blood}</td>
                            <td>${d.city}</td>
                            <td>${d.phone}</td>
                        </tr>
                    `;
                });
        }
    }
});

// =========================================================
// GEOLOCATION + NEARBY HOSPITALS (Overpass API)
// =========================================================
function findNearestHospitals() {
    const out = document.getElementById("result");
    if (!out) return;

    out.style.display = "block";
    out.innerHTML = "<p>Detecting location...</p>";

    if (!navigator.geolocation) {
        out.innerHTML = "<p style='color:red'>Geolocation not supported.</p>";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            out.innerHTML = `
                <p><b>Your Location:</b> ${lat.toFixed(
                    6
                )}, ${lon.toFixed(6)}</p>
                <p>Searching hospitals near you…</p>
            `;

            const query = `
                [out:json];
                (
                  node["amenity"="hospital"](around:3000,${lat},${lon});
                  way["amenity"="hospital"](around:3000,${lat},${lon});
                );
                out center;
            `;

            fetch(
                "https://overpass-api.de/api/interpreter?data=" +
                    encodeURIComponent(query)
            )
                .then(r => r.json())
                .then(data => {
                    if (!data.elements.length) {
                        out.innerHTML += "<p>No hospitals nearby.</p>";
                        return;
                    }

                    let html = "<h3>Nearby Hospitals</h3>";

                    data.elements.forEach(h => {
                        const hLat = h.lat || h.center.lat;
                        const hLon = h.lon || h.center.lon;

                        html += `
                            <div style="padding:10px;background:#f1faff;margin:10px;border-radius:8px;">
                                <b>${h.tags.name || "Unnamed Hospital"}</b><br>
                                <a target="_blank" href="https://maps.google.com/?q=${hLat},${hLon}">
                                    Open in Google Maps
                                </a>
                            </div>`;
                    });

                    out.innerHTML += html;
                });
        },
        () => {
            out.innerHTML =
                "<p style='color:red'>Location permission denied.</p>";
        }
    );
}

// =========================================================
// ADMIN LOGIN
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("adminLoginBtn");

    if (btn) {
        btn.addEventListener("click", () => {
            const user = document.getElementById("adminUser").value.trim();
            const pass = document.getElementById("adminPass").value;

            if (user === "admin" && pass === "admin123") {
                alert("Admin Login Successful!");
                window.location.href = "admin_dashboard.html"; // FIXED
            } else {
                document.getElementById("loginMessage").innerText =
                    "Invalid admin credentials!";
            }
        });
    }
});

function adminLogout() {
    window.location.href = "index.html";
}

