((function(){
    'use strict';

    var STORAGE_KEY = 'hospital_nourses_v1';

    // Cargar datos de enfermeros desde localStorage
    function loadNourses(){
        try{
            var raw = localStorage.getItem(STORAGE_KEY);
            // Si no hay datos, devuelve una lista con un enfermero de ejemplo
            if (!raw) {
                return [
                    { id: '1', name: 'Laura', lastname: 'García', email: 'laura.garcia@hospital.com' },
                    { id: '2', name: 'Carlos', lastname: 'Martínez', email: 'carlos.martinez@hospital.com' }
                ];
            }
            return JSON.parse(raw);
        }catch(e){
            console.error('Error parsing nourses from storage', e);
            return [];
        }
    }

    // Guardar lista de enfermeros en localStorage
    function saveNourses(list){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    // Generar un ID único para un nuevo enfermero
    function getNextId(){
        return Date.now().toString();
    }

    // Renderizar la tabla de enfermeros
    function renderNourses(){
        var tbody = document.getElementById('nourse-table-body');
        if (!tbody) return;

        var nourses = loadNourses();
        tbody.innerHTML = '';

        if (nourses.length === 0){
            tbody.innerHTML = '<tr><td colspan="3" class="text-muted">No hay enfermeros registrados.</td></tr>';
            return;
        }

        nourses.forEach(function(nourse){
            var tr = document.createElement('tr');
            var fullname = (nourse.name || '') + ' ' + (nourse.lastname || '');
            
            tr.innerHTML = `
                <td>${escapeHtml(fullname)}</td>
                <td>${escapeHtml(nourse.email || '')}</td>
                <td>
                    <button class="btn-custom btn-edit-custom edit-nourse-btn" data-id="${nourse.id}">Editar</button>
                    <button class="btn-custom btn-delete-custom delete-nourse-btn" data-id="${nourse.id}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Escapar HTML para prevenir XSS
    function escapeHtml(str){
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>\"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
    }

    // Añadir un nuevo enfermero
    function addNourse(data){
        var list = loadNourses();
        data.id = getNextId();
        list.push(data);
        saveNourses(list);
        renderNourses();
    }

    // Actualizar un enfermero existente
    function updateNourse(id, data){
        var list = loadNourses();
        var idx = list.findIndex(function(x){ return x.id === id; });
        if (idx === -1) return false;
        
        data.id = id; // Preservar el ID
        list[idx] = data;
        
        saveNourses(list);
        renderNourses();
        return true;
    }

    // Eliminar un enfermero
    function deleteNourse(id){
        var list = loadNourses();
        var idx = list.findIndex(function(x){ return x.id === id; });
        if (idx === -1) return false;
        
        list.splice(idx, 1);
        
        saveNourses(list);
        renderNourses();
        return true;
    }

    // Obtener un enfermero por su ID
    function getNourseById(id){
        var list = loadNourses();
        return list.find(function(x){ return x.id === id; }) || null;
    }

    // Limpiar el formulario del modal
    function clearForm(){
        document.getElementById('nourse-id').value = '';
        document.getElementById('nourse-name').value = '';
        document.getElementById('nourse-lastname').value = '';
        document.getElementById('nourse-email').value = '';

        var saveBtn = document.getElementById('save-nourse-btn');
        if (saveBtn) saveBtn.textContent = 'Registrar Enfermero';
    }

    // Rellenar el formulario del modal con datos de un enfermero para edición
    function populateForm(nourse){
        if (!nourse) return;
        document.getElementById('nourse-id').value = nourse.id || '';
        document.getElementById('nourse-name').value = nourse.name || '';
        document.getElementById('nourse-lastname').value = nourse.lastname || '';
        document.getElementById('nourse-email').value = nourse.email || '';

        var saveBtn = document.getElementById('save-nourse-btn');
        if (saveBtn) saveBtn.textContent = 'Guardar Cambios';
    }

    // Manejar el clic en el botón de guardar del modal
    function handleSaveClick(){
        var id = document.getElementById('nourse-id').value;
        var name = document.getElementById('nourse-name').value.trim();
        var lastname = document.getElementById('nourse-lastname').value.trim();
        var email = document.getElementById('nourse-email').value.trim();

        if (!name || !lastname || !email){
            alert('Todos los campos son requeridos.');
            return;
        }

        var payload = { name: name, lastname: lastname, email: email };

        if (!id){
            addNourse(payload);
        } else {
            updateNourse(id, payload);
        }

        // Ocultar modal si Bootstrap está disponible
        var modalEl = document.getElementById('modalEnfermero');
        if (modalEl && typeof bootstrap !== 'undefined'){
            var m = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            m.hide();
        }
        clearForm();
    }

    // Función de inicialización
    function init(){
        // Renderizar la lista inicial de enfermeros
        renderNourses();

        // Delegación de eventos para los botones de editar/eliminar
        var tbody = document.getElementById('nourse-table-body');
        if (tbody){
            tbody.addEventListener('click', function(ev){
                // Botón Editar
                var editBtn = ev.target.closest('.edit-nourse-btn');
                if (editBtn){
                    var id = editBtn.getAttribute('data-id');
                    var nourse = getNourseById(id);
                    if (nourse){
                        populateForm(nourse);
                        var modalEl = document.getElementById('modalEnfermero');
                        if (modalEl && typeof bootstrap !== 'undefined'){
                            var m = new bootstrap.Modal(modalEl);
                            m.show();
                        }
                    }
                    return;
                }

                // Botón Eliminar
                var delBtn = ev.target.closest('.delete-nourse-btn');
                if (delBtn){
                    var id2 = delBtn.getAttribute('data-id');
                    if (confirm('¿Está seguro de que desea eliminar este enfermero?')){
                        deleteNourse(id2);
                    }
                    return;
                }
            });
        }

        // Manejador para el botón de guardar del modal
        var saveBtn = document.getElementById('save-nourse-btn');
        if (saveBtn) saveBtn.addEventListener('click', handleSaveClick);

        // Limpiar formulario al abrir el modal para un nuevo registro
        var addBtn = document.querySelector('button[data-bs-target="#modalEnfermero"]');
        if (addBtn){
            addBtn.addEventListener('click', function(){
                clearForm();
            });
        }
    }

    // Ejecutar init cuando el DOM esté listo
    if (document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 30); // Timeout para asegurar que los elementos inyectados existan
    }

})());
