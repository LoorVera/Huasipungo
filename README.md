# Huasipungo · Videojuego educativo

Videojuego 2D en pixel art basado en la novela *Huasipungo* de Jorge Icaza (Ecuador, 1934).
El jugador controla a Andrés Chiliquinga, recorre los Andes ecuatorianos, habla con los
personajes de la novela y completa actividades para aprender sobre la obra.

## Cómo se juega

| Acción | Teclado | Celular |
| --- | --- | --- |
| Moverse | A / D | ◀ ▶ |
| Saltar | W / Espacio | ▲ |
| Correr | Shift | CORRER |
| Interactuar | E | botón E |
| Menú | Esc | ☰ |

- **Zonas:** Las Montañas, El Huasipungo, Zona de Aprendizaje, Casa de los Personajes,
  Zona de Cultivos, La Hacienda y El Pueblo.
- **Personajes:** Cunshi, Alfonso Pereira, Julio Pereira, el cura y la comunidad indígena
  cuentan su historia y hacen una pregunta sobre la novela.
- **Actividades en el mapa:** La Novela, Personajes, Mentefacto, Línea del tiempo, Mapa,
  Quiz, Juego de memoria, ¿Quién soy? y Tabla de posiciones.
- **Progreso:** XP, niveles, misiones, logros y 10 páginas perdidas para coleccionar.
  Se guarda automáticamente en el navegador (LocalStorage).

## Ejecutar en tu computadora

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

Luego abre http://localhost:8443/

## Publicar en Vercel

1. En [vercel.com](https://vercel.com), elige **Add New → Project** e importa este repositorio.
2. Vercel detecta **Vite** automáticamente (comando `npm run build`, carpeta `dist`).
3. Pulsa **Deploy**.

## Estructura

- `src/game/`: motor del juego (Canvas 2D, sin librerías): mundo, sprites, física, audio.
- `src/components/game/`: interfaz del juego (menú, HUD, diálogos, controles táctiles).
- `src/sections/`: actividades educativas que se abren dentro del mapa.
- `src/data/`: contenido de la novela, diálogos, preguntas y misiones.

---

Proyecto con fines educativos basado en *Huasipungo* de Jorge Icaza.
