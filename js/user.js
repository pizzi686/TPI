import { getAllAppointments, getAllDoctors, getAppointmentById, getAppointmentByPatient, getAppointmentsByDoctor, getDoctorById, updateAppointment } from "./api.js"
import { createAppointment } from "./api.js";
import { getUsuarioSesion, logout } from "./auth.js";
//import { refrescarTurnos  as rta }from "./admin.js";

//obtener datos sesion localstorage
const usuario = getUsuarioSesion();

//validar sesion
if (!usuario) {
    window.location.href = "login.html";
}
//redirifir segun rol 
if (usuario.rol !== "USER") {
    window.location.href = "admin.html";
}

//logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    logout()
})


// cargar datos api
document.addEventListener("DOMContentLoaded", async () => {
    const doctors = await getAllDoctors()
    selectDoctors(doctors)

    const appointments = await getAppointmentByPatient(usuario.id)
    cargarTablaTurnos(appointments)

    document.getElementById("userName").innerText = usuario.nombre


})

async function cargarTablaTurnos(turnos) {
    const tbody = document.getElementById("misTurnosTableBody");
    tbody.innerHTML = "";

    const doctores = await getAllDoctors();  // 1 sola petición

    const mapaDoctores = {};
    for (const doc of doctores) {
        mapaDoctores[doc.id] = doc;
    }


    for (const turno of turnos) {

        const doctor = mapaDoctores[turno.doctorId];

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${turno.fecha}</td>
            <td>${turno.hora}</td>
            <td>${doctor.nombre}</td>
            <td>${doctor.especialidad}</td>
            <td>${turno.estado}</td>
            <td>
                <button class="btn btn-sm btn-warning cancelarTurno" data-id="${turno.id}">Cancelar</button>
                
            </td>
        `;

        tbody.appendChild(tr);
    }
}

async function refrescarTurnos() {
    const turnos = await getAppointmentByPatient(usuario.id);
    cargarTablaTurnos(turnos);
}

function selectDoctors(doctors) {
    const select = document.getElementById("doctorSelect");

    doctors.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${doc.nombre} (${doc.especialidad})`;
        option.dataset.dias = JSON.stringify(doc.diasDisponibles);
        select.appendChild(option);
    });
}

//medico seleccionado // mostrar dias disponibles 
document.getElementById("doctorSelect").addEventListener("change", async () => {
    const doctors = await getAllDoctors()
    const select = document.getElementById("doctorSelect");
    // const option = select.options[select.selectedIndex];

    if (doctors[select.selectedIndex - 1]) {
        document.getElementById("diasDisponibles").innerText = `dias disponibles: ${doctors[select.selectedIndex - 1].diasDisponibles}`
    }
    else {
        document.getElementById("diasDisponibles").innerText = ""
    }


});

//cancelarTurno

document.getElementById("misTurnosTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("cancelarTurno")) {

        const id = e.target.dataset.id;

        const ok = confirm("¿Seguro que querés cancelar este turno?");
        if (!ok) return;

        let turno = await getAppointmentById(id)
        turno.estado = "Cancelado"




        await updateAppointment(id, turno);
        alert("turno cancelado.");

        refrescarTurnos()
       // rta()


    }
});


// reservar turno 
document.getElementById("nuevoTurnoForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const drSelect = document.getElementById("doctorSelect");
    const doctorId = Number(drSelect.value);
    const fecha = document.getElementById("fechaTurno").value;
    const hora = document.getElementById("horaTurno").value;

    if (!doctorId) {
        alert("Seleccione un médico válido.");
        return;
    }


    //validar diasDisponibles
    const drSelectedObject = await getDoctorById(doctorId);
    const dia = obtenerDiaSemana(fecha); // ej: "Martes"

    if (!drSelectedObject[0].diasDisponibles.includes(dia)) {
        alert(`El médico no atiende el día ${dia}.`);
        return;
    }

    //validar turnosOcupados 


    const turnosPorDoctor = await getAppointmentsByDoctor(doctorId);

    for (const turno of turnosPorDoctor) {
        if (turno.fecha === fecha && turno.hora === hora) {
            alert("Ese turno ya está ocupado. Elija otro horario.");
            return;
        }
    }

    // 3. Crear turno
    const nuevoTurno = {
        patientId: Number(usuario.id),
        doctorId: doctorId,
        fecha: fecha,
        hora: hora,
        estado: "Pendiente"
    };

    const saved = await createAppointment(nuevoTurno);

    if (saved) {
        alert("Turno reservado con éxito");
        document.getElementById("nuevoTurnoForm").reset();
        refrescarTurnos();
       // rta()
    } else {
        alert("Hubo un error al reservar el turno.");
    }
});


//obtener dia semana 

function obtenerDiaSemana(fechaInput) {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    
    // descomponer AAAA-MM-DD
    const [anio, mes, dia] = fechaInput.split("-").map(Number);

    // crear fecha evitando UTC: año, mes-1, día
    const d = new Date(anio, mes - 1, dia);

    return dias[d.getDay()];
}







