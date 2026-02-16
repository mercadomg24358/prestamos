/**
 * Flexicred - Lógica Central de la Aplicación
 * Manejo de montos (1M-8M), cálculos del 5% y persistencia de datos
 */

// ===== GESTIÓN DE CLIENTES =====
class ClientesManager {
    constructor() {
        this.storageKey = 'flexicred_clientes';
    }

    obtenerClientes() {
        const clientes = localStorage.getItem(this.storageKey);
        return clientes ? JSON.parse(clientes) : [];
    }

    guardarClientes(clientes) {
        localStorage.setItem(this.storageKey, JSON.stringify(clientes));
    }

    agregarCliente(cliente) {
        cliente.id = Date.now().toString();
        cliente.fechaRegistro = new Date().toLocaleString('es-AR');
        const clientes = this.obtenerClientes();
        clientes.push(cliente);
        this.guardarClientes(clientes);
        return cliente;
    }

    actualizarCliente(id, clienteActualizado) {
        const clientes = this.obtenerClientes();
        const index = clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            clientes[index] = { ...clientes[index], ...clienteActualizado };
            this.guardarClientes(clientes);
            return true;
        }
        return false;
    }

    eliminarCliente(id) {
        const clientes = this.obtenerClientes();
        const clientesFiltrados = clientes.filter(c => c.id !== id);
        this.guardarClientes(clientesFiltrados);
    }

    obtenerClientePorId(id) {
        const clientes = this.obtenerClientes();
        return clientes.find(c => c.id === id);
    }

    obtenerClientePorDNI(dni) {
        const clientes = this.obtenerClientes();
        return clientes.find(c => c.dni === dni);
    }
}

const clientesManager = new ClientesManager();

// ===== FUNCIONES DEL PANEL DE ADMINISTRACIÓN =====

function abrirPasswordModal() {
    document.getElementById('password-modal').style.display = 'block';
    document.getElementById('password-overlay').style.display = 'block';
    document.getElementById('admin-password-input').value = '';
    document.getElementById('password-error').style.display = 'none';
    document.getElementById('admin-password-input').focus();
}

function cerrarPasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('password-overlay').style.display = 'none';
    document.getElementById('admin-password-input').value = '';
    document.getElementById('password-error').style.display = 'none';
}

function validarPassword() {
    const password = document.getElementById('admin-password-input').value;
    const errorMsg = document.getElementById('password-error');
    
    if (password === 'alan1930') {
        cerrarPasswordModal();
        abrirAdminPanel();
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('admin-password-input').value = '';
        document.getElementById('admin-password-input').focus();
    }
}

function abrirAdminPanel() {
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-panel-overlay').style.display = 'block';
    cargarListaClientes();
}

function cerrarAdminPanel() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-panel-overlay').style.display = 'none';
}

function cargarListaClientes() {
    const clientes = clientesManager.obtenerClientes();
    const listContainer = document.getElementById('clientes-lista');

    if (clientes.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">No hay clientes registrados aún.</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 15px;">';

    clientes.forEach(cliente => {
        const colorEstado = {
            'pendiente': '#f59e0b',
            'aprobado': '#10b981',
            'rechazado': '#ef4444',
            'completado': '#3b82f6'
        };

        html += `
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #f8fafc;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #1e293b; font-size: 1rem;">${cliente.nombre}</h4>
                        <p style="margin: 5px 0; color: #64748b; font-size: 0.85rem;"><strong>DNI:</strong> ${cliente.dni}</p>
                        <p style="margin: 5px 0; color: #64748b; font-size: 0.85rem;"><strong>Teléfono:</strong> ${cliente.telefono}</p>
                        <p style="margin: 5px 0; color: #64748b; font-size: 0.85rem;"><strong>Monto:</strong> $${cliente.monto.toLocaleString('es-AR')}</p>
                    </div>
                    <span style="background: ${colorEstado[cliente.estado]}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${cliente.estado}</span>
                </div>
                <p style="margin: 10px 0 15px 0; color: #94a3b8; font-size: 0.8rem;"><strong>Registrado:</strong> ${cliente.fechaRegistro}</p>
                <div style="display: flex; gap: 10px;">
                    <select id="estado-${cliente.id}" style="flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; cursor: pointer; font-weight: 600; font-size: 0.85rem;" onchange="cambiarEstadoCliente('${cliente.id}', this.value)">
                        <option value="pendiente" ${cliente.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="aprobado" ${cliente.estado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
                        <option value="rechazado" ${cliente.estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                        <option value="completado" ${cliente.estado === 'completado' ? 'selected' : ''}>Completado</option>
                    </select>
                    <button onclick="eliminarCliente('${cliente.id}')" style="flex: 0.6; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">🗑️</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    listContainer.innerHTML = html;
}

function eliminarCliente(id) {
    if (confirm('¿Estás seguro que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
        clientesManager.eliminarCliente(id);
        cargarListaClientes();
        alert('Cliente eliminado exitosamente');
    }
}

function cambiarEstadoCliente(id, nuevoEstado) {
    clientesManager.actualizarCliente(id, { estado: nuevoEstado });
    cargarListaClientes();
}

// ===== INICIALIZACIÓN: Atajo de teclado Ctrl+Shift+A para abrir panel =====
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        abrirPasswordModal();
    }
});

// Enter en el campo de contraseña
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('admin-password-input');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                validarPassword();
            }
        });
    }
});

// Cerrar panel al hacer clic en el overlay
document.addEventListener('DOMContentLoaded', () => {
    const passwordOverlay = document.getElementById('password-overlay');
    if (passwordOverlay) {
        passwordOverlay.addEventListener('click', cerrarPasswordModal);
    }
    
    const overlay = document.getElementById('admin-panel-overlay');
    if (overlay) {
        overlay.addEventListener('click', cerrarAdminPanel);
    }

    // === 1. LÓGICA DEL SIMULADOR (Paso 5) ===
    const range = document.getElementById('monto-range');
    const displayMonto = document.getElementById('display-monto');
    const displayTarifa = document.getElementById('display-tarifa');

    if (range && displayMonto && displayTarifa) {
        const actualizarValores = (valor) => {
            const monto = parseInt(valor);
            const tarifa = monto * 0.05; // CÁLCULO DEL 5% DE GESTIÓN

            // Actualizar interfaz con formato moneda argentina
            displayMonto.innerText = monto.toLocaleString('es-AR');
            displayTarifa.innerText = tarifa.toLocaleString('es-AR');

            // Guardar para usar en Acuerdo, Billetera y Chat
            localStorage.setItem('montoSeleccionado', monto);
            localStorage.setItem('tarifaCalculada', tarifa);
        };

        // Escuchar movimiento del slider
        range.addEventListener('input', (e) => {
            actualizarValores(e.target.value);
        });

        // Inicializar con el valor actual del slider (por defecto 1M)
        actualizarValores(range.value);
    }

    // === 2. LÓGICA DE PERSISTENCIA (Para todas las páginas) ===
    
    // Recuperar datos guardados
    const nombreGuardado = localStorage.getItem('nombreUsuario') || "Usuario Flexicred";
    const montoGuardado = parseInt(localStorage.getItem('montoSeleccionado')) || 0;
    const tarifaGuardada = parseInt(localStorage.getItem('tarifaCalculada')) || 0;
    const cuilGuardado = localStorage.getItem('cuilUsuario') || "No registrado";

    // Rellenar Nombres (Clase .span-nombre)
    document.querySelectorAll('.span-nombre').forEach(el => {
        el.innerText = nombreGuardado;
    });

    // Rellenar Montos del Préstamo (Clase .span-monto)
    document.querySelectorAll('.span-monto').forEach(el => {
        el.innerText = "$" + montoGuardado.toLocaleString('es-AR');
    });

    // Rellenar Tarifas del 5% (Clase .span-tarifa)
    document.querySelectorAll('.span-tarifa').forEach(el => {
        el.innerText = "$" + tarifaGuardada.toLocaleString('es-AR');
    });

    // Rellenar CUIL si es necesario
    document.querySelectorAll('.span-cuil').forEach(el => {
        el.innerText = cuilGuardado;
    });
});

/**
 * === 3. FUNCIONES DE NAVEGACIÓN Y GUARDADO ===
 */

function guardarDatosPaso(paso) {
    if (paso === 1) {
        const inputNombre = document.getElementById('nombre-completo');
        if (inputNombre && inputNombre.value.trim() !== "") {
            localStorage.setItem('nombreUsuario', inputNombre.value.trim());
            window.location.href = 'paso2.html';
        } else {
            alert("Por favor, ingresa tu nombre completo para continuar.");
        }
    }

    if (paso === 4) {
        const cuil = document.getElementById('cuil')?.value;
        const cbu = document.getElementById('cbu')?.value;
        const banco = document.getElementById('banco')?.value;
        const password = document.getElementById('password')?.value;
        const passwordConfirm = document.getElementById('password-confirm')?.value;
        
        const errPassword = document.getElementById('error-password');
        const errPasswordConfirm = document.getElementById('error-password-confirm');

        // Resetear errores
        if (errPassword) errPassword.style.display = 'none';
        if (errPasswordConfirm) errPasswordConfirm.style.display = 'none';

        // Validar CUIL y CBU
        if (!cuil || !cbu) {
            alert("Completa tu CUIL y CBU/CVU para el desembolso.");
            return;
        }

        // Validar contraseña
        if (!password || password.length < 6) {
            if (errPassword) {
                errPassword.innerText = "La contraseña debe tener al menos 6 caracteres";
                errPassword.style.display = 'block';
            }
            return;
        }

        // Validar que las contraseñas coincidan
        if (password !== passwordConfirm) {
            if (errPasswordConfirm) {
                errPasswordConfirm.innerText = "Las contraseñas no coinciden";
                errPasswordConfirm.style.display = 'block';
            }
            return;
        }

        // Guardar datos en localStorage
        localStorage.setItem('cuilUsuario', cuil);
        localStorage.setItem('cbuUsuario', cbu);
        localStorage.setItem('bancoUsuario', banco || "CBU Informado");
        localStorage.setItem('passwordUsuario', password);
        
        // ===== GUARDAR CLIENTE AUTOMÁTICAMENTE EN LA BD =====
        const nombre = localStorage.getItem('nombreUsuario') || 'Sin nombre';
        const dni = localStorage.getItem('dniUsuario') || 'Sin DNI';
        const monto = parseInt(localStorage.getItem('montoSeleccionado')) || 0;
        const telefono = localStorage.getItem('telUsuario') || 'Sin teléfono';
        
        const nuevoCliente = {
            nombre: nombre,
            dni: dni,
            monto: monto,
            telefono: telefono,
            estado: 'pendiente',
            password: password  // Guardar contraseña con el cliente
        };
        
        clientesManager.agregarCliente(nuevoCliente);
        
        window.location.href = 'paso5.html';
    }
}

/**
 * Función para simular el proceso de envío del 5% en el chat
 */
function simularValidacionPago() {
    const btn = document.getElementById('btn-enviar-comprobante');
    if (btn) {
        btn.innerText = "Validando comprobante...";
        btn.disabled = true;
        setTimeout(() => {
            btn.innerText = "Error: Sistema saturado";
            alert("El sistema de validación automática está saturado. Por favor, contacte a un asesor por WhatsApp para finalizar el desembolso.");
            btn.disabled = false;
        }, 3000);
    }
}

/**
 * Reiniciar la app
 */
function salir() {
    if(confirm("¿Estás seguro que deseas salir? Perderás el progreso de tu solicitud.")) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

/**
 * === 4. FUNCIONES PARA CAMBIAR MONTO EN PERFIL ===
 */

function abrirModalCambiarMonto() {
    const modal = document.getElementById('modal-cambiar-monto');
    if(modal) {
        modal.classList.add('active');
    }
}

function cerrarModalCambiarMonto() {
    const modal = document.getElementById('modal-cambiar-monto');
    if(modal) {
        modal.classList.remove('active');
    }
    // Restaurar el valor anterior
    const montoGuardado = parseInt(localStorage.getItem('montoSeleccionado')) || 1000000;
    const sliderModal = document.getElementById('modal-monto-slider');
    if(sliderModal) {
        sliderModal.value = montoGuardado;
    }
}

function confirmarCambioMonto() {
    const sliderModal = document.getElementById('modal-monto-slider');
    if(!sliderModal) return;

    const nuevoMonto = parseInt(sliderModal.value);
    const nuevaTarifa = Math.round(nuevoMonto * 0.05);
    
    // Guardar nuevo monto y tarifa en localStorage
    localStorage.setItem('montoSeleccionado', nuevoMonto);
    localStorage.setItem('tarifaCalculada', nuevaTarifa);
    
    // Actualizar el cliente en la BD
    const dni = localStorage.getItem('dniUsuario');
    if(dni) {
        const cliente = clientesManager.obtenerClientePorDNI(dni);
        if(cliente) {
            clientesManager.actualizarCliente(cliente.id, { monto: nuevoMonto });
        }
    }
    
    // Actualizar todos los elementos que muestren el monto
    document.querySelectorAll('.span-monto').forEach(el => {
        el.innerText = nuevoMonto.toLocaleString('es-AR');
    });
    
    // Actualizar todos los elementos que muestren la tarifa
    document.querySelectorAll('.span-tarifa').forEach(el => {
        el.innerText = nuevaTarifa.toLocaleString('es-AR');
    });
    
    // Cerrar modal
    cerrarModalCambiarMonto();
    
    // Mensaje de confirmación
    alert(`Monto actualizado a: $${nuevoMonto.toLocaleString('es-AR')}`);
}