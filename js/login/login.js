document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Por favor complete todos los campos");
            return;
        }

        try {
            const response = await fakeLoginRequest(email, password);

            if (response.success) {

                // Guardamos TODO
                localStorage.setItem("authData", JSON.stringify(response));
                localStorage.setItem("token", response.token);
                localStorage.setItem("userRole", response.user.role);
                localStorage.setItem("userEmail", email);

                alert("Inicio de sesión exitoso ¡Bienvenido!");

                // 🔹 Redirección según rol
                if (response.user.role === "admin") {
                    window.location.href = "/modules/admin/dashboard.html";
                } else if (response.user.role === "nurse") {
                    window.location.href = "/modules/nourse/nourse-content.html";
                } else {
                    alert("Rol desconocido. Contacte al administrador.");
                }

            } else {
                alert("Credenciales incorrectas");
            }

        } catch (error) {
            alert("Error de conexión con el servidor");
            console.error(error);
        }

    });
});

// 🔹 SIMULACIÓN DEL LOGIN REAL
function fakeLoginRequest(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {

            // Simulación de usuarios
            let user = null;

            if (email === "admin@hospital.com" && password === "1234") {
                user = {
                    name: "Administrador General",
                    email,
                    role: "admin"
                };
            }

            if (email === "enfermero@hospital.com" && password === "1234") {
                user = {
                    name: "Juan Pérez",
                    email,
                    role: "nurse"
                };
            }

            resolve({
                success: user !== null,
                token: user ? "fakeTokenExample123" : null,
                user: user
            });

        }, 1200);
    });
}
