import { createUser, getAllAppointments, getAllDoctors, createDoctor, deleteDoctor, getDoctorById, updateDoctor, updateUser, getAppointmentById, updateAppointment } from "./api.js"
import { getAllUsers, deleteUser, getUserById } from "./api.js";
import { logout, getUsuarioSesion } from "./auth.js";

const usuario = getUsuarioSesion();

if (!usuario) {
    window.location.href = "login.html";   // no está logueado
}

// Si no es admin → lo saco
if (usuario.rol !== "ADMIN") {
    window.location.href = "usuario.html";
}

//cerrar sesion
document.getElementById("logoutBtn").addEventListener("click", () => {
    logout()
})




//cargar datos api
document.addEventListener("DOMContentLoaded", async () => {
    const doctors = await getAllDoctors()
    cargarTablaDoctores(doctors);
    const users = await getAllUsers()
    cargarTablaUsuarios(users)
    const turnos = await getAllAppointments()
    cargarTablaTurnos(turnos)
    document.getElementById("adminName").innerText = usuario.nombre

}
)

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
        alert("Usuario creado!");
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
        alert("Médico creado!");
        refrescarDoctores();
        $("#modalDr").modal("hide");
        e.target.reset();
    }
});


// --- Borrar usuario --- ✅
document.getElementById("usersTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("borrarUsuario")) {

        const id = e.target.dataset.id;

        const ok = confirm("¿Seguro que querés borrar este usuario?");
        if (!ok) return;

        await deleteUser(id);
        alert("Usuario eliminado correctamente.");

        // refrescar tabla
        refrescarUsuarios()
    }
});

//borrar doctor ✅
document.getElementById("doctorsTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("BorrarDr")) {

        const id = e.target.dataset.id;

        const ok = confirm("¿Seguro que querés borrar este Doctor?");
        if (!ok) return;

        await deleteDoctor(id);
        alert("Doctor eliminado correctamente.");

        // refrescar tabla
        refrescarDoctores()
    }
});

//editar doctor

document.getElementById("doctorsTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("editarDr")) {

        const id = e.target.dataset.id;

        const drActual = await getDoctorById(id)
        // Cargar datos en el modal
        document.getElementById("doctorNameEdit").value = drActual[0].nombre;
        document.getElementById("doctorSpecialtyEdit").value = drActual[0].especialidad;

        // Limpiar todos los checks
        document.querySelectorAll(".diasCheckEdit").forEach(chk => chk.checked = false);

        // // Marcar días del médico
        drActual[0].diasDisponibles.forEach(dia => {
            const check = document.querySelector(`.diasCheckEdit[value="${dia}"]`);
            if (check) check.checked = true;
        });

        // Abrir modal
        $("#modalDrEdit").modal("show");


        //subbmit forom
        document.getElementById("doctorFormEdit").addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("doctorNameEdit").value;
            const especialidad = document.getElementById("doctorSpecialtyEdit").value;

            const diasDisponibles = Array.from(
                document.querySelectorAll(".diasCheckEdit:checked")
            ).map(c => c.value);

            const doctor = {
                nombre,
                especialidad,
                diasDisponibles
            };

            const updated = await updateDoctor(drActual[0].id, doctor);

            if (updated) {
                alert("Datos actualizados!");
                refrescarDoctores();
                $("#modalDrEdit").modal("hide");
                e.target.reset();
            }

        });


    }

    refrescarDoctores()

});


//editar Usuario
document.getElementById("usersTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("editUser")) {
        document.getElementById("doctorFormEdit").reset()
        const id = e.target.dataset.id;

        const usuarioActual = await getUserById(id)
        // Cargar datos en el modal
        document.getElementById("nombreUsuarioEdit").value = usuarioActual[0].nombre;
        document.getElementById("emailUsuarioEdit").value = usuarioActual[0].email;
        document.getElementById("passwordUsuarioEdit").value = usuarioActual[0].password;
        document.getElementById("rolUsuarioEdit").value = usuarioActual[0].rol;



        // Abrir modal
        $("#modalEditUsuario").modal("show");


        //subbmit forom
        document.getElementById("formEditUsuario").addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombreUsuarioEdit").value;
            const email = document.getElementById("emailUsuarioEdit").value;
            const password = document.getElementById("passwordUsuarioEdit").value;
            const rol = document.getElementById("rolUsuarioEdit").value;


            const user = {
                nombre,
                email,
                password,
                rol
            };

            const updated = await updateUser(usuarioActual[0].id, user);

            if (updated) {
                alert("Datos actualizados!");
                refrescarUsuarios();
                $("#modalEditUsuario").modal("hide");
                e.target.reset();
            }

        });


    }



});

//confirmar turno
document.getElementById("appointmentsTableBody").addEventListener("click", async (e) => {

    if (e.target.classList.contains("confirmarTurno")) {
        const id = e.target.dataset.id;
        const turno = await getAppointmentById(id)

        if (confirm("esta segurno de confirmar este turno?")) {
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
                    alert("turno confirmado")
                    refrescarTurnos()
                }
            }
            else {
                alert("turno ya Cancelado o Confirmado previamene")
            }
            //updateDashboard
            refrescarDashboard()
        }


    }



});





//✅
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
                <button class="btn btn-sm btn-primary editarDr" data-id="${doc.id}"  data-toggle="modal" data-target="#modalDrEdit">Editar</button>
                <button class="btn btn-sm btn-danger BorrarDr" data-id="${doc.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

//✅
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
                <button class="btn btn-sm btn-primary editUser" data-id="${user.id}" data-toggle="modal" data-target="#modalEditUsuario">Editar</button>
                <button class="btn btn-sm btn-danger borrarUsuario" data-id="${user.id}">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


//✅
async function refrescarUsuarios() {
    const users = await getAllUsers();
    cargarTablaUsuarios(users);
}
//✅
async function refrescarDoctores() {
    const doctors = await getAllDoctors();
    cargarTablaDoctores(doctors);
}

async function refrescarTurnos() {
    const turnos = await getAllAppointments();
    cargarTablaTurnos(turnos);
}

async function refrescarDashboard() {
    const dashboard = document.getElementById("dashboard")
    dashboard.innerHTML = ""

    const turnos = await getAllAppointments()
    //total estados
    let totalPendiente = 0
    let totalCancelado = 0
    let totalConfirmado = 0
    for (const turno of turnos) {
        // console.log(turno.estado="Cancelado")
        if (turno.estado == "Pendiente") { totalPendiente += 1 }
        if (turno.estado == "Cancelado") { totalCancelado += 1 }
        if (turno.estado == "Confirmado") { totalConfirmado += 1 }

    }

    dashboard.innerHTML = `
    <h5>Total Estados de los turnos</h5>
    <div>
        <p>Total de turnos cancelados: ${totalCancelado}</p>
        <p>Total de turnos pendientes: ${totalPendiente}</p>
        <p>Total de turnos confirmados: ${totalConfirmado}</p>
    </div>
    `


}


//✅
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

        tr.innerHTML = `
            <td>${turno.id}</td>
            <td>${user.nombre}</td>
            <td>${doctor.nombre}</td>
            <td>${turno.fecha}</td>
            <td>${turno.hora}</td>
            <td>${turno.estado}</td>
            <td>
                <button class="btn btn-sm btn-primary confirmarTurno" data-id="${turno.id}">Confirmar</button>
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






