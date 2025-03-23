import { scene, camera, renderer, createPlanet, crearFondo, onWindowResize } from './planetaCrater.js';
import { updateCamera, createCameraLights } from './camara.js';
import { initInfoPanel, updateInfoPanel } from './infoPanel.js';
import { createAsteroidField, animateAsteroids } from './instancer.js'; // Importar animateAsteroids
import { cleanupResources } from './loader.js';

// Variables para el límite de FPS
let lastTime = 0;
const fpsLimit = 120; // Limitar a 60 FPS
const frameTime = 1000 / fpsLimit; // Tiempo entre fotogramas en milisegundos

async function startAnimation() {
    const loadingScreen = document.getElementById('loadingScreen');

    try {

           // Crear el fondo
           console.log("Loading background...");
           await crearFondo();

           
        // Crear el planeta
        console.log("Loading planet...");
        await createPlanet();

        // Crear el campo de asteroides
        console.log("Generating asteroids...");
        await createAsteroidField(50, scene);

        camera.position.set(0, 0, 30000); // Coloca la cámara en el eje Z, delante del planeta
        createCameraLights(camera,scene); // Creamos las luces

        // Iniciar el bucle de animación con límite de FPS
        function animate(currentTime) {
            requestAnimationFrame(animate);

            // Calcular el tiempo transcurrido desde el último fotograma
            const deltaTime = currentTime - lastTime;

            // Si ha pasado el tiempo suficiente, renderizar el siguiente fotograma
            if (deltaTime >= frameTime) {
                lastTime = currentTime - (deltaTime % frameTime); // Ajustar el tiempo para mantener el FPS constante

                // Actualizar la cámara y el panel de información
                updateCamera(camera);
                updateInfoPanel(camera);

                // Animar los asteroides
                animateAsteroids();

            
                onWindowResize();
               // Renderizar la escena
               renderer.render(scene, camera);
        }
        }

        // Ocultar la pantalla de carga
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.style.opacity = '1';
            }, 500);
        }
        window.addEventListener('resize', onWindowResize);
        // Iniciar el bucle de animación
        animate();
        const width = document.getElementById("AsteroidSimulator").clientWidth;
        const height = document.getElementById("AsteroidSimulator").clientHeight;
        // Configurar el manejador de redimensionamiento
function onWindowResize() {

     

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

camera.aspect = width / height;
camera.updateProjectionMatrix();
}
     /*   window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
*/





    } catch (error) {
        console.error("Error loading assets:", error);
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="color: red; text-align: center; padding: 20px;">
                    <h2>Error Loading Simulator</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" 
                            style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
        cleanupResources(); // Limpiar recursos en caso de error
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready, starting simulator...");
    initInfoPanel(); // Inicializar el panel de información
    startAnimation().catch(error => {
        console.error("Fatal error:", error);
        cleanupResources(); // Limpiar recursos en caso de error fatal
    });
});

// Limpieza al descargar la página
window.addEventListener('beforeunload', () => {
    scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    });
    renderer.dispose();
    cleanupResources(); // Limpiar recursos adicionales
});