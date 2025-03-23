import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.172.0/three.module.min.js';
import { loadTextureAsync } from './loader.js';

// Configuración de la escena, cámara y renderizador
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 250000);
export const renderer = new THREE.WebGLRenderer({ antialias: true });


 // Sombras
 renderer.shadowMap.enabled = true;
 renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombra suave (opcional, mejora calidad)

 document.getElementById("AsteroidSimulator").appendChild(renderer.domElement);
 
renderer.domElement.classList.add("flex","max-w-[100vw]");

       // Parámetros del planeta
export const planetRadius = 15000;
const segmentosH = 64; // Reducir segmentos para mejorar el rendimiento
const segmentosV = 64;

// Parámetros de los cráteres
const numCraters = 25;
const craterRadius = 2 * Math.PI * planetRadius / (numCraters + 3);
const minDistanceBetweenCraters = 2 * craterRadius;
const craterLayerRadius = 0.9 * planetRadius;
const maxDepth = planetRadius * 0.8;

export async function crearFondo() {
    try {
        // Cargar la textura esférica
        const texture = await loadTextureAsync('assets/textures/skybox/360_panorama.png').catch(error => {
            console.error('Error loading spherical texture:', error);
            throw new Error('Failed to load spherical texture.');
        });

        // Configurar la textura
        texture.encoding = THREE.sRGBEncoding; // Asegurar el correcto espacio de color
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Mejorar la calidad de la textura

        // Crear la geometría de la esfera
        const radius = 220000; // Radio de la esfera (ajusta según el tamaño de tu escena)
        const segments = 256; // Número de segmentos (ajusta para mayor o menor detalle)
        const geometry = new THREE.SphereGeometry(radius, segments, segments);

        // Crear el material de la esfera
        const material = new THREE.MeshBasicMaterial({
            map: texture, // Asignar la textura
            side: THREE.BackSide, // Renderizar la textura en el interior de la esfera
        });

        // Crear la malla de la esfera
        const skySphere = new THREE.Mesh(geometry, material);

        // Añadir la esfera a la escena
        scene.add(skySphere);

        console.log('Sky sphere created successfully.');
    } catch (error) {
        console.error('Error creating sky sphere:', error);
        throw error; // Propagar el error a la aplicación principal
    }
}

// Funciones auxiliares
function getRandomPointOnSphere(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
}

function isCraterValid(newCrater, existingCraters, minDistance) {
    for (let crater of existingCraters) {
        if (newCrater.distanceTo(crater) < minDistance) return false;
    }
    return true;
}

function smoothstep(min, max, value) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
}

// Crear el planeta con manejo de errores mejorado
export async function createPlanet() {
    try {
        // Crear la geometría del planeta
        const planetGeometry = new THREE.SphereGeometry(planetRadius, segmentosH, segmentosV);

        // Cargar texturas con seguimiento del progreso
        const [planetTexture, normalMap, displacementMap] = await Promise.all([
            loadTextureAsync('assets/textures/2k_mercury.jpg').catch(error => {
                console.error('Error loading planet texture:', error);
                throw new Error('Failed to load planet texture.');
            }),
            loadTextureAsync('assets/textures/2k_mercury_normal.png').catch(error => {
                console.error('Error loading normal map:', error);
                throw new Error('Failed to load normal map.');
            }),
            loadTextureAsync('assets/textures/2k_mercury_displacement.png').catch(error => {
                console.error('Error loading displacement map:', error);
                throw new Error('Failed to load displacement map.');
            })
        ]);

        // Configurar texturas
        planetTexture.encoding = THREE.sRGBEncoding;
        planetTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        normalMap.encoding = THREE.LinearEncoding;
        displacementMap.encoding = THREE.LinearEncoding;

        // Crear material sin roughnessMap
        const planetMaterial = new THREE.MeshStandardMaterial({
            map: planetTexture,
            normalMap: normalMap,
            displacementMap: displacementMap,
            displacementScale: 800,
            roughness: 0.3, // Ajusta la rugosidad base manualmente
            metalness: 0.5,
            side: THREE.DoubleSide,
        });

        // Crear malla
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        scene.add(planet);

        // Generar cráteres
        console.log('Generating craters...');
        const craterCenters = [];
        let attempts = 0;
        const maxAttempts = numCraters * 100; // Evitar bucles infinitos

        while (craterCenters.length < numCraters && attempts < maxAttempts) {
            const newCrater = getRandomPointOnSphere(craterLayerRadius);
            if (isCraterValid(newCrater, craterCenters, minDistanceBetweenCraters)) {
                craterCenters.push(newCrater);
            }
            attempts++;
        }

        // Aplicar cráteres a la geometría
        const positionAttribute = planetGeometry.attributes.position;
        const vertex = new THREE.Vector3();
        const normal = new THREE.Vector3();

        for (let crater of craterCenters) {
            for (let i = 0; i < positionAttribute.count; i++) {
                vertex.fromBufferAttribute(positionAttribute, i);
                const distanceToCrater = vertex.distanceTo(crater);

                if (distanceToCrater < craterRadius) {
                    const t = distanceToCrater / craterRadius;
                    const depth = maxDepth * smoothstep(0, 2.5, 1 - t);
                    const direction = new THREE.Vector3().subVectors(crater, vertex).normalize();
                    vertex.add(direction.multiplyScalar(depth));

                    const distanceToCenter = vertex.length();
                    if (distanceToCenter < planetRadius * 0.95) {
                        vertex.normalize().multiplyScalar(14000);
                    }

                    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
                }
            }
        }

        // Actualizar la geometría
        positionAttribute.needsUpdate = true;
        planetGeometry.computeVertexNormals();
        planetGeometry.computeBoundingSphere();

        // --------------------------
        // Iluminación (OPTIMIZABLE)
        // --------------------------

        // 1. DirectionalLight (luz principal)
        const directionalLight = new THREE.DirectionalLight(0xFFF1F33D5, 1);
        directionalLight.position.set(-planetRadius - 3000, -planetRadius - 5000, planetRadius - 2000);
        directionalLight.castShadow = false; // Desactivar sombras para mejorar el rendimiento
        scene.add(directionalLight);

        console.log('Planet creation complete');
        return planet;

    } catch (error) {
        console.error('Error creating planet:', error);
        throw error; // Propagar el error a la aplicación principal
    }
}


export function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Actualizar el tamaño del renderizador
    renderer.setSize(width, height);

    // Actualizar la relación de aspecto de la cámara
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

