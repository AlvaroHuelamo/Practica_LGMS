import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.172.0/three.module.min.js';

// Variables para la cámara y su movimiento
let velocity = new THREE.Vector3(); // Velocidad actual de la cámara
let currentSpeedLevel = 0; // Nivel de velocidad actual (de -1 a 5)
const moveSpeed = 40; // Velocidad base ajustable
const keyboardRotationSpeed = 0.005; // Sensibilidad de rotación
const rollSpeed = 0.01; // Sensibilidad de rotación en roll
const friction = 0.95; // Fricción para desacelerar

// Niveles de velocidad
const speedLevels = {
    "-1": -moveSpeed * 0.5, // Reversa
    "0": 0, // Detenido
    "1": moveSpeed * 0.5,
    "2": moveSpeed,
    "3": moveSpeed * 1.5,
    "4": moveSpeed * 2,
    "5": moveSpeed * 2.5
};

// Registro de teclas presionadas
const keysPressed = {};

// ------------------------
// Luces delanteras
// ------------------------


let spotLightLeft, spotLightRight;


export function createCameraLights(camera, scene) {
    // Crear la primera luz (lado izquierdo)
    const spotLightLeft = new THREE.SpotLight(0xffff00 , 5000, 6000, Math.PI / 3, 0.3, 1);
    spotLightLeft.position.set(-5, 0, -10); // Posición relativa a la cámara (delante y un poco a la izquierda)
    spotLightLeft.castShadow = true; // Habilitar sombras
    camera.add(spotLightLeft); // Añadir la luz como hijo de la cámara

    // Crear la segunda luz (lado derecho)
    const spotLightRight = new THREE.SpotLight(0xffff00, 5000, 6000, Math.PI / 3, 0.3, 1);
    spotLightRight.position.set(5, 0, -10); // Posición relativa a la cámara (delante y un poco a la derecha)
    spotLightRight.castShadow = true; // Habilitar sombras
    camera.add(spotLightRight); // Añadir la luz como hijo de la cámara

    // Configurar los targets de las luces
    const forward = new THREE.Vector3(0, 0, -1); // Dirección hacia adelante
    forward.applyQuaternion(camera.quaternion); // Aplicar la rotación de la cámara
    forward.multiplyScalar(500); // Multiplicar por una distancia adecuada
    spotLightLeft.target.position.copy(forward);
    spotLightRight.target.position.copy(forward);
    camera.add(spotLightLeft.target); // Añadir el target también
    camera.add(spotLightRight.target); // Añadir el target también

    // (Opcional) Helpers para depuración
    const spotLightLeftHelper = new THREE.SpotLightHelper(spotLightLeft);
    scene.add(spotLightLeftHelper); // Añadir a la escena (NO a la cámara, para visualizar correctamente)

    const spotLightRightHelper = new THREE.SpotLightHelper(spotLightRight);
    scene.add(spotLightRightHelper); // Añadir a la escena (NO a la cámara)

    // (Opcional) Actualización de los helpers
    function animateHelpers() {
        requestAnimationFrame(animateHelpers);
     //   spotLightLeftHelper.update();
    //    spotLightRightHelper.update();
    }
    animateHelpers();
    scene.add(camera);
}

    // Añadir helpers para visualizar las luces (opcional, solo para depuración)
   // spotLightHelperLeft = new THREE.SpotLightHelper(spotLightLeft);
  //  scene.add(spotLightHelperLeft);

  //  spotLightHelperRight = new THREE.SpotLightHelper(spotLightRight);
  //  scene.add(spotLightHelperRight);




// ------------------------
// Registro de eventos
// ------------------------
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// Registrar tecla presionada
function onKeyDown(event) {
    const key = event.key.toLowerCase();
    keysPressed[key] = true;

    // Control especial para aumentar/disminuir velocidad
    if (key === "shift" && currentSpeedLevel < 5) {
        currentSpeedLevel++;
        console.log(`Velocidad: ${currentSpeedLevel}`);
    } else if (key === "control" && currentSpeedLevel > -1) {
        currentSpeedLevel--;
        console.log(`Velocidad: ${currentSpeedLevel}`);
    }
}

// Registrar tecla soltada
function onKeyUp(event) {
    const key = event.key.toLowerCase();
    keysPressed[key] = false;
}

// ------------------------
// Movimiento y rotación
// ------------------------
function updateCameraPositionAndRotation(camera) {
    const angle = keyboardRotationSpeed;

    // ---------------- YAW (a / d) ----------------
    if (keysPressed["a"]) {
        const yawAxis = new THREE.Vector3(0, 1, 0); // Eje Y (vertical local)
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(yawAxis, angle);
        camera.quaternion.multiply(yawQuat); // Rotación local
    }
    if (keysPressed["d"]) {
        const yawAxis = new THREE.Vector3(0, 1, 0);
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(yawAxis, -angle);
        camera.quaternion.multiply(yawQuat);
    }

    // ---------------- PITCH (w / s) ----------------
    if (keysPressed["w"] || keysPressed["s"]) {
        const pitchAxis = new THREE.Vector3(1, 0, 0); // Eje X local (horizontal)
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(pitchAxis, keysPressed["w"] ? angle : -angle);
        camera.quaternion.multiply(pitchQuat);
    }

    // ---------------- ROLL (q / e) ----------------
    if (keysPressed["q"]) {
        const rollAxis = new THREE.Vector3(0, 0, 1); // Eje Z local
        const rollQuat = new THREE.Quaternion().setFromAxisAngle(rollAxis, rollSpeed);
        camera.quaternion.multiply(rollQuat);
    }
    if (keysPressed["e"]) {
        const rollAxis = new THREE.Vector3(0, 0, 1);
        const rollQuat = new THREE.Quaternion().setFromAxisAngle(rollAxis, -rollSpeed);
        camera.quaternion.multiply(rollQuat);
    }

    // ---------------- Movimiento adelante / atrás ----------------
    const targetSpeed = speedLevels[currentSpeedLevel.toString()];
    if (targetSpeed !== undefined && targetSpeed !== 0) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const desiredVelocity = direction.multiplyScalar(targetSpeed);
        velocity.lerp(desiredVelocity, 0.1); // Suavizado
    }

    // ---------------- Fricción ----------------
    velocity.multiplyScalar(friction);
    if (velocity.length() < 0.01) velocity.set(0, 0, 0); // Detener si es muy baja

    // ---------------- Aplicar movimiento ----------------
    camera.position.add(velocity);
}

// ------------------------
// Interfaz para infoPanel.js
// ------------------------
export function getCameraPosition(camera) {
    if (!camera) {
        console.error("Camera is undefined in getCameraPosition");
        return new THREE.Vector3(); // Retorna un vector vacío si la cámara no está definida
    }
    return camera.position;
}

export function getCameraVelocity() {
    return velocity.length();
}

export function getCameraRotation(camera) {
    if (!camera) {
        console.error("Camera is undefined in getCameraRotation");
        return { pitch: 0, yaw: 0, roll: 0 }; // Retorna un objeto vacío si la cámara no está definida
    }
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    return {
        pitch: euler.x,
        yaw: euler.y,
        roll: euler.z
    };
}

// ------------------------
// Llamada pública de actualización
// ------------------------
export function updateCamera(camera) {
    updateCameraPositionAndRotation(camera);

    // Actualizar el target de las luces para que apunten hacia adelante
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    forward.multiplyScalar(100); // Multiplicar por una distancia adecuada

    if (spotLightLeft) {
        spotLightLeft.target.position.copy(forward);
    }
    if (spotLightRight) {
        spotLightRight.target.position.copy(forward);
    }
}