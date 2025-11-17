import { getUserByEmail } from "./api.js";


export async function login(email, password) {
    const users = await getUserByEmail(email);

    if (users.length === 0) return null;

    const user = users[0];

    if (user.password === password) {

        return user; // login OK
    }

    return null; // contraseña incorrecta
}


export function getUsuarioSesion() {
    return JSON.parse(localStorage.getItem("usuario"));
}

export function logout(){
    localStorage.clear()
        window.location.href = "login.html";

}

