import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.172.0/three.module.min.js';
import { planetRadius } from './planetaCrater.js'; // Importar el radio del planeta

let asteroids = []; // Arreglo para almacenar información de cada asteroide
let instancedMesh; // Instancia de THREE.InstancedMesh

// Función para deformar la esfera en forma lobulada
function deformToLobed(geometry, lobeCount, lobeAmplitude, deformationStrength) {
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Convertir coordenadas cartesianas a esféricas
        const radius = Math.sqrt(x * x + y * y + z * z);
        const theta = Math.atan2(y, x); // Ángulo en el plano XY
        const phi = Math.acos(z / radius); // Ángulo desde el eje Z

        // Aplicar deformación lobulada
        const lobeFactor = Math.sin(lobeCount * theta) * Math.cos(lobeCount * phi);
        const scale = 1 + lobeAmplitude * lobeFactor; // Escalar el radio para crear lóbulos

        // Aplicar la deformación a las coordenadas
        positions[i] *= scale;
        positions[i + 1] *= scale;
        positions[i + 2] *= scale;

        // Aplicar deformación aleatoria adicional
        positions[i] += (Math.random() - 0.5) * deformationStrength;
        positions[i + 1] += (Math.random() - 0.5) * deformationStrength;
        positions[i + 2] += (Math.random() - 0.5) * deformationStrength;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalcular normales después de deformar
}

// Función para verificar si una posición es válida (sin colisiones y dentro del toro azul)
function isPositionValid(newPos, existingPositions, minDistance, torusRadius, tubeRadius) {
    // Verificar si la posición está dentro del toro azul
    const x = newPos.x;
    const y = newPos.y;
    const z = newPos.z;
    const distanceToCenter = Math.sqrt(x * x + y * y);
    const distanceToTorus = Math.sqrt((torusRadius - distanceToCenter) ** 2 + z * z);

    if (distanceToTorus > tubeRadius) {
        return false; // Fuera del toro azul
    }

    // Verificar si la posición está demasiado cerca de otros asteroides
    for (let pos of existingPositions) {
        if (newPos.distanceTo(pos) < minDistance) return false;
    }

    return true;
}

export function createAsteroidField(count, scene) {
    return new Promise((resolve) => {
        // Cargar texturas
        const textureLoader = new THREE.TextureLoader();

        // Texturas esenciales
        const colorTexture = textureLoader.load('assets/textures/ground_0010_color_1k.jpg'); // Textura de color
        const normalTexture = textureLoader.load('assets/textures/ground_0010_normal_opengl_1k.png'); // Mapa de normales (OpenGL)

        // Texturas opcionales
        const roughnessTexture = textureLoader.load('assets/textures/ground_0010_roughness_1k.jpg'); // Mapa de rugosidad
        const aoTexture = textureLoader.load('assets/textures/ground_0010_ao_1k.jpg'); // Mapa de oclusión ambiental
        const displacementTexture = textureLoader.load('assets/textures/ground_0010_height_1k.png'); // Mapa de desplazamiento

        // Crear material con texturas
        const material = new THREE.MeshStandardMaterial({
            map: colorTexture, // Textura de color
            normalMap: normalTexture, // Mapa de normales
            normalScale: new THREE.Vector2(1, 1), // Reducir la intensidad del mapa de normales
            roughnessMap: roughnessTexture, // Mapa de rugosidad
            aoMap: aoTexture, // Mapa de oclusión ambiental
            displacementMap: displacementTexture, // Mapa de desplazamiento
            displacementScale: 10, // Reducir la intensidad del desplazamiento
            roughness: 0.3, // Ajusta la rugosidad base
            metalness: 0.5, // Ajusta la metalicidad
            side: THREE.DoubleSide, // Asegurarse de que ambos lados sean visibles
        });

        // Crear geometría base (esfera con más segmentos)
        const baseGeometry = new THREE.SphereGeometry(1000, 128, 128); // Más segmentos para mayor detalle

        // Deformar la geometría para que sea lobulada y deforme
        deformToLobed(baseGeometry, 5, 0.2, 20); // Ajustar el número de lóbulos, amplitud y deformación

        // Crear instancias de asteroides
        instancedMesh = new THREE.InstancedMesh(baseGeometry, material, count);
        instancedMesh.castShadow = true; // Proyecta sombras
        instancedMesh.receiveShadow = true; // Recibe sombras
        scene.add(instancedMesh);

        // Parámetros del toro (disco volumétrico)
        const torusRadius = planetRadius + 20000; // Radio mayor del toro
        const tubeRadius = 5000; // Radio menor del toro (grosor)
        const radialSegments = 64; // Segmentos radiales
        const tubularSegments = 64; // Segmentos tubulares
        const torusColor = new THREE.Color(0x0f33f12A9); // Color azul para el toro

        // Crear un toro para representar el disco volumétrico
        const torusGeometry = new THREE.TorusGeometry(torusRadius, tubeRadius, radialSegments, tubularSegments);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: torusColor,
            transparent: true,
            opacity: 0.2, // Transparencia para que no opaque los asteroides
            side: THREE.DoubleSide,
        });
        const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
        torusMesh.rotation.x = Math.PI; // Rotar para que esté en el plano XY
        scene.add(torusMesh);

        // Parámetros para la generación de asteroides
        const minDistanceBetweenAsteroids = 3000; // Distancia mínima entre asteroides
        const maxAttempts = 1000; // Número máximo de intentos por asteroide
        const asteroidPositions = []; // Almacenar posiciones de los asteroides

        // Crear asteroides con posiciones, rotaciones y escalas aleatorias dentro del toro azul
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let pos;
            let isValidPosition = false;

            // Generar una posición válida (sin colisiones y dentro del toro azul)
            while (!isValidPosition && attempts < maxAttempts) {
                // Generar una posición aleatoria dentro del toro azul (en el plano XY)
                const randomAngle = Math.random() * Math.PI * 2; // Ángulo alrededor del toro
                const randomTubeAngle = Math.random() * Math.PI * 2; // Ángulo dentro del tubo
                const randomRadius = torusRadius + Math.cos(randomTubeAngle) * tubeRadius; // Radio ajustado para el toro
                const randomHeight = Math.sin(randomTubeAngle) * tubeRadius; // Altura ajustada para el toro

                // Convertir coordenadas toroidales a cartesianas (en el plano XY)
                pos = new THREE.Vector3(
                    randomRadius * Math.cos(randomAngle), // Posición X
                    randomRadius * Math.sin(randomAngle), // Posición Y
                    0 // Posición Z (en el plano XY)
                );

                // Verificar si la posición es válida
                isValidPosition = isPositionValid(pos, asteroidPositions, minDistanceBetweenAsteroids, torusRadius, tubeRadius);
                attempts++;
            }

            if (!isValidPosition) {
                console.warn(`No se pudo encontrar una posición válida para el asteroide ${i}`);
                continue;
            }

            // Guardar la posición válida
            asteroidPositions.push(pos);

            // Rotación aleatoria
            const rotation = new THREE.Euler(
                Math.PI / 2, // Rotación X
                Math.PI, // Rotación Y
                Math.random() * Math.PI * 0.5  // Rotación Z
            );

            // Velocidad de rotación aleatoria
            const rotationSpeed = new THREE.Vector3(
                0.0001, // Velocidad de rotación en X
                0.0001, // Velocidad de rotación en Y
                0.0001  // Velocidad de rotación en Z
            );

            // Escala aleatoria para cada eje (X, Y, Z)
            const scaleX = 0.5 + Math.random() * 1.5; // Escala en X (alargado o no)
            const scaleY = 0.5 * scaleX; // Escala en Y
            const scaleZ = 0.5 + scaleX; // Escala en Z

            // Crear un vector de escala con valores aleatorios para cada eje
            const scale = new THREE.Vector3(scaleX, scaleY, scaleZ);

            // Crear y asignar la matriz de transformación
            const matrix = new THREE.Matrix4();
            matrix.compose(pos, new THREE.Quaternion().setFromEuler(rotation), scale);
            instancedMesh.setMatrixAt(i, matrix);

            // Guardar información del asteroide
            asteroids.push({ matrix, rotation, rotationSpeed });
        }

        // Indicar que la matriz de instancias necesita actualización
        instancedMesh.instanceMatrix.needsUpdate = true;
        console.log(`${count} asteroids generated inside the blue torus.`);

        resolve(instancedMesh);
    });
}

// Función para animar los asteroides
export function animateAsteroids() {
    // Actualizar rotaciones y matrices de los asteroides
    asteroids.forEach((asteroid, i) => {
        // Aplicar la velocidad de rotación
        asteroid.rotation.x += asteroid.rotationSpeed.x;
        asteroid.rotation.y += asteroid.rotationSpeed.y;
        asteroid.rotation.z += asteroid.rotationSpeed.z;

        // Crear una nueva matriz con la rotación actualizada
        const matrix = new THREE.Matrix4();
        matrix.compose(
            new THREE.Vector3().setFromMatrixPosition(asteroid.matrix), // Mantener la posición original
            new THREE.Quaternion().setFromEuler(asteroid.rotation), // Aplicar la nueva rotación
            new THREE.Vector3().setFromMatrixScale(asteroid.matrix) // Mantener la escala original
        );

        // Actualizar la matriz de la instancia
        instancedMesh.setMatrixAt(i, matrix);
    });

    // Indicar que las matrices de las instancias necesitan actualización
    instancedMesh.instanceMatrix.needsUpdate = true;
}