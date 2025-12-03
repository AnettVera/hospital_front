# Configuración para GitHub Pages

## 🎯 Objetivo

Desplegar la aplicación PWA en GitHub Pages de forma que funcione correctamente en un subdirectorio.

## ✅ Requisitos Previos

- [x] Rutas relativas en todos los archivos (ya completado)
- [x] Manifest con rutas relativas (ya completado)
- [x] Service Worker con rutas relativas (ya completado)
- [x] Repositorio Git configurado

## 📋 Pasos para Desplegar

### 1. Crear/Actualizar Repositorio en GitHub

```bash
# Si aún no tienes repositorio
git init
git add .
git commit -m "Refactorización a MPA estática con rutas relativas"
git branch -M main
git remote add origin https://github.com/tu-usuario/hospital_front.git
git push -u origin main
```

### 2. Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú izquierdo, selecciona **Pages**
4. En **Source**, selecciona:
   - Branch: `main`
   - Folder: `/ (root)`
5. Haz clic en **Save**

GitHub Pages generará una URL como:
```
https://tu-usuario.github.io/hospital_front/
```

### 3. Verificar Despliegue

Espera 1-2 minutos y luego accede a:
```
https://tu-usuario.github.io/hospital_front/
```

Deberías ver la página de inicio de la aplicación.

## 🔍 Verificación de Funcionamiento

### 1. Verificar Rutas

Abre DevTools (F12) en cualquier página y ve a **Network**:

✅ **Correcto** (rutas relativas):
```
css/styles.css
js/app.js
img/logo.jpeg
manifest.json
```

❌ **Incorrecto** (rutas absolutas):
```
/css/styles.css
/js/app.js
/img/logo.jpeg
/manifest.json
```

### 2. Verificar Manifest

En DevTools → **Application** → **Manifest**:
- Debe mostrar el contenido del manifest
- `start_url` debe ser `./`
- `scope` debe ser `./`
- Los iconos deben cargar correctamente

### 3. Verificar Service Worker

En DevTools → **Application** → **Service Workers**:
- Estado: `activated and running`
- Scope: `https://tu-usuario.github.io/hospital_front/`

### 4. Verificar PWA Instalable

En cualquier página:
1. Busca el icono de instalación (esquina superior derecha del navegador)
2. Haz clic en "Instalar"
3. La app se instalará como aplicación nativa

## 🚨 Solución de Problemas

### Problema: "Manifest no encontrado"

**Causa**: Las rutas en el manifest son incorrectas

**Solución**:
```json
{
  "start_url": "./",
  "scope": "./",
  "icons": [
    {
      "src": "./img/192.png"
    }
  ]
}
```

### Problema: "Recursos no cargan (404)"

**Causa**: Las rutas HTML son absolutas

**Solución**: Verifica que todas las rutas sean relativas:
```html
<!-- ❌ Incorrecto -->
<link rel="stylesheet" href="/css/styles.css">

<!-- ✅ Correcto -->
<link rel="stylesheet" href="../../css/styles.css">
```

### Problema: "Service Worker no se registra"

**Causa**: La ruta del SW es incorrecta

**Solución**: En `js/app.js`:
```javascript
// ❌ Incorrecto
navigator.serviceWorker.register('/sw.js')

// ✅ Correcto
navigator.serviceWorker.register('./sw.js')
```

### Problema: "PWA no se instala"

**Causa**: El manifest no está en el `<head>` de todas las páginas

**Solución**: Verifica que cada página HTML tenga:
```html
<head>
    <link rel="manifest" href="../../manifest.json">
    <meta name="theme-color" content="#E6EBF5">
    <meta name="apple-mobile-web-app-capable" content="yes">
</head>
```

## 📊 Estructura de URLs en GitHub Pages

### Ejemplo: Usuario "juan" con repositorio "hospital_front"

```
Repositorio: https://github.com/juan/hospital_front
GitHub Pages: https://juan.github.io/hospital_front/

Rutas:
├── https://juan.github.io/hospital_front/
│   └── index.html
├── https://juan.github.io/hospital_front/modules/admin/dashboard.html
├── https://juan.github.io/hospital_front/modules/admin/patient.html
├── https://juan.github.io/hospital_front/css/styles.css
├── https://juan.github.io/hospital_front/js/app.js
└── https://juan.github.io/hospital_front/manifest.json
```

## 🔐 Consideraciones de Seguridad

### HTTPS Automático

GitHub Pages proporciona HTTPS automáticamente, lo cual es **requerido para PWA**.

✅ `https://tu-usuario.github.io/hospital_front/` - PWA funciona
❌ `http://tu-usuario.github.io/hospital_front/` - PWA no funciona

### Service Worker

El Service Worker solo funciona en HTTPS (excepto localhost).

## 📱 Testing en Dispositivos Móviles

### 1. Acceder desde Móvil

1. Abre el navegador en tu teléfono
2. Ve a `https://tu-usuario.github.io/hospital_front/`
3. Busca el icono de instalación (generalmente en la barra de direcciones)
4. Haz clic en "Instalar" o "Agregar a pantalla de inicio"

### 2. Probar Offline

1. Instala la PWA
2. Abre la app instalada
3. Desactiva el WiFi y datos móviles
4. La app debe seguir funcionando (gracias al Service Worker)

## 🔄 Actualizar la Aplicación

Cuando hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

GitHub Pages se actualizará automáticamente en 1-2 minutos.

### Limpiar Caché del Service Worker

Si los cambios no aparecen:

1. Abre DevTools (F12)
2. Ve a **Application** → **Service Workers**
3. Haz clic en "Unregister"
4. Recarga la página (Ctrl+Shift+R para limpiar caché)

## 📚 Recursos Útiles

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## ✅ Checklist Final

- [x] Repositorio creado en GitHub
- [x] GitHub Pages habilitado
- [x] Rutas relativas en todos los archivos
- [x] Manifest con rutas relativas
- [x] Service Worker registrado
- [x] PWA instalable desde cualquier página
- [x] Funciona en subdirectorio de GitHub Pages
- [x] HTTPS habilitado automáticamente
- [x] Offline funciona correctamente

¡Tu PWA está lista para GitHub Pages! 🚀
