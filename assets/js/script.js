document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // INICIALIZACIÓN
    // ===============================
    if (!localStorage.getItem("saldo")) {
        localStorage.setItem("saldo", "600000");

        const movimientosIniciales = [
            {
                fecha: obtenerFecha(),
                descripcion: "Depósito Inicial",
                monto: 600000
            }
        ];

        localStorage.setItem("movimientos", JSON.stringify(movimientosIniciales));
    }

    // ===============================
    // UTILIDADES
    // ===============================
    function obtenerFecha() {
        const hoy = new Date();
        return hoy.toLocaleDateString("es-CL");
    }

    function obtenerSaldo() {
        return parseInt(localStorage.getItem("saldo"));
    }

    function guardarSaldo(nuevoSaldo) {
        localStorage.setItem("saldo", nuevoSaldo);
    }

    function obtenerMovimientos() {
        return JSON.parse(localStorage.getItem("movimientos")) || [];
    }

    function guardarMovimiento(descripcion, monto) {
        const movimientos = obtenerMovimientos();

        movimientos.unshift({
            fecha: obtenerFecha(),
            descripcion,
            monto
        });

        localStorage.setItem("movimientos", JSON.stringify(movimientos));
    }

    // ===============================
    // OVERLAY PARA MENSAJES
    // ===============================
    function mostrarOverlay(mensaje, url = null, tiempo = 1500) {
        const overlay = document.createElement("div");
        overlay.classList.add("redirect-overlay");

        const box = document.createElement("div");
        box.classList.add("redirect-box");
        box.textContent = mensaje;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
            if (url) window.location.href = url;
        }, tiempo);
    }

    // ===============================
    // LOGIN
    // ===============================
    const loginForm = document.getElementById("iniciarSesion");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const mensaje = document.getElementById("mensaje");

            // Credenciales fijas
            if (email === "juan.canepa@alkewallet.cl" && password === "abcd1234") {
                // Guardar sesión
                localStorage.setItem("loggedIn", "true");
                mostrarOverlay("Bienvenido al portal Alke Wallet, serás redirigido al menú principal", "menu.html");
            } else {
                mensaje.textContent = "Correo o contraseña incorrectos";
                mensaje.style.color = "red";
            }
        });
    }

    // ===============================
    // VERIFICAR SESIÓN
    // ===============================
    const loginPage = document.getElementById("iniciarSesion");
    if (!loginPage) { // Si no estamos en login
        const loggedIn = localStorage.getItem("loggedIn");
        if (!loggedIn || loggedIn !== "true") {
            // Redirigir al login
            window.location.href = "login.html";
        }
    }

    // ===============================
    // CERRAR SESIÓN
    // ===============================
    const btnCerrarSesion = document.getElementById("cerrarSesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem("loggedIn");
            mostrarOverlay("Cerrando sesión...", "login.html", 1000);
        });
    }

    // ===============================
    // MOSTRAR SALDO (MENÚ)
    // ===============================
    const saldoElemento = document.getElementById("saldo");
    if (saldoElemento) {
        const saldo = obtenerSaldo();
        saldoElemento.textContent = `$${saldo.toLocaleString("es-CL")}`;
    }

    // ===============================
    // DEPOSITAR DINERO
    // ===============================
    const btnDepositar = document.getElementById("btnDepositar");
    if (btnDepositar) {
        btnDepositar.addEventListener("click", () => {
            const montoInput = document.getElementById("montoDeposito");
            const monto = parseInt(montoInput.value);

            if (isNaN(monto) || monto <= 0) {
                alert("Ingrese un monto válido");
                return;
            }

            const nuevoSaldo = obtenerSaldo() + monto;
            guardarSaldo(nuevoSaldo);
            guardarMovimiento("Depósito en cuenta", monto);

            mostrarOverlay("Depósito realizado con éxito. Redirigiendo a Menú Principal...", "menu.html");
        });
    }

    // ===============================
    // ENVIAR DINERO
    // ===============================
    const botonesContacto = document.querySelectorAll(".contacto");
    botonesContacto.forEach(btn => {
        btn.addEventListener("click", () => {
            const montoInput = document.getElementById("montoEnvio");
            const monto = parseInt(montoInput.value);
            const nombre = btn.dataset.nombre;

            if (isNaN(monto) || monto <= 0) {
                alert("Ingrese un monto válido");
                return;
            }

            if (monto > obtenerSaldo()) {
                alert("Saldo insuficiente");
                return;
            }

            const nuevoSaldo = obtenerSaldo() - monto;
            guardarSaldo(nuevoSaldo);
            guardarMovimiento(`Transferencia a ${nombre}`, -monto);

            mostrarOverlay(`Transferencia realizada. Redirigiendo a Menú Principal...`, "menu.html");
        });
    });

    // ===============================
    // MOSTRAR MOVIMIENTOS
    // ===============================
    const tabla = document.getElementById("tablaMovimientos");
    if (tabla) {
        const movimientos = obtenerMovimientos();
        tabla.innerHTML = "";

        movimientos.forEach(mov => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${mov.fecha}</td>
                <td><strong>${mov.descripcion}</strong></td>
                <td class="right ${mov.monto > 0 ? "positive" : "negative"}">
                    ${mov.monto > 0 ? "+" : ""}$${Math.abs(mov.monto).toLocaleString("es-CL")}
                </td>
            `;
            tabla.appendChild(fila);
        });
    }

    // ===============================
    // REDIRECCIÓN PARA BOTONES Y ENLACES
    // ===============================
    const enlacesRedirect = document.querySelectorAll("[data-redirect]");
    enlacesRedirect.forEach(enlace => {
        enlace.addEventListener("click", (e) => {
            e.preventDefault();
            const url = enlace.getAttribute("href");

            // Tomar texto del enlace/botón para el mensaje
            let texto = enlace.textContent.trim();

            // Si es el botón gris "Volver al Menú Principal", simplificar mensaje
            if (texto.toLowerCase().includes("volver") && texto.toLowerCase().includes("menú")) {
                texto = "Menú Principal";
            }

            mostrarOverlay(`Redirigiendo a ${texto}...`, url, 1500);
        });
    });

// ------------------------------
// Menú hamburguesa
// ------------------------------
    console.log("MENÚ HAMBURGUESA CARGADO");
document.querySelectorAll(".menu-toggle").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation(); // evita que se cierre inmediatamente
        const header = btn.closest(".top-bar");
        const menu = header.querySelector(".hamburger-menu");
        if (menu) {
            menu.style.display = menu.style.display === "flex" ? "none" : "flex";
        }
    });
});

// Cerrar menú si se hace click fuera
document.addEventListener("click", () => {
    document.querySelectorAll(".hamburger-menu").forEach(menu => {
        menu.style.display = "none";
    });
});




}); // cierre DOMContentLoaded
