import { login } from "./auth.js";





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



    }
});
