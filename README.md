# PWA Hospital Front - HTML Layout Partials (Admin Layout)

Se agregó una estructura de layout para la sección de administración que evita repetir la barra lateral (sidebar) y permite cargar solo la sección central (main) según la selección (dashboard, enfermeros, pacientes).

## Archivos importantes
- `partials/head.html` — head compartido (meta, Bootstrap CSS, icons, fuentes, app CSS).
- `partials/footer.html` — footer compartido (Bootstrap JS, app scripts, SW registration).
- `partials/admin-layout.html` — partial que contiene el `sidebar` y el `main` donde se inyectará el contenido.
- `modules/admin/admin.html` — página principal del área de administración que carga el layout y los scripts.
- `modules/admin/dashboard-content.html` — contenido del dashboard (parcial, se inyecta dentro del layout).
- `modules/admin/nourse-content.html` — contenido de enfermeros (parcial).
- `modules/admin/patient-content.html` — contenido de pacientes (parcial).
- `js/includes.js` — loader que inyecta partials en elementos `div[data-include]`.
- `js/admin.js` — script que maneja la navegación en el admin (carga partials en `#admin-main`, maneja `history`, y activa elementos del sidebar).

## Cómo usarlo
1. Abre el admin page para ver la navegación con sidebar:
   - http://localhost:8000/modules/admin/admin.html

2. El sidebar tiene items con `data-view` que apuntan a los partials (dashboard, nourse, patient). Al hacer clic, `js/admin.js` cargará el partial correspondiente y lo inyectará en el main.

3. Si necesitas una nueva sección, crea un partial `modules/admin/mi-seccion-content.html` con solo el contenido de la vista y en el `partials/admin-layout.html` agrega un `li` con `a.sidebar-item` apuntando al nuevo partial. Por ejemplo:

```html
<li>
   <a class="sidebar-item" href="/modules/admin/admin.html?view=mi-seccion" data-view="/modules/admin/mi-seccion-content.html" data-name="mi-seccion">Mi Sección</a>
</li>
```

## Notes
 - Las páginas `modules/admin/dashboard.html`, `modules/admin/nourse.html` y `modules/admin/patient.html` ya no contienen la vista completa; se reemplazaron por páginas de redirección a `modules/admin/admin.html?view=` y se archivaron copias de seguridad en `archive/old-admin-pages/`. Todas las referencias internas se actualizaron para usar `admin.html?view=...`. Si necesita compatibilidad con URLs externas antiguas, configure redirecciones a nivel de servidor.
- Para probar localmente usa un servidor estático como `python -m http.server` o `npx http-server`.

## Mejoras futuras sugeridas
- Server-side rendering (tpls) para un mejor SEO y performance.
- Integración con un router SPA (p. ej. Vue/React) si la aplicación crece.

---

Si quieres, actualizo otras páginas para usar el nuevo layout o te ayudo a convertir al renderizado server-side.
