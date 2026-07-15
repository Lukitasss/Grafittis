# Gestor de Territorios - Grafitis

Sistema completo para gestionar territorios de grafitis con seguimiento de expiración.

## Características

- **Registro de grafitis**: Agrega nuevos territorios con fecha y cantidad
- **Seguimiento de expiración**: Cada grafiti dura 6 días (144 horas)
- **Alertas automáticas**: Notificaciones cuando un territorio está por expirar
- **Renovación fácil**: Renueva territorial con un solo clic
- **Búsqueda**: Encuentra territorios rápidamente
- **Estadísticas**: Vista general del estado de todos los territorios
- **Diseño responsive**: Funciona en computadora y móvil

## Cómo usar

1. **Abrir la página**: Abre `index.html` en tu navegador
2. **Registrar grafiti**: Haz clic en "+ Registrar Grafiti" y completa los datos
3. **Ver territorios**: Todos los grafitis aparecen en la cuadrícula principal
4. **Renovar**: Cuando un territorio esté por expirar, haz clic en "Renovar"
5. **Buscar**: Usa la barra de búsqueda para filtrar territorios

## Cómo ponerla online (Gratis)

### Opción 1: GitHub Pages (Recomendado)

1. Crea una cuenta en [GitHub](https://github.com)
2. Crea un nuevo repositorio llamado `territorios-grafitis`
3. Sube todos los archivos de la carpeta
4. Ve a Settings > Pages
5. En "Source" selecciona la rama `main`
6. Tu página estará disponible en: `https://tu-usuario.github.io/territorios-grafitis`

### Opción 2: Netlify

1. Ve a [Netlify](https://netlify.com)
2. Arrastra la carpeta completa del proyecto
3. Netlify te dará una URL automáticamente
4. Puedes personalizar el dominio en los ajustes

### Opción 3: Vercel

1. Ve a [Vercel](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Vercel desplegará automáticamente tu página

## Tecnologías utilizadas

- **HTML5**: Estructura de la página
- **CSS3**: Estilos modernos con variables CSS
- **JavaScript**: Lógica de la aplicación
- **LocalStorage**: Persistencia de datos en el navegador

## Archivos

```
territorios-grafitis/
├── index.html      # Página principal
├── styles.css      # Estilos de la aplicación
├── app.js          # Lógica de JavaScript
└── README.md       # Este archivo
```

## Notas importantes

- Los datos se guardan en el navegador (localStorage)
- Si limpias el historial del navegador, perderás los datos
- Para compartir datos entre usuarios, se necesita un backend
- La página funciona sin conexión a internet después de cargarla primera vez