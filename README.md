# 🍽️ Food Tracker Web App

Una aplicación web moderna para registrar y analizar salidas gastronómicas, con estadísticas estilo "Spotify Wrapped".

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Project Settings** > **General** > **Your apps**
4. Haz clic en el ícono de **Web** (`</>`) para agregar una app web
5. Copia las credenciales de configuración
6. Abre `src/config/firebase.js` y reemplaza los valores:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 3. Configurar Firestore

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **Create database**
3. Selecciona **Start in test mode** (o configura reglas de seguridad según necesites)
4. Elige una ubicación para tu base de datos
5. La colección `reviews` se creará automáticamente cuando guardes la primera reseña

### 4. Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Stack Tecnológico

- **React** - Framework UI
- **Vite** - Build tool
- **Firebase Firestore** - Base de datos
- **Recharts** - Gráficos y estadísticas
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos

## 🎨 Características

- ✅ Formulario de ingreso con sistema de estrellas (1-5 con medios puntos)
- ✅ Feed de reseñas recientes
- ✅ Estadísticas mensuales (KPIs)
- ✅ Gráficos de tendencia y categorías
- ✅ Top 3 lugares favoritos
- ✅ Datos curiosos (día favorito para salir)
- ✅ Diseño responsive mobile-first
- ✅ Animaciones suaves con Framer Motion

## 📱 Diseño

- **Estilo:** Minimalismo "Pop" con fondo blanco (#FAFAFA)
- **Colores:** Acentos vibrantes para diferenciar categorías
- **Tipografía:** Inter (sans-serif moderna)
- **UI:** Bordes redondeados, sombras suaves, inputs grandes para móvil

## 🔒 Seguridad

La aplicación asume que está protegida externamente por Cloudflare Access, por lo que no incluye autenticación interna. Si el usuario accede a la app, está autorizado.

## 📝 Estructura de Datos

### Colección: `reviews`

```javascript
{
  id: string,
  timestamp: Date,
  placeName: string,
  location: string,
  price: number,
  rating: number (float, steps of 0.5),
  reviewText: string,
  items: Array<{ name: string, category: string }>
}
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 📄 Licencia

Este proyecto es privado.
