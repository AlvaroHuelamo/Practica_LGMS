import * as THREE  from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.172.0/three.module.min.js'; 
import { GLTFLoader } from "https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js"
// Crear el loadingManager
export const loadingManager = new THREE.LoadingManager();

// Variables para rastrear el estado de carga
let isLoading = false;
let totalItems = 0;
let loadedItems = 0;

// Callback cuando comienza la carga
loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    isLoading = true;
    totalItems = itemsTotal;
    loadedItems = itemsLoaded;

    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    console.log(`Started loading: ${url}`);
};

// Callback durante el progreso de la carga
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    loadedItems = itemsLoaded;
    totalItems = itemsTotal;

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = (itemsLoaded / itemsTotal) * 100;
        progressBar.style.width = `${progress}%`;
        console.log(`Loading progress: ${progress.toFixed(1)}% (${itemsLoaded}/${itemsTotal})`);
    }
};

// Callback cuando la carga se completa
loadingManager.onLoad = function () {
    isLoading = false;
    console.log('Loading complete!');

    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        // Ocultar la pantalla de carga con un retraso
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.style.opacity = '1';
            }, 500);
        }, 100);
    }
};

// Callback en caso de error
loadingManager.onError = function (url) {
    isLoading = false;
    console.error('Error loading:', url);

    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div style="color: red; text-align: center;">
                <h2>Error Loading Resources</h2>
                <p>Failed to load: ${url}</p>
                <button onclick="location.reload()" style="padding: 10px; margin-top: 20px;">
                    Retry
                </button>
            </div>
        `;
        loadingScreen.style.opacity = '1'; // Asegurar que la pantalla de carga sea visible
    }
};

// Crear loaders con el loadingManager
export const textureLoader = new THREE.TextureLoader(loadingManager);
export const gltfLoader = new GLTFLoader(loadingManager);

// Función asíncrona para cargar texturas
export function loadTextureAsync(url) {
    return new Promise((resolve, reject) => {
        try {
            textureLoader.load(
                url,
                (texture) => {
                    texture.needsUpdate = true;
                    resolve(texture);
                },
                (xhr) => {
                    // Actualizar la barra de progreso
                    const progressBar = document.getElementById('progressBar');
                    if (progressBar) {
                        const progress = (xhr.loaded / xhr.total) * 100;
                        progressBar.style.width = `${progress}%`;
                    }
                },
                (error) => {
                    console.error(`Error loading texture ${url}:`, error);
                    reject(error);
                }
            );
        } catch (error) {
            console.error(`Error setting up texture load for ${url}:`, error);
            reject(error);
        }
    });
}

// Función asíncrona para cargar modelos GLTF
export function loadGLTFAsync(url) {
    return new Promise((resolve, reject) => {
        try {
            gltfLoader.load(
                url,
                (gltf) => {
                    resolve(gltf);
                },
                (xhr) => {
                    // Actualizar la barra de progreso
                    const progressBar = document.getElementById('progressBar');
                    if (progressBar) {
                        const progress = (xhr.loaded / xhr.total) * 100;
                        progressBar.style.width = `${progress}%`;
                    }
                },
                (error) => {
                    console.error(`Error loading GLTF ${url}:`, error);
                    reject(error);
                }
            );
        } catch (error) {
            console.error(`Error setting up GLTF load for ${url}:`, error);
            reject(error);
        }
    });
}

// Función para verificar si hay una carga en progreso
export function isLoadingInProgress() {
    return isLoading && loadedItems < totalItems;
}

// Función para obtener el progreso de carga actual
export function getLoadingProgress() {
    return totalItems > 0 ? loadedItems / totalItems : 0;
}

// Función para limpiar recursos en caso de error o cancelación
export function cleanupResources() {
    // Reiniciar el estado de carga
    isLoading = false;
    totalItems = 0;
    loadedItems = 0;

    // Limpiar cualquier recurso pendiente
    textureLoader.manager.onError = null;
    gltfLoader.manager.onError = null;
    console.log('Resources cleaned up.');
}