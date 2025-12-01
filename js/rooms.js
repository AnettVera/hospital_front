let roomsData = [
    { id: 1, name: "Habitación 1 - Cardiología", beds: 2 },
    { id: 2, name: "Habitación 2 - Pediatría", beds: 2 },
    { id: 3, name: "Habitación 3 - General", beds: 2 }
];

let roomModal; // instancia de Bootstrap
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadRooms();

    // Inicializar modal Bootstrap
    const modalElement = document.getElementById("roomModal");
    roomModal = new bootstrap.Modal(modalElement);

    document.getElementById("room-save-btn").addEventListener("click", saveRoom);
});


function loadRooms() {
    const tbody = document.getElementById("rooms-table-body");
    tbody.innerHTML = "";

    roomsData.forEach(room => {
        tbody.innerHTML += `
            <tr>
                <td>${room.name}</td>
                <td>${room.beds}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="openRoomModal(${room.id})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                </td>
            </tr>
        `;
    });
}


function openRoomModal(id = null) {
    const title = document.getElementById("roomModalLabel");
    const saveBtn = document.getElementById("room-save-btn");
    const nameInput = document.getElementById("room-name");
    const bedsInput = document.getElementById("room-beds");

    if (id) {
        // Modo edición
        editingId = id;
        const room = roomsData.find(r => r.id === id);

        title.textContent = "Editar Habitación";
        saveBtn.textContent = "Guardar Cambios";

        nameInput.value = room.name;
        bedsInput.value = room.beds;

    } else {
        // Modo creación
        editingId = null;

        title.textContent = "Crear Habitación";
        saveBtn.textContent = "Crear Habitación";

        nameInput.value = "";
        bedsInput.value = "";
    }

    roomModal.show();
}


function saveRoom() {
    const name = document.getElementById("room-name").value.trim();
    const beds = parseInt(document.getElementById("room-beds").value);

    if (!name) return alert("El nombre es obligatorio");
    if (!beds) return alert("Debes indicar el número de camas");

    if (editingId) {
        const room = roomsData.find(r => r.id === editingId);
        room.name = name;
        room.beds = beds;

    } else {
        roomsData.push({
            id: Date.now(),
            name,
            beds
        });
    }

    roomModal.hide();
    loadRooms();
}
