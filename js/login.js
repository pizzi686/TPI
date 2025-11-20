import { login } from "./auth.js";
import { createUser } from "./api.js";





//login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // evita refrescar la página
    document.getElementById("errorLogin").innerText=""


    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const user = await login(email, password);

    if (user) {
          // Guardar sesión
        localStorage.setItem("usuario", JSON.stringify({
            id: user.id,
            nombre: user.nombre,
            rol: user.rol   
        }));

        // Redirigir según rol
        if (user.rol === "ADMIN") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }
    } else {
        // LOGIN FALLIDO
        // alert("Email o contraseña incorrectos");

        document.getElementById("errorLogin").innerText="Email o contraseña incorrectos"
        document.getElementById("registrar").innerText=""




    }
});


//signin
document.getElementById("formNuevoUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreUsuario").value;
    const email = document.getElementById("emailUsuario").value;
    const password = document.getElementById("passwordUsuario").value;
    const rol = "USER"
    const nuevoUsuario = { nombre, email, password, rol };

    const saved = await createUser(nuevoUsuario);

    if (saved) {
        document.getElementById("registrar").innerText="Usuario Creado"
        $("#modalNuevoUsuario").modal("hide");

        
    }
});
