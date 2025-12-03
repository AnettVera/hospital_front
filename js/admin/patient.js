((function(){
    'use strict';

    var STORAGE_KEY = 'hospital_patients_v1';

    function loadPatients(){
        try{
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        }catch(e){
            console.error('Error parsing patients from storage', e);
            return [];
        }
    }

    function savePatients(list){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function getNextId(){
        return Date.now().toString();
    }

    function renderPatients(){
        var tbody = document.getElementById('patient-table-body');
        if (!tbody) return;
        var patients = loadPatients();
        tbody.innerHTML = '';
        // Ensure the table header contains the 'Acciones' column so header/body column counts match
        var table = tbody.closest('table');
        var headerCount = 0;
        if (table){
            var thead = table.querySelector('thead');
            if (thead){
                var ths = thead.querySelectorAll('th');
                headerCount = ths.length;
                var hasAcciones = false;
                ths.forEach(function(th){
                    if (th.textContent && th.textContent.trim().toLowerCase() === 'acciones') hasAcciones = true;
                });
                if (!hasAcciones){
                    var trHead = thead.querySelector('tr') || document.createElement('tr');
                    var thAcc = document.createElement('th');
                    thAcc.textContent = 'Acciones';
                    trHead.appendChild(thAcc);
                    if (!thead.querySelector('tr')) thead.appendChild(trHead);
                    headerCount = headerCount + 1;
                }
            }
        }

        if (patients.length === 0){
            var colspan = headerCount || 4;
            tbody.innerHTML = '<tr><td colspan="' + colspan + '" class="text-muted">No hay pacientes registrados.</td></tr>';
            return;
        }

        patients.forEach(function(p){
            var tr = document.createElement('tr');
            var fullname = (p.name || '') + ' ' + (p.lastname || '');
            tr.innerHTML = '\n                <td>' + escapeHtml(fullname) + '</td>\n                <td>' + escapeHtml(p.bed || '') + '</td>\n                <td>' + escapeHtml(p.nurse || '') + '</td>\n                <td>\n                    <button class="btn-custom btn-edit-custom edit-patient-btn" data-id="' + p.id + '">Editar</button>\n                    ' + (p.active ? '<span class="badge bg-success">Activo</span>' : '<button class="btn-custom btn-delete-custom delete-patient-btn" data-id="' + p.id + '">Dar de alta</button>') + '\n                </td>\n            ';
            tbody.appendChild(tr);
        });
    }

    function escapeHtml(str){
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>\"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
    }

    function addPatient(data){
        var list = loadPatients();
        data.id = getNextId();
        data.active = false;
        list.push(data);
        savePatients(list);
        renderPatients();
    }

    function updatePatient(id, data){
        var list = loadPatients();
        var idx = list.findIndex(function(x){ return x.id === id; });
        if (idx === -1) return false;
        data.id = id;
        data.active = list[idx].active; 
        list[idx] = data;
        savePatients(list);
        renderPatients();
        return true;
    }

    function deletePatient(id){
        var list = loadPatients();
        var idx = list.findIndex(function(x){ return x.id === id; });
        if (idx === -1) return false;
        
        list.splice(idx, 1);
        
        savePatients(list);
        renderPatients();
        return true;
    }

    function getPatientById(id){
        var list = loadPatients();
        return list.find(function(x){ return x.id === id; }) || null;
    }

    function clearForm(){
        var fields = ['patient-id','patient-name','patient-lastname','patient-notes','patient-bed','patient-nurse'];
        fields.forEach(function(id){
            var el = document.getElementById(id);
            if (!el) return;
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        });
        var saveBtn = document.getElementById('save-patient-btn');
        if (saveBtn) saveBtn.textContent = 'Registrar Paciente';
    }

    function populateForm(patient){
        if (!patient) return;
        document.getElementById('patient-id').value = patient.id || '';
        document.getElementById('patient-name').value = patient.name || '';
        document.getElementById('patient-lastname').value = patient.lastname || '';
        document.getElementById('patient-notes').value = patient.notes || '';
        var bed = document.getElementById('patient-bed'); if (bed) bed.value = patient.bed || bed.value;
        var nurse = document.getElementById('patient-nurse'); if (nurse) nurse.value = patient.nurse || nurse.value;
        var saveBtn = document.getElementById('save-patient-btn');
        if (saveBtn) saveBtn.textContent = 'Guardar cambios';
    }

    function handleSaveClick(){
        var id = document.getElementById('patient-id').value;
        var name = document.getElementById('patient-name').value.trim();
        var lastname = document.getElementById('patient-lastname').value.trim();
        var notes = document.getElementById('patient-notes').value.trim();
        var bed = document.getElementById('patient-bed').value;
        var nurse = document.getElementById('patient-nurse').value;

        if (!name){ alert('El nombre es requerido'); return; }

        var payload = { name: name, lastname: lastname, notes: notes, bed: bed, nurse: nurse };

        if (!id){
            addPatient(payload);
        } else {
            updatePatient(id, payload);
        }

        var modalEl = document.getElementById('modalPaciente');
        if (modalEl && typeof bootstrap !== 'undefined'){
            var m = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            m.hide();
        }
        clearForm();
    }

    function init(){
        renderPatients();
        var tbody = document.getElementById('patient-table-body');
        if (tbody){
            tbody.addEventListener('click', function(ev){
                var editBtn = ev.target.closest('.edit-patient-btn');
                if (editBtn){
                    var id = editBtn.getAttribute('data-id');
                    var patient = getPatientById(id);
                    if (patient){
                        populateForm(patient);
                        var modalEl = document.getElementById('modalPaciente');
                        if (modalEl && typeof bootstrap !== 'undefined'){
                            var m = new bootstrap.Modal(modalEl);
                            m.show();
                        }
                    }
                    return;
                }

                var delBtn = ev.target.closest('.delete-patient-btn');
                if (delBtn){
                    var id2 = delBtn.getAttribute('data-id');
                    if (confirm('¿Está seguro de que desea eliminar este paciente?')){
                        deletePatient(id2);
                    }
                    return;
                }
            });
        }

        var saveBtn = document.getElementById('save-patient-btn');
        if (saveBtn) saveBtn.addEventListener('click', handleSaveClick);

        var addBtn = document.querySelector('button[data-bs-target="#modalPaciente"]');
        if (addBtn){
            addBtn.addEventListener('click', function(){
                clearForm();
            });
        }
    }

    if (document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 30);
    }

})());
