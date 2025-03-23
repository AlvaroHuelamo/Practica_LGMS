import { THREE } from './importador.js';
import { loadTextureAsync } from './loader.js';

const loadedTextures = new Map(); // Para evitar cargar la misma textura dos veces

export async function loadTextureNear(position, key, distance, scene, camera) {
    if (loadedTextures.has(key)) return; // Ya está cargada

    const playerPos = camera.position; // Usar la cámara pasada como parámetro
    const dist = playerPos.distanceTo(position);
    if (dist < distance) {
        const texture = await loadTextureAsync(`assets/${key}.jpg`); // Cargar la textura
        const material = new THREE.MeshBasicMaterial({ map: texture }); // Crear un material con la textura
        const geometry = new THREE.PlaneGeometry(100, 100); // Crear una geometría simple (por ejemplo, un plano)
        const mesh = new THREE.Mesh(geometry, material); // Crear una malla con la geometría y el material

        mesh.position.copy(position); // Establecer la posición de la malla
        scene.add(mesh); // Añadir la malla a la escena

        loadedTextures.set(key, mesh); // Almacenar la malla para evitar cargarla de nuevo
        console.log(`${key} cargado cerca`);
    }
}

export function unloadObject(key, scene) {
    if (loadedTextures.has(key)) {
        const mesh = loadedTextures.get(key);

        // Liberar recursos de la malla
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
            } else {
                mesh.material.dispose();
            }
        }

        // Eliminar la malla de la escena
        scene.remove(mesh);

        // Eliminar la referencia del mapa
        loadedTextures.delete(key);

        console.log(`${key} descargado`);
    }
}