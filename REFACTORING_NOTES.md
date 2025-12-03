# Refactorización de Arquitectura: Mini-SPA a MPA Estática

## Resumen de Cambios

Se ha refactorizado la aplicación de una arquitectura **Mini-SPA (Single Page Application)** con carga dinámica de contenido HTML a una arquitectura **MPA (Multi-Page Application)** completamente estática. Esto resuelve el problema de que el manifest PWA no se detectaba en todas las páginas.

## Problemas Resueltos

### 1. **Manifest PWA no se detectaba en todas las páginas**
   - **Causa**: El manifest estaba en `head.html` que se cargaba dinámicamente con `data-include`
   - **Solución**: Cada página HTML ahora incluye directamente el manifest en su `<head>`

### 2. **Rutas absolutas fallaban en GitHub Pages**
   - **Causa**: Rutas como `/css/styles.css` no funcionan en subdirectorios
   - **Solución**: Todas las rutas ahora son relativas (`../../css/styles.css`)

### 3. **Navegación inconsistente**
   - **Causa**: La lógica de enrutamiento dinámico en `admin.js` causaba problemas
   - **Solución**: Navegación directa entre archivos HTML estáticos

## Cambios Realizados

### Archivos Creados (Nuevas Páginas MPA)

1. **`/modules/admin/dashboard.html`** - Reemplaza `admin.html?view=dashboard`
2. **`/modules/admin/patient.html`** - Reemplaza `admin.html?view=patient`
3. **`/modules/admin/nourse.html`** - Reemplaza `admin.html?view=nourse`
4. **`/modules/admin/assignments.html`** - Reemplaza `admin.html?view=assignments`
5. **`/modules/admin/rooms.html`** - Reemplaza `admin.html?view=rooms`
6. **`/modules/admin/beds.html`** - Reemplaza `admin.html?view=beds`

Cada página es un archivo HTML **completo e independiente** que incluye:
- Manifest PWA en el `<head>`
- Todos los estilos CSS necesarios
- Sidebar de navegación
- Contenido específico de la sección
- Scripts necesarios

### Archivos Modificados

#### 1. **`/partials/head.html`**
   - Cambio de rutas absolutas a relativas
   - Manifest ahora apunta a `../../manifest.json`
   - Estilos CSS apuntan a `../../css/`

#### 2. **`/partials/footer.html`**
   - Scripts ahora apuntan a rutas relativas `../../js/`

#### 3. **`/partials/admin-layout.html`**
   - Eliminados atributos `data-view` y `data-name`
   - Enlaces ahora apuntan directamente a archivos HTML (`href="dashboard.html"`)
   - Rutas relativas para imágenes y scripts

#### 4. **`/index.html`**
   - Manifest incluido directamente en el `<head>`
   - Rutas relativas para todos los recursos
   - Eliminado `data-include` para head y footer

#### 5. **`/modules/auth/login.html`**
   - Manifest incluido directamente
   - Rutas relativas para todos los recursos
   - Eliminado `data-include`

#### 6. **`/modules/patient/patient.html`**
   - Manifest incluido directamente
   - Rutas relativas para todos los recursos
   - Eliminado `data-include`

#### 7. **`/manifest.json`**
   - `start_url` cambió de `/` a `./`
   - `scope` cambió de `/` a `./`
   - Rutas de iconos ahora relativas: `./img/192.png`

#### 8. **`/js/app.js`**
   - Ruta del Service Worker cambió de `/sw.js` a `./sw.js`

#### 9. **`/sw.js`**
   - Todas las rutas en `APP_SHELL` ahora son relativas
   - Rutas de fallback actualizadas

#### 10. **`/js/includes.js`**
   - Archivo vaciado (ya no necesario)

#### 11. **`/js/admin/admin.js`**
   - Archivo vaciado (ya no necesario)

## Estructura de Rutas

### Antes (Mini-SPA con rutas absolutas)
```
/index.html
  ├─ /partials/head.html (cargado dinámicamente)
  ├─ /partials/footer.html (cargado dinámicamente)
  └─ /modules/admin/admin.html?view=dashboard
     ├─ /partials/admin-layout.html (cargado dinámicamente)
     ├─ /modules/admin/dashboard-content.html (cargado dinámicamente)
     └─ /partials/footer.html (cargado dinámicamente)
```

### Después (MPA estática con rutas relativas)
```
/index.html
├─ /modules/admin/dashboard.html
├─ /modules/admin/patient.html
├─ /modules/admin/nourse.html
├─ /modules/admin/assignments.html
├─ /modules/admin/rooms.html
├─ /modules/admin/beds.html
├─ /modules/auth/login.html
└─ /modules/patient/patient.html
```

## Ventajas de la Nueva Arquitectura

✅ **PWA instalable desde cualquier página** - Manifest detectado en todas las páginas
✅ **Compatible con GitHub Pages** - Rutas relativas funcionan en subdirectorios
✅ **Mejor rendimiento** - Sin carga dinámica de HTML
✅ **SEO mejorado** - Cada página es un documento HTML completo
✅ **Más simple de mantener** - Menos JavaScript, más HTML estático
✅ **Mejor accesibilidad** - Navegación directa entre páginas
✅ **Funciona sin JavaScript** - Las páginas son navegables incluso sin JS

## Cómo Usar

### Navegación
- Desde el index, haz clic en los botones para ir a `/modules/patient/patient.html` o `/modules/auth/login.html`
- Desde el login, accede a `/modules/admin/dashboard.html`
- Desde cualquier página admin, usa el sidebar para navegar entre secciones

### Despliegue en GitHub Pages
1. Sube el proyecto a GitHub
2. Activa GitHub Pages en la rama `main` o `gh-pages`
3. La aplicación funcionará correctamente en `https://usuario.github.io/hospital_front/`

### Service Worker
El Service Worker ahora cachea todas las páginas estáticas y funciona correctamente con rutas relativas.

## Archivos Parciales Conservados

Los archivos en `/partials/` se conservan como referencia pero **ya no se cargan dinámicamente**. Su contenido ha sido incrustado directamente en cada página HTML.

- `/partials/head.html` - Referencia de estructura de head
- `/partials/footer.html` - Referencia de estructura de footer
- `/partials/admin-layout.html` - Referencia de estructura del sidebar

## Notas Importantes

1. **Eliminación de `data-include`**: Ya no se usa el sistema de inclusión dinámica
2. **Eliminación de `admin.js`**: La lógica de enrutamiento dinámico ha sido eliminada
3. **Eliminación de `includes.js`**: Ya no es necesario cargar HTML dinámicamente
4. **Rutas relativas**: Todas las rutas ahora son relativas para compatibilidad con GitHub Pages

## Testing

Para probar la aplicación:

1. **Localmente**: Abre `index.html` en el navegador
2. **Con servidor local**: `python -m http.server 8000` y accede a `http://localhost:8000`
3. **PWA**: Abre cualquier página y busca el icono de instalación en el navegador
4. **Service Worker**: Abre DevTools → Application → Service Workers para verificar el registro

## Próximos Pasos (Opcional)

- Considerar usar un bundler como Webpack o Vite para optimizar assets
- Implementar un sistema de build para generar las páginas automáticamente
- Agregar más validación en los formularios
- Implementar sincronización de datos con backend
