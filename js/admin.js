import { createUser, getAllAppointments, getAllDoctors, createDoctor, deleteDoctor, getDoctorById, updateDoctor, updateUser, getAppointmentById, updateAppointment, getUserByRol } from "./api.js"
import { getAllUsers, deleteUser, getUserById } from "./api.js";
import { logout, getUsuarioSesion } from "./auth.js";

//obtener sesion
const usuario = getUsuarioSesion();

// no está logueado
if (!usuario) {
    window.location.href = "login.html";
}

// Si no es admin → lo saco
if (usuario.rol !== "ADMIN") {
    window.location.href = "user.html";
}

//cerrar sesion
document.getElementById("logoutBtn").addEventListener("click", () => {
    logout()
})


//cargar datos api
document.addEventListener("DOMContentLoaded", async () => {
    const doctors = await getAllDoctors();
    const users = await getUserByRol("USER");//pacientes 
    const allUsers = await getAllUsers();

    cargarSelectPacientes(users);
    cargarSelectDoctores(doctors);

    cargarTablaUsuarios(allUsers);
    cargarTablaDoctores(doctors);

    const turnos = await getAllAppointments();

    const ordenados = turnos.sort((a, b) => {
        return new Date(a.fecha) - new Date(b.fecha);
    });
    cargarTablaTurnos(ordenados);

    document.getElementById("adminName").innerText = usuario.nombre;
}
)

//crear option para filtrar pacientes y doctores  
function cargarSelectPacientes(users) {
    const sel = document.getElementById("filtroPaciente");
    users.forEach(u => {
        const op = document.createElement("option");
        op.value = u.id;
        op.textContent = u.nombre;
        sel.appendChild(op);
    });
}

function cargarSelectDoctores(doctors) {
    const sel = document.getElementById("filtroDoctor");
    doctors.forEach(d => {
        const op = document.createElement("option");
        op.value = d.id;
        op.textContent = d.nombre;
        sel.appendChild(op);
    });
}


//elegir paciente/doctor para tabla turnos 
document.getElementById("filtroPaciente").addEventListener("change", aplicarFiltros);
document.getElementById("filtroDoctor").addEventListener("change", aplicarFiltros);

async function aplicarFiltros() {
    const pacienteId = document.getElementById("filtroPaciente").value;
    const doctorId = document.getElementById("filtroDoctor").value;

    const todosTurnos = await getAllAppointments();

    const filtrados = todosTurnos.filter(t => {
        const okPaciente = (pacienteId === "todos") || (t.patientId == pacienteId);
        const okDoctor = (doctorId === "todos") || (t.doctorId == doctorId);
        return okPaciente && okDoctor;
    });


    const ordenados = filtrados.sort((a, b) => {
        return new Date(a.fecha) - new Date(b.fecha);
    });
    cargarTablaTurnos(ordenados);
    refrescarDashboardFiltrado(ordenados); // opcional
}



//addUser

document.getElementById("formNuevoUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreUsuario").value;
    const email = document.getElementById("emailUsuario").value;
    const password = document.getElementById("passwordUsuario").value;
    const rol = document.getElementById("rolUsuario").value;

    const nuevoUsuario = { nombre, email, password, rol };

    const saved = await createUser(nuevoUsuario);

    if (saved) {

        showIndicator(`Usuario ${nombre} creado correctamente`)

        refrescarUsuarios()
        $("#modalNuevoUsuario").modal("hide");
        e.target.reset();
    }
});

//addDoctor

document.getElementById("doctorForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("doctorName").value;
    const especialidad = document.getElementById("doctorSpecialty").value;

    const diasDisponibles = Array.from(
        document.querySelectorAll(".diasCheck:checked")
    ).map(c => c.value);

    const nuevoDoctor = {
        nombre,
        especialidad,
        diasDisponibles
    };

    const saved = await createDoctor(nuevoDoctor);

    if (saved) {
        // alert("Médico creado!");
        showIndicator(`Médico ${nombre} creado correctamente`)

        refrescarDoctores();
        $("#modalDr").modal("hide");
        e.target.reset();
    }
});


// --- Borrar usuario --- 
document.getElementById("usersTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("borrarUsuario")) {

        const id = e.target.dataset.id;

        const ok = await confirmarAccion("¿Seguro que querés borrar este usuario?")

        if (!ok) return;

        await deleteUser(id);
        // alert("Usuario eliminado correctamente.");
        showIndicator("Usuario eliminado correctamente", "danger")

        // refrescar tabla
        refrescarUsuarios()
    }
});

//borrar doctor 
document.getElementById("doctorsTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("BorrarDr")) {

        const id = e.target.dataset.id;

        const ok = await confirmarAccion("¿Seguro que querés borrar este Doctor?");
        if (!ok) return;

        await deleteDoctor(id);
        // alert("Doctor eliminado correctamente.");
        showIndicator("Doctor eliminado correctamente", "danger")


        // refrescar tabla
        refrescarDoctores()
    }
});

//editar doctor

document.getElementById("doctorsTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("editarDr")) {

        const id = e.target.dataset.id;

        const drActual = await getDoctorById(id);

        document.getElementById("doctorNameEdit").value = drActual[0].nombre;
        document.getElementById("doctorSpecialtyEdit").value = drActual[0].especialidad;

        document.querySelectorAll(".diasCheckEdit").forEach(chk => chk.checked = false);

        drActual[0].diasDisponibles.forEach(dia => {
            const check = document.querySelector(`.diasCheckEdit[value="${dia}"]`);
            if (check) check.checked = true;
        });

        // 👉 Guardamos el ID en el form
        document.getElementById("doctorFormEdit").dataset.idDoctor = drActual[0].id;

        $("#modalDrEdit").modal("show");
    }
});

document.getElementById("doctorFormEdit").addEventListener("submit", async (e) => {

    e.preventDefault();

    const id = e.target.dataset.idDoctor; // lo que guardamos antes

    const nombre = document.getElementById("doctorNameEdit").value;
    const especialidad = document.getElementById("doctorSpecialtyEdit").value;

    const diasDisponibles = [...document.querySelectorAll(".diasCheckEdit:checked")]
        .map(c => c.value);

    const doctor = { nombre, especialidad, diasDisponibles };

    const updated = await updateDoctor(id, doctor);
    console.log("UPDATED:", updated);

    if (updated) {
        // alert("Datos actualizados!");
        showIndicator("Datos actualizados correctamente")

        $("#modalDrEdit").modal("hide");
        refrescarDoctores();
    }

});




//editar Usuario
document.getElementById("usersTableBody").addEventListener("click", async (e) => {
    if (e.target.classList.contains("editUser")) {

        const id = e.target.dataset.id;

        const usuarioActual = await getUserById(id);

        // Cargar datos
        document.getElementById("nombreUsuarioEdit").value = usuarioActual[0].nombre;
        document.getElementById("emailUsuarioEdit").value = usuarioActual[0].email;
        document.getElementById("passwordUsuarioEdit").value = usuarioActual[0].password;
        document.getElementById("rolUsuarioEdit").value = usuarioActual[0].rol;

        // Guardar ID en dataset
        document.getElementById("formEditUsuario").dataset.userId = usuarioActual[0].id;

        $("#modalEditUsuario").modal("show");
    }
});


document.getElementById("formEditUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = e.target.dataset.userId;

    const user = {
        nombre: document.getElementById("nombreUsuarioEdit").value,
        email: document.getElementById("emailUsuarioEdit").value,
        password: document.getElementById("passwordUsuarioEdit").value,
        rol: document.getElementById("rolUsuarioEdit").value
    };

    const updated = await updateUser(id, user);

    if (updated) {
        // alert("Datos actualizados!");
        showIndicator("Datos actualizados correctamente")

        refrescarUsuarios();
        $("#modalEditUsuario").modal("hide");
        e.target.reset();
    }
});


//confirmar turno
document.getElementById("appointmentsTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("confirmarTurno")) {
        const id = e.target.dataset.id;
        const turno = await getAppointmentById(id)
        const ok = await confirmarAccion("esta segurno de confirmar este turno?")
        if (ok) {
            if (turno.estado == "Pendiente") {
                const turnoActualizado = {
                    "patientId": turno.patientId,
                    "doctorId": turno.doctorId,
                    "fecha": turno.fecha,
                    "hora": turno.hora,
                    "estado": "Confirmado",
                    "id": turno.id
                }

                const updated = await updateAppointment(turno.id, turnoActualizado)

                if (updated) {
                    // alert("turno confirmado")
                    showIndicator("Datos actualizados correctamente")

                    refrescarTurnos()
                }
            }
            else {

                showIndicator("turno ya Cancelado o Confirmado previamene", "warning")

            }
            //updateDashboard
            refrescarDashboard()
        }


    }



});




function cargarTablaDoctores(doctors) {
    const tbody = document.getElementById("doctorsTableBody");
    tbody.innerHTML = ""; // limpiar antes de cargar

    doctors.forEach(doc => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${doc.id}</td>
            <td>${doc.nombre}</td>
            <td>${doc.especialidad}</td>
            <td>${doc.diasDisponibles}</td>
            <td>
                <button class="btn btn-sm btn-warning editarDr" data-id="${doc.id}"  data-toggle="modal" data-target="#modalDrEdit">Editar</button>
                <button class="btn btn-sm btn-danger BorrarDr" data-id="${doc.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function cargarTablaUsuarios(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = ""; // limpiar antes de cargar

    users.forEach(user => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td>${user.rol}</td>

            <td>
                <button class="btn btn-sm btn-warning editUser" data-id="${user.id}" data-toggle="modal" data-target="#modalEditUsuario">Editar</button>
                <button class="btn btn-sm btn-danger borrarUsuario" data-id="${user.id}">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}



async function refrescarUsuarios() {
    const users = await getAllUsers();
    cargarTablaUsuarios(users);
}

async function refrescarDoctores() {
    const doctors = await getAllDoctors();
    cargarTablaDoctores(doctors);
}

export async function refrescarTurnos() {
    const turnos = await getAllAppointments();
    cargarTablaTurnos(turnos);
}



async function refrescarDashboard(turnosFiltrados = null) {

    const dashboard = document.getElementById("dashboard");
    dashboard.innerHTML = "";

    const turnos = turnosFiltrados || await getAllAppointments();
    const doctors = await getAllDoctors();
    const patients = await getAllUsers();
    // =============================
    //   MÉTRICAS BÁSICAS
    // =============================
    const hoy = hoyLocal(); // "2025-11-17"

    // Convertimos hoyLocal() a Date real sin UTC
    const d = new Date(`${hoy}T00:00:00`);

    // día de la semana (0 = domingo)
    const diaSemana = d.getDay();

    // si hoy es domingo, limite = hoy
    const diasHastaDomingo = diaSemana === 0 ? 0 : (7 - diaSemana);

    // sumar días hasta domingo
    const limiteDate = new Date(d.getTime() + diasHastaDomingo * 24 * 60 * 60 * 1000);

    // formatear como YYYY-MM-DD
    const limiteSemana = limiteDate.toISOString().slice(0, 10);

    let totalPendiente = 0;
    let totalCancelado = 0;
    let totalConfirmado = 0;
    let turnosHoy = 0;
    let turnosSemana = 0;

    for (const t of turnos) {
        if (t.estado === "Pendiente") totalPendiente++;
        if (t.estado === "Cancelado") totalCancelado++;
        if (t.estado === "Confirmado") totalConfirmado++;

        if (t.fecha === hoy) turnosHoy++;

        if (t.fecha >= hoy && t.fecha <= limiteSemana) turnosSemana++;
    }

    const totalTurnos = turnos.length;
    //const totalPacientes = patients?.length || 1;
    // const promedioPorPaciente = (totalTurnos / totalPacientes).toFixed(1);

    // =============================
    //   HTML COMPLETO DEL DASHBOARD
    // =============================
    dashboard.innerHTML = `
        <h3 class="mb-3">Dashboard de Turnos</h3>

        <!-- CARDS -->
        <div class="row mb-3">
            <div class="col-md-4">
                <div class="card text-white bg-primary mb-3">
                    <div class="card-body ">
                        <h5 class="card-title text-center">Turnos Hoy</h5>
                        <p class="card-text display-4 text-center">${turnosHoy}</p>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card text-white bg-info mb-3">
                    <div class="card-body">
                        <h5 class="card-title text-center">Turnos Semana</h5>
                        <p class="card-text display-4 text-center">${turnosSemana}</p>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card text-white bg-success mb-3">
                    <div class="card-body">
                        <h5 class="card-title text-center">Total Turnos</h5>
                        <p class="card-text display-4 text-center">${totalTurnos}</p>
                    </div>
                </div>
            </div>

            
        </div>

        <!-- GRÁFICOS -->
        <div class="row">
            <div class="col-md-4">
                <h5>Estados</h5>
                <canvas id="chartEstados" height="250"></canvas>
            </div>

            <div class="col-md-4">
                <h5>Turnos por Doctor</h5>
                <canvas id="chartDoctors" height="250"></canvas>
            </div>

            <div class="col-md-4">
                <h5>Especialidades</h5>
                <canvas id="chartEspecialidades" height="250"></canvas>
            </div>
        </div>



    `;

    // =============================
    //   CHART: ESTADOS (Pie)
    // =============================
    new Chart(document.getElementById("chartEstados"), {
        type: "pie",
        data: {
            labels: ["Pendientes", "Confirmados", "Cancelados"],
            datasets: [{
                data: [totalPendiente, totalConfirmado, totalCancelado],
                backgroundColor: ["#ffc107", "#28a745", "#dc3545"]
            }]
        }
    });

    // =============================
    //   CHART: TURNOS POR DOCTOR
    // =============================
    const labelsDoctors = doctors.map(d => d.nombre);
    const turnosPorDoctor = doctors.map(d =>
        turnos.filter(t => t.doctorId == d.id).length
    );

    new Chart(document.getElementById("chartDoctors"), {
        type: "bar",
        data: {
            labels: labelsDoctors,
            datasets: [{
                label: "Turnos",
                data: turnosPorDoctor,
                backgroundColor: "#007bff"
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    // =============================
    //   CHART: ESPECIALIDADES
    // =============================
    const mapaEspecialidad = {};
    for (const d of doctors) mapaEspecialidad[d.especialidad] = 0;
    for (const t of turnos) {
        const doctor = doctors.find(d => d.id == t.doctorId);
        if (doctor) mapaEspecialidad[doctor.especialidad]++;
    }

    new Chart(document.getElementById("chartEspecialidades"), {
        type: "doughnut",
        data: {
            labels: Object.keys(mapaEspecialidad),
            datasets: [{
                data: Object.values(mapaEspecialidad),
                backgroundColor: ["#17a2b8", "#6f42c1", "#20c997", "#fd7e14"]
            }]
        }
    });



}


function refrescarDashboardFiltrado(turnosFiltrados) {

    refrescarDashboard(turnosFiltrados);

}


async function cargarTablaTurnos(turnos) {
    const tbody = document.getElementById("appointmentsTableBody");
    tbody.innerHTML = ""; // limpiar antes de cargar
    const doctores = await getAllDoctors();  // 1 sola petición

    const mapaDoctores = {};
    for (const doc of doctores) {
        mapaDoctores[doc.id] = doc;
    }

    const pacientes = await getAllUsers();  // 1 sola petición

    const mapaUsuarios = {};
    for (const user of pacientes) {
        mapaUsuarios[user.id] = user;
    }


    for (const turno of turnos) {

        const doctor = mapaDoctores[turno.doctorId];
        const user = mapaUsuarios[turno.patientId];

        const tr = document.createElement("tr");
        // tr.classList.add("")
        tr.innerHTML = `
            <td>${turno.id}</td>
            <td>${user.nombre}</td>
            <td>${doctor.nombre}</td>
            <td>${turno.fecha}</td>
            <td>${turno.hora}</td>
            <td>${turno.estado}</td>
            <td>
                <button class="btn btn-sm btn-info confirmarTurno" data-id="${turno.id}">Confirmar</button>
            </td>
            </td>
        `;

        tbody.appendChild(tr);
    }
}


//dashboard

document.getElementById("appointments-tab").addEventListener("click", async (e) => {
    refrescarDashboard()
})






function hoyLocal() {// para no usar utc y tener la hora correcta 
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function showIndicator(mensaje, tipo = "success", tiempo = 3000) {
    const alerta = document.getElementById("OpConcretada");
    const mensajeElem = document.getElementById("mensaje");

    // Reset clases
    alerta.className = "alert alert-dismissible alert-" + tipo;

    // Mostrar mensaje
    mensajeElem.innerText = mensaje;

    // Mostrar alerta
    alerta.style.display = "block";

    // Autocerrar después de X tiempo
    setTimeout(() => {
        // $(alerta).alert("close");
        alerta.style.display = "none";
    }, tiempo);
}

function confirmarAccion(mensaje) {
    return new Promise(resolve => {
        document.getElementById("modalConfirmMessage").innerText = mensaje;

        // Abrir modal
        $("#modalConfirm").modal("show");

        const btnConfirmar = document.getElementById("btnConfirmarAccion");

        // Para evitar listeners duplicados
        btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
        const btnNuevo = document.getElementById("btnConfirmarAccion");

        btnNuevo.addEventListener("click", () => {
            $("#modalConfirm").modal("hide");
            resolve(true);
        });

        // Si cierra sin confirmar
        $('#modalConfirm').on('hidden.bs.modal', () => {
            resolve(false);
        });
    });
}
