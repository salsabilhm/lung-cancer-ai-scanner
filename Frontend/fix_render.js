// FIX: Ensure appointments are always rendered when currentFilter is "all"
const app = document.getElementById('pageseerve.js');
const content = app.innerHTML;

// Replace the filter logic in renderAppointments
// The issue: when currentFilter is "all", all appointments should show
// But the status check might be filtering them out unexpectedly

// New filter logic:
/*
let filteredAppointments = appointments;

if (currentFilter !== "all") {
    filteredAppointments = appointments.filter(
        (appointment) =>
            appointment.status &&
            appointment.status.toLowerCase() ===
                currentFilter.toLowerCase()
    );
}

// OLD CODE that may have been causing the issue:
// if (currentFilter !== "all") {
//     filteredAppointments = appointments.filter(
//         (appointment) =>
//             appointment.status &&
//             appointment.status.toLowerCase() ===
//                 currentFilter.toLowerCase()
//     );
// }
*/
PYEOF