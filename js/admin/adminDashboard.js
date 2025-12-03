document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");

    if (role !== "admin") {
        alert("Acceso denegado");
        localStorage.clear();
        window.location.href = "/modules/auth/login.html";
    }
});


if (!localStorage.getItem("token")) {
    window.location.href = "../../modules/auth/login.html";
}

function logout() {
    localStorage.clear();
    // Redirigir al login
    window.location.href = "../../modules/auth/login.html";
}