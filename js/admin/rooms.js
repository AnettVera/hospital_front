/*
  Gestión de Habitaciones (in-memory)
  - Lista, crea y edita habitaciones
  - Gestión de Áreas (solo selección en formulario de habitación; creación en modal aparte)
  - Sin backend; persiste en localStorage para mantener el estado entre recargas
  - Conectado a modules/admin/rooms-content.html
*/
(function () {
  const LS_KEYS = {
    ROOMS: 'adm.rooms',
    AREAS: 'adm.areas',
  };

  // Estado
  let rooms = [];
  let areas = [];
  let editingId = null; // id de la habitación en edición

  // DOM refs (se resuelven en init, ya que el contenido se inyecta dinámicamente)
  let tableBody;
  let modalEl; // #roomModal
  let modalTitle; // #roomModalLabel
  let inputName; // #room-name
  let inputBeds; // #room-beds
  let selectArea; // #room-area-select
  let saveBtn; // #room-save-btn

  // Modal de Áreas
  let areaModalEl; // #areaModal
  let newAreaInput; // #new-area-name
  let newAreaAddBtn; // #new-area-add-btn
  let areaList; // #area-list

  // Utilidades
  const uid = () => Math.random().toString(36).slice(2, 9);

  const loadState = () => {
    try {
      rooms = JSON.parse(localStorage.getItem(LS_KEYS.ROOMS) || '[]');
      areas = JSON.parse(localStorage.getItem(LS_KEYS.AREAS) || '[]');
      if (!Array.isArray(areas) || areas.length === 0) {
        // Semillas por defecto
        areas = ['Cardiología', 'Pediatría', 'General'];
      }
      if (!Array.isArray(rooms)) rooms = [];
    } catch (e) {
      rooms = [];
      areas = ['General'];
    }
  };

  const saveState = () => {
    localStorage.setItem(LS_KEYS.ROOMS, JSON.stringify(rooms));
    localStorage.setItem(LS_KEYS.AREAS, JSON.stringify(areas));
  };

  // Renderizado de tabla
  const renderTable = () => {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (rooms.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Sin habitaciones registradas</td></tr>`;
      return;
    }

    rooms.forEach((room) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="fw-semibold">${room.name}</div>
          <div class="small text-muted">Área: ${room.area}</div>
        </td>
        <td>${room.beds}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-2" data-action="edit" data-id="${room.id}">
            <i class="bi bi-pencil-square"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  };

  // Renderizado de opciones de áreas en el select del modal de habitación
  const renderAreaOptions = (selected) => {
    if (!selectArea) return;
    selectArea.innerHTML = '';
    const frag = document.createDocumentFragment();
    areas.sort((a, b) => a.localeCompare(b)).forEach((a) => {
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      if (selected && selected === a) opt.selected = true;
      frag.appendChild(opt);
    });
    selectArea.appendChild(frag);
  };

  // Renderizado del listado de áreas en el modal de áreas
  const renderAreaList = () => {
    if (!areaList) return;
    areaList.innerHTML = '';
    const sorted = [...areas].sort((a, b) => a.localeCompare(b));
    if (sorted.length === 0) {
      const li = document.createElement('li');
      li.className = 'list-group-item text-muted';
      li.textContent = 'No hay áreas registradas';
      areaList.appendChild(li);
      return;
    }
    sorted.forEach((name) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<span>${name}</span>`;
      areaList.appendChild(li);
    });
  };

  // Limpia el formulario de habitación
  const resetForm = () => {
    editingId = null;
    inputName && (inputName.value = '');
    inputBeds && (inputBeds.value = '');
    renderAreaOptions();
    if (selectArea && areas[0]) selectArea.value = areas[0];
    if (modalTitle) modalTitle.textContent = 'Crear Habitación';
    if (saveBtn) saveBtn.textContent = 'Guardar';
  };

  // Abrir modal en modo edición
  const openEdit = (room) => {
    editingId = room.id;
    if (modalTitle) modalTitle.textContent = 'Editar Habitación';
    if (saveBtn) saveBtn.textContent = 'Actualizar';

    inputName && (inputName.value = room.name);
    inputBeds && (inputBeds.value = room.beds);
    renderAreaOptions(room.area);

    // Abrir modal vía Bootstrap
    if (window.bootstrap && modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    } else if (modalEl) {
      modalEl.classList.add('show');
    }
  };

  // Guardar (crear o actualizar)
  const onSave = () => {
    const name = (inputName?.value || '').trim();
    const beds = parseInt(inputBeds?.value || '0', 10);
    const area = selectArea ? selectArea.value : '';

    if (!name) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(beds) || beds < 0) {
      alert('Número de camas inválido');
      return;
    }
    if (!area) {
      alert('Selecciona un área');
      return;
    }

    if (editingId) {
      rooms = rooms.map((r) => (r.id === editingId ? { ...r, name, beds, area } : r));
    } else {
      rooms.push({ id: uid(), name, beds, area });
    }

    saveState();
    renderTable();

    // Cerrar modal
    if (window.bootstrap && modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
    resetForm();
  };

  // Delegación de eventos en la tabla
  const bindTableEvents = () => {
    if (!tableBody) return;
    tableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const room = rooms.find((r) => r.id === id);
      if (!room) return;

      if (action === 'edit') {
        openEdit(room);
      }
    });
  };

  // Modal de creación de áreas: bindings
  const bindAreaModal = () => {
    if (!areaModalEl) return;

    // Al mostrar el modal, listar áreas y limpiar input
    areaModalEl.addEventListener('show.bs.modal', () => {
      if (newAreaInput) newAreaInput.value = '';
      renderAreaList();
    });

    // Botón Agregar área
    if (newAreaAddBtn) {
      newAreaAddBtn.addEventListener('click', () => {
        const val = (newAreaInput?.value || '').trim();
        if (!val) return;
        if (!areas.includes(val)) {
          areas.push(val);
          areas.sort((a, b) => a.localeCompare(b));
          saveState();
        }
        // Actualizar UI
        renderAreaOptions(val); // seleccionar la recién creada
        renderAreaList();
        if (newAreaInput) newAreaInput.value = '';
      });
    }
  };

  // Hook: al abrir el modal de habitación desde el botón Crear Habitación
  const bindModalOpenForCreate = () => {
    if (!modalEl) return;
    modalEl.addEventListener('show.bs.modal', () => {
      // Solo reiniciar cuando se abre en modo creación
      if (!editingId) resetForm();
    });
  };

  // Init
  const init = () => {
    // Resolver refs cada vez, porque el contenido se inyecta dinámicamente
    tableBody = document.getElementById('rooms-table-body');
    if (!tableBody) return; // No estamos en la pantalla de rooms

    modalEl = document.getElementById('roomModal');
    modalTitle = document.getElementById('roomModalLabel');
    inputName = document.getElementById('room-name');
    inputBeds = document.getElementById('room-beds');
    selectArea = document.getElementById('room-area-select');
    saveBtn = document.getElementById('room-save-btn');

    // Modal Áreas
    areaModalEl = document.getElementById('areaModal');
    newAreaInput = document.getElementById('new-area-name');
    newAreaAddBtn = document.getElementById('new-area-add-btn');
    areaList = document.getElementById('area-list');

    loadState();
    renderTable();
    renderAreaOptions();
    bindTableEvents();
    bindModalOpenForCreate();
    bindAreaModal();
    if (saveBtn) saveBtn.addEventListener('click', onSave);
  };

  // Importante: en SPA, el script puede ejecutarse después del DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
