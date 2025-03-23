// infoPanel.js

import { getCameraPosition, getCameraVelocity, getCameraRotation } from "./camara.js";
import { getLoadingProgress } from './loader.js'; // Importar si es necesario

let infoPanel;
let positionX, positionY, positionZ, speed, pitch, yaw, roll;
let loadingComplete = false; // Bandera para controlar si la carga ha terminado

export function initInfoPanel() {
    const container = document.getElementById("AsteroidSimulator");
    if (!container) {
        console.error("El contenedor #AsteroidSimulator no existe en el DOM.");
        return;
    }

    // Crear el infoPanel con Tailwind
    infoPanel = document.createElement("div");
    infoPanel.id = "infoPanel";
    infoPanel.classList.add(
        "absolute", // Posición absoluta dentro del contenedor
        "top-4", // 1rem desde la parte superior del contenedor
        "left-4", // 1rem desde la izquierda del contenedor
        "bg-red-800/70", // Fondo rojo con transparencia
        "text-white", // Texto blanco
        "p-4", // Padding de 1rem
        "rounded-lg", // Bordes redondeados
        "shadow-lg", // Sombra
        "z-50", // Z-index alto para asegurar que esté por encima de otros elementos
        "font-sans", // Fuente sans-serif
        "text-xs",
        "md:text-sm", // Tamaño de texto algo mas grande a partir de pantallas medianas
        "backdrop-blur-sm", // Efecto de desenfoque
        "border", // Borde
        "border-red-900" // Color del borde
    );

    // Crear elementos para cada dato con Tailwind
    infoPanel.innerHTML = `
        <div class="space-y-2">
            <strong class="block font-bold">Posición:</strong>
            <div>X: <span id="positionX" class="font-mono">0.00</span></div>
            <div>Y: <span id="positionY" class="font-mono">0.00</span></div>
            <div>Z: <span id="positionZ" class="font-mono">0.00</span></div>
        </div>
        <div class="mt-4">
            <strong class="block font-bold">Velocidad:</strong>
            <span id="speed" class="font-mono">0.00</span>
        </div>
        <div class="mt-4">
            <strong class="block font-bold">Ángulos de giro:</strong>
            <div>Pitch (X): <span id="pitch" class="font-mono">0.00</span>°</div>
            <div>Yaw (Y): <span id="yaw" class="font-mono">0.00</span>°</div>
            <div>Roll (Z): <span id="roll" class="font-mono">0.00</span>°</div>
        </div>
    `;

    // Verificar que el infoPanel se haya creado correctamente
    if (!infoPanel) {
        console.error("No se pudo crear el infoPanel.");
        return;
    }

    // Añadir el infoPanel al contenedor #AsteroidSimulator
    container.appendChild(infoPanel);

    // Obtener referencias a los elementos internos
    positionX = document.getElementById("positionX");
    positionY = document.getElementById("positionY");
    positionZ = document.getElementById("positionZ");
    speed = document.getElementById("speed");
    pitch = document.getElementById("pitch");
    yaw = document.getElementById("yaw");
    roll = document.getElementById("roll");

    // Verificar que todos los elementos se encontraron
    if (!positionX || !positionY || !positionZ || !speed || !pitch || !yaw || !roll) {
        console.error("No se pudieron encontrar todos los elementos del infoPanel.");
        return;
    }

    console.log("infoPanel creado y añadido correctamente.");
}

// Función para normalizar un ángulo al rango [-180, 180]
function normalizeAngle(angle) {
    angle = angle % 360; // Asegurarse de que el ángulo esté en el rango [-360, 360]
    if (angle > 180) {
        angle -= 360; // Convertir ángulos mayores que 180 a negativos
    } else if (angle < -180) {
        angle += 360; // Convertir ángulos menores que -180 a positivos
    }
    return angle;
}

// Función para actualizar el panel de información
export function updateInfoPanel(camera) {
    if (!camera) {
        console.error("Camera is undefined in updateInfoPanel");
        return;
    }

    // Obtener los datos de la cámara
    const position = getCameraPosition(camera);
    const velocity = getCameraVelocity();
    const rotation = getCameraRotation(camera);

    // Normalizar los ángulos de giro al rango [-180, 180]
    const normalizedPitch = normalizeAngle(rotation.pitch * (180 / Math.PI));
    const normalizedYaw = normalizeAngle(rotation.yaw * (180 / Math.PI));
    const normalizedRoll = normalizeAngle(rotation.roll * (180 / Math.PI));

    // Actualizar los valores en el panel
    positionX.textContent = position.x.toFixed(2);
    positionY.textContent = position.y.toFixed(2);
    positionZ.textContent = position.z.toFixed(2);
    speed.textContent = velocity.toFixed(2);
    pitch.textContent = normalizedPitch.toFixed(2);
    yaw.textContent = normalizedYaw.toFixed(2);
    roll.textContent = normalizedRoll.toFixed(2);

    // Mostrar el progreso de carga (opcional)
    if (!loadingComplete) {
        const progress = getLoadingProgress();
        console.log(`Loading progress: ${progress * 100}%`);
        if (progress >= 1) {
            loadingComplete = true; // Marcar la carga como completa
        }
    }
}