(function(){
  'use strict';

  // Datos de ejemplo en memoria
  var bedsData = [
    // { id, roomId, roomName, bedNumber, occupied, qrData }
  ];

  var bedModal, qrModal;
  var editingId = null;

  function ensureBootstrapModals() {
    var qrEl = document.getElementById('qrModal');
    if (qrEl) qrModal = bootstrap.Modal.getInstance(qrEl) || new bootstrap.Modal(qrEl);
  }

  function getRoomsList() {
    // roomsData podría estar definido por js/rooms.js
    if (Array.isArray(window.roomsData) && window.roomsData.length) {
      return window.roomsData;
    }
    // fallback básico si no existe roomsData
    return [
      { id: 1001, name: 'Habitación A', beds: 2 },
      { id: 1002, name: 'Habitación B', beds: 3 }
    ];
  }

  function renderRoomsSelect(selectedId) {
    var select = document.getElementById('bed-room');
    if (!select) return;
    var rooms = getRoomsList();
    select.innerHTML = '<option value="">Seleccione una habitación</option>' +
      rooms.map(function(r){
        var sel = (selectedId && selectedId === r.id) ? ' selected' : '';
        return '<option value="' + r.id + '"' + sel + '>' + r.name + '</option>';
      }).join('');
  }

  function loadBeds() {
    var tbody = document.getElementById('beds-table-body');
    if (!tbody) return;
    if (!bedsData.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin camas registradas</td></tr>';
      return;
    }
    tbody.innerHTML = bedsData.map(function(bed){
      var stateBadge = bed.occupied
        ? '<span class="state-badge state-occupied">Ocupada</span>'
        : '<span class="state-badge state-available">Disponible</span>';
      return (
        '<tr>'+
          '<td class="beds-id">' +
            '<i class="bi bi-bed me-2"></i>' +
            bed.bedNumber +
          '</td>'+
          '<td class="beds-room">' + bed.roomName + '</td>'+
          '<td class="beds-state">' + stateBadge + '</td>'+
          '<td class="text-end">' +
            '<button class="btn btn-qr" data-action="qr" data-id="' + bed.id + '"><i class="bi bi-qr-code me-2"></i>Ver QR</button>'+
          '</td>'+
        '</tr>'
      );
    }).join('');
  }

  function attachTableActions() {
    var tbody = document.getElementById('beds-table-body');
    if (!tbody) return;
    tbody.addEventListener('click', function(ev){
      var btn = ev.target.closest('button[data-action]');
      if (!btn) return;
      var id = parseInt(btn.getAttribute('data-id'), 10);
      var action = btn.getAttribute('data-action');
      if (action === 'edit') openBedModal(id);
      else if (action === 'del') deleteBed(id);
      else if (action === 'qr') showQR(id);
    });
  }

  function openBedModal(id) {
    var title = document.getElementById('bedModalLabel');
    var saveBtn = document.getElementById('bed-save-btn');
    var roomSelect = document.getElementById('bed-room');
    var numberInput = document.getElementById('bed-number');
    var occupiedInput = document.getElementById('bed-occupied');

    renderRoomsSelect();

    if (id) {
      editingId = id;
      var bed = bedsData.find(function(b){ return b.id === id; });
      if (!bed) return;
      title.textContent = 'Editar Cama';
      saveBtn.textContent = 'Guardar Cambios';
      roomSelect.value = bed.roomId;
      numberInput.value = bed.bedNumber;
      occupiedInput.checked = !!bed.occupied;
    } else {
      editingId = null;
      title.textContent = 'Crear Cama';
      saveBtn.textContent = 'Guardar';
      roomSelect.value = '';
      numberInput.value = '';
      occupiedInput.checked = false;
    }

    var modalEl = document.getElementById('bedModal');
    var instance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    instance.show();
  }

  function saveBed() {
    var roomId = parseInt(document.getElementById('bed-room').value, 10);
    var number = parseInt(document.getElementById('bed-number').value, 10);
    var occupied = document.getElementById('bed-occupied').checked;

    if (!roomId) return alert('Seleccione una habitación');
    if (!number || number < 1) return alert('Indique un número de cama válido');

    var room = getRoomsList().find(function(r){ return r.id === roomId; });
    if (!room) return alert('Habitación inválida');

    if (editingId) {
      var bed = bedsData.find(function(b){ return b.id === editingId; });
      if (!bed) return;
      bed.roomId = room.id;
      bed.roomName = room.name;
      bed.bedNumber = number;
      bed.occupied = occupied;
      bed.qrData = buildQRData(bed);
    } else {
      var newBed = {
        id: Date.now(),
        roomId: room.id,
        roomName: room.name,
        bedNumber: number,
        occupied: occupied,
        qrData: ''
      };
      newBed.qrData = buildQRData(newBed);
      bedsData.push(newBed);
    }

    var modalEl = document.getElementById('bedModal');
    var instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
    loadBeds();
  }

  function deleteBed(id) {
    if (!confirm('¿Eliminar esta cama?')) return;
    bedsData = bedsData.filter(function(b){ return b.id !== id; });

    loadBeds();
  }

  function buildQRData(bed) {
    // Payload simple en JSON
    var payload = {
      id: bed.id,
      roomId: bed.roomId,
      roomName: bed.roomName,
      bedNumber: bed.bedNumber,
      occupied: bed.occupied
    };
    return JSON.stringify(payload);
  }

  function qrUrlFromData(data) {
    // Google Chart API para QR (simple, sin dependencias).
    // Nota: en producción considerar librería local para mayor control/offline.
    var enc = encodeURIComponent(data);
    return 'https://chart.googleapis.com/chart?cht=qr&chs=280x280&chl=' + enc + '&choe=UTF-8';
  }

  function showQR(id) {
    var bed = bedsData.find(function(b){ return b.id === id; });
    if (!bed) return;
    var img = document.getElementById('qr-image');
    var cap = document.getElementById('qr-caption');
    img.src = qrUrlFromData(bed.qrData || buildQRData(bed));
    cap.textContent = bed.roomName + ' - Cama ' + bed.bedNumber + (bed.occupied ? ' (Ocupada)' : ' (Libre)');
    if (!qrModal) ensureBootstrapModals();
    qrModal && qrModal.show();
  }

  function init() {
    // Listeners
    var saveBtn = document.getElementById('bed-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveBed);

    var createBtn = document.querySelector('[data-bs-target="#bedModal"]');
    if (createBtn) createBtn.addEventListener('click', function(){
      // Preparar formulario para creación; el modal se abrirá por data-bs-toggle
      var title = document.getElementById('bedModalLabel');
      var saveBtn = document.getElementById('bed-save-btn');
      renderRoomsSelect();
      editingId = null;
      if (title) title.textContent = 'Crear Cama';
      if (saveBtn) saveBtn.textContent = 'Guardar';
      var roomSelect = document.getElementById('bed-room');
      var numberInput = document.getElementById('bed-number');
      var occupiedInput = document.getElementById('bed-occupied');
      if (roomSelect) roomSelect.value = '';
      if (numberInput) numberInput.value = '';
      if (occupiedInput) occupiedInput.checked = false;
    });

    attachTableActions();
    loadBeds();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
