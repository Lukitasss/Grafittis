# INSTRUCCIONES - Configurar Google Sheets como Backend

## Paso 1: Crear la hoja de cálculo

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Haz clic en **"+ Hoja de cálculo en blanco"**
3. Dale un nombre como **"Territorios Grafitis"**

---

## Paso 2: Crear el script

1. En tu hoja de cálculo, ve a **Extensiones > Apps Script**
2. Se abrirá una nueva pestaña
3. Borra TODO el código que aparezca
4. Copia y pega el contenido del archivo `google-apps-script.js` que está en esta carpeta
5. Haz clic en **"Guardar"** (ícono de diskette o Ctrl+S)

---

## Paso 3: Instalar el script

1. En el editor de Apps Script, haz clic en el botón **"Ejecutar"** (ícono de play ▶)
2. Selecciona la función **"install"**
3. Te pedirá permisos: haz clic en **"Revisar permisos"**
4. Selecciona tu cuenta de Google
5. Si aparece "Google no ha verificado esta app", haz clic en **"Avanzado"** > **"Ir a Territorios Grafitis (no seguro)"**
6. Haz clic en **"Permitir"**
7. Espera a que termine (verás "La ejecución se ha completado")

---

## Paso 4: Desplegar como Web App

1. En Apps Script, haz clic en **"Implementar"** > **"Nueva implementación"**
2. Selecciona **"Aplicación web"**
3. Configura así:
   - **Descripción:** "Territorios Grafitis API"
   - **Ejecutar como:** "Yo (tu-email@gmail.com)"
   - **Quién tiene acceso:** "Cualquier persona"
4. Haz clic en **"Implementar"**
5. **COPIA LA URL** que te aparece (empieza con `https://script.google.com/macros/...`)
6. Haz clic en **"Listo"**

---

## Paso 5: Configurar la página web

1. Abre el archivo `app.js` con cualquier editor de texto (Bloc de notas)
2. Busca esta línea al inicio:
   ```javascript
   const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec';
   ```
3. Reemplaza `TU_SCRIPT_ID` con la URL que copiaste en el Paso 4
4. Cambia `const USE_GOOGLE_SHEETS = false;` a `const USE_GOOGLE_SHEETS = true;`
5. Guarda el archivo

**Ejemplo:**
Si tu URL es: `https://script.google.com/macros/s/AKfycbx123456789/exec`
La línea debería quedar así:
```javascript
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx123456789/exec';
```

---

## Paso 6: Abrir la página

1. Abre `index.html` en tu navegador
2. ¡Listo! Ya puedes empezar a agregar territorios
3. Todos los datos se guardarán en tu hoja de Google Sheets

---

## Cómo compartir con tus amigos

Opción 1 - Subir a Netlify (recomendado):
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta `territorios-grafitis` al sitio
3. Comparte la URL que te da Netlify

Opción 2 - GitHub Pages:
1. Crea una cuenta en GitHub
2. Sube los archivos a un repositorio
3. Ve a Settings > Pages > activa desde la rama main

---

## Solución de problemas

**Si no se guardan los datos:**
- Abre la consola del navegador (F12 > Console) y mira si hay errores
- Verifica que la URL de Google Sheets esté correcta

**Si da error de permisos:**
- Ve a tu hoja de Google Sheets
- Haz clic en "Compartir"
- Agrega el email de tu amigo con permiso de "Editor"

**Si no ves los datos de tu amigo:**
- Asegúrate de que todos estén usando la misma URL del Web App
- Los datos se guardan en la hoja de cálculo, no en el navegador