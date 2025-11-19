const BASE_URL = "https://6918822421a9635948704679.mockapi.io/clinicaSalud"
const BASE_URL_APPOINTMENT = "https://691884c621a96359487050a2.mockapi.io/clinicaSalud"

//====================users====================

// obtener usuario por email
export function getUserByEmail(email) {
    return fetch(`${BASE_URL}/user?email=${email}`)
        .then(r => r.json());
}


// obtener usuario por id
export function getUserById(id) {
    return fetch(`${BASE_URL}/user?id=${id}`)
        .then(r => r.json());
}

// obtener usuario por rol
export function getUserByRol(rol) {
    return fetch(`${BASE_URL}/user?rol=${rol}`)
        .then(r => r.json());
}

// obtener todos los usuarios
export function getAllUsers() {
    return fetch(`${BASE_URL}/user`)
        .then(response => response.json());
}

// crear usuario
export function createUser(data) {
    return fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

// actualizar usuario
export function updateUser(id, data) {
    return fetch(`${BASE_URL}/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

// eliminar usuario
export function deleteUser(id) {
    return fetch(`${BASE_URL}/user/${id}`, {
        method: "DELETE"
    }).then(r => r.json());
}

//====================doctor====================

// obtener todos los médicos
export function getAllDoctors() {
    return fetch(`${BASE_URL}/doctors`)
        .then(r => r.json());
}

// obtener médico por ID
export function getDoctorById(id) {
    return fetch(`${BASE_URL}/doctors?id=${id}`)
        .then(r => r.json());
}

// crear médico
export function createDoctor(data) {
    return fetch(`${BASE_URL}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

// actualizar médico
export function updateDoctor(id, data) {
    return fetch(`${BASE_URL}/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

// eliminar médico
export function deleteDoctor(id) {
    return fetch(`${BASE_URL}/doctors/${id}`, {
        method: "DELETE"
    }).then(r => r.json());
}



//====================appointments==============================


// obtener todos los turnos
export function getAllAppointments() {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments`)
        .then(r => r.json());
}

// obtener turnos por paciente
export function getAppointmentByPatient(id) {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments?patientId=${id}`)
        .then(r => r.json());
}

// obtener turno por ID
export function getAppointmentById(id) {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments/${id}`)
        .then(r => r.json());
}

// obtener turnos de un doctor
export function getAppointmentsByDoctor(doctorId) {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments?doctorId=${doctorId}`)
        .then(r => r.json());
}

// obtener turnos por fecha
export function getAppointmentsByDate(date) {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments?fecha=${date}`)
        .then(r => r.json());
}

// crear turno
export function createAppointment(data) {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

// actualizar turno
export function updateAppointment(id, data) {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

// eliminar turno
export function deleteAppointment(id) {
    return fetch(`${BASE_URL_APPOINTMENT}/appointments/${id}`, {
        method: "DELETE"
    }).then(r => r.json());
}
