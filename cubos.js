//import { THREE } from './importador.js';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.172.0/three.module.min.js';
// Configuración inicial para el contenedor #canvas3d
const containerCanvas = document.getElementById("canvas3d");
export {THREE};
// Escena, cámara y renderizador para los cubos
const sceneCubos = new THREE.Scene();
const cameraCubos = new THREE.PerspectiveCamera(
    75,
    containerCanvas.clientWidth / containerCanvas.clientHeight,
    0.1,
    1000
);
const rendererCubos = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
});
rendererCubos.setSize(containerCanvas.clientWidth, containerCanvas.clientHeight);
containerCanvas.appendChild(rendererCubos.domElement);

// Luz ambiental y puntual para los cubos
const ambientLightCubos = new THREE.AmbientLight(0xffffff, 1);
sceneCubos.add(ambientLightCubos);
const pointLightCubos = new THREE.PointLight(0xffffff, 2, 100);
pointLightCubos.position.set(10, 10, 10);
sceneCubos.add(pointLightCubos);

// Crear cubos
const numberOfCubes = 15;
const cubes = [];
for (let i = 0; i < numberOfCubes; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        shininess: 100,
        specular: 0xffffff
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.z = -20;
    cube.speed = Math.random() * 0.1 + 0.05;
    cube.radius = Math.random() * 5 + 2;
    cube.angle = Math.random() * Math.PI * 2;
    sceneCubos.add(cube);
    cubes.push(cube);
}

// Posicionar la cámara
cameraCubos.position.z = 30;

// Animación para los cubos
function animateCubos() {
    requestAnimationFrame(animateCubos);

    // Animar los cubos
    cubes.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.position.z += cube.speed;
        cube.position.x = Math.cos(cube.angle) * cube.radius;
        cube.position.y = Math.sin(cube.angle) * cube.radius;
        cube.angle += 0.01;
        if (cube.position.z > 30) {
            cube.position.z = -90;
            cube.radius = Math.random() * 5 + 2;
            cube.angle = Math.random() * Math.PI * 2;
        }
    });

    // Renderizar la escena de los cubos
    rendererCubos.render(sceneCubos, cameraCubos);
}

animateCubos();

// Manejar el redimensionamiento de la ventana para los cubos
window.addEventListener('resize', () => {
    const widthCubos = containerCanvas.clientWidth;
    const heightCubos = containerCanvas.clientHeight;

    rendererCubos.setSize(widthCubos, heightCubos);
    cameraCubos.aspect = widthCubos / heightCubos;
    cameraCubos.updateProjectionMatrix();
});