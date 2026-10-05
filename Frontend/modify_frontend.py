import re

with open("pageseerve.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add admin detection in loadCurrentUser function (if not already added)
# Check if isAdmin is already set
if "currentUser.isAdmin" not in content:
    # Find the line: currentUser = await response.json()
    # and insert isAdmin check after it
    old_pattern = "currentUser = await response.json();"
    new_pattern = """currentUser = await response.json();

    # Admin detection
    currentUser.isAdmin = currentUser.is_staff === true || currentUser.role === "admin";"""

    content = content.replace(old_pattern, new_pattern)

# 2. Add updateAppointmentStatus function before INITIALIZATION
# Find the INITIALIZATION section start
init_marker = "/* ========================================================="
init_pos = content.find(init_marker)
if init_pos != -1:
    # Find the line before the INITIALIZATION marker
    lines = content[:init_pos].split("\n")
    # Insert the updateAppointmentStatus function before the marker
    func_code = '''

// Status update function
async function updateAppointmentStatus(appointmentId, newStatus) {
    const token = getAccessToken();

    if (!token) {
        handleUnauthorized();
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/appointments/${appointmentId}/`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            }
        );


        if (response.status === 401) {
            handleUnauthorized();
            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to update appointment status"
            );
        }


        return await response.json();

    } catch (error) {
        console.error(
            "Status update error:",
            error
        );
    }
}'''

    # Insert before the initialization marker
    content = content[:init_pos] + func_code + "\n" + content[init_pos:]

# 3. Add status update UI in renderAppointments admin response column
# Find the admin response column HTML
old_admin_col = """// ADMIN RESPONSE / ACTION

                        <td>

                            ${adminResponse
                                ? `
                                    <span
                                        class="admin-response"
                                    >
                                        ${adminResponse}
                                    </span>
                                `
                                : "-"
                            }
                        </td>"""

new_admin_col = """// ADMIN RESPONSE / ACTION

                        <td>

                            ${currentUser && currentUser.isAdmin ? (
                                `
                                <div class="admin-status-actions">
                                    <select class="status-select" data-id="${appointment.id}">
                                        <option value="PENDING" ${appointment.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                                        <option value="ACCEPTED" ${appointment.status === 'ACCEPTED' ? 'selected' : ''}>Accepted</option>
                                        <option value="REJECTED" ${appointment.status === 'REJECTED' ? 'selected' : ''}>Rejected</option>
                                        <option value="CANCELLED" ${appointment.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                                        <option value="COMPLETED" ${appointment.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                    </select>
                                    <button class="update-status-btn" data-id="${appointment.id}">Update</button>
                                </div>
                                `
                            ) : (
                                adminResponse
                                    ? `
                                        <span
                                            class="admin-response"
                                        >
                                            ${adminResponse}
                                        </span>
                                    `
                                    : "-")
                            }"""

if old_admin_col in content:
    content = content.replace(old_admin_col, new_admin_col)
    print("Admin column updated")
else:
    print("Admin column pattern not found - checking for variations")
    # Try alternative pattern
    old_admin_col2 = """<td>

                            ${adminResponse
                                ? `
                                    <span
                                        class="admin-response"
                                    >
                                        ${adminResponse}
                                    </span>
                                `
                                : "-"
                            }
                        </td>"""

    if old_admin_col2 in content:
        content = content.replace(old_admin_col2, new_admin_col)
        print("Admin column updated (alternative pattern)")
    else:
        print("Admin column pattern not found")

# Write the modified content back
with open("pageseerve.js", "w", encoding="utf-8") as f:
    f.write(content)

print("File modified successfully")