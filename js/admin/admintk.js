document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");

    if (role !== "admin") {
        alert("Acceso denegado");
        localStorage.clear();
        window.location.href = "/modules/auth/login.html";
    }
});
