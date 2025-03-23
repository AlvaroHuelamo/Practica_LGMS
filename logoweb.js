//import { THREE } from './importador.js';
//import { FontLoader } from './importador.js';
//import { TextGeometry } from './importador.js';
import {THREE} from './cubos.js';
//import {THREE, FontLoader, TextGeometry } from './importador.js';
import { FontLoader, TextGeometry } from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
//import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/loaders/FontLoader.js';
//import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/geometries/TextGeometry.js';

const loader = new FontLoader();

loader.load('./fonts/Angels_RegularJSON.json', function (font) {
    const letrero = document.getElementById('logoWeb');
    const letreroCanvas = document.getElementById('canvasLogoWeb');

    const sceneLetrero = new THREE.Scene();
    const cameraLetrero = new THREE.PerspectiveCamera(75, letrero.clientWidth / letrero.clientHeight, 0.1, 1000);
    const rendererLetrero = new THREE.WebGLRenderer({ 
        antialias: true, 
        canvas: letreroCanvas,
        alpha: true // Habilitar fondo transparente
    });

    // Ajustar el tamaño del renderizador al contenedor
    rendererLetrero.setSize(letrero.clientWidth, letrero.clientHeight);

    // Función para manejar el redimensionamiento
    function onWindowResize() {
        const width = letrero.clientWidth;
        const height = letrero.clientHeight;

        // Actualizar el tamaño del renderizador
        rendererLetrero.setSize(width, height);

        // Actualizar la relación de aspecto de la cámara
        cameraLetrero.aspect = width / height;
        cameraLetrero.updateProjectionMatrix();
    }

    // Escuchar el evento de redimensionamiento de la ventana
    window.addEventListener('resize', onWindowResize);

    // Forzar la actualización inicial
    onWindowResize();

    // Crear la esfera hueca con líneas (malla de alambre)
    const sphereGeometry = new THREE.SphereGeometry(70, 16, 15); // Radio de 70, 32 segmentos
    const wireframe = new THREE.WireframeGeometry(sphereGeometry); // Creamos la geometría de alambre
    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x0000ff, // Color azul
        linewidth: 3 // Grosor de las líneas
    });
    const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
    sceneLetrero.add(wireframeMesh);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Aumentar la intensidad de la luz ambiental
    sceneLetrero.add(ambientLight);

    // Añadir más luces puntuales para cubrir un área más amplia
    const pointLight1 = new THREE.PointLight(0xffffff, 3, 200); // Intensidad aumentada
    pointLight1.position.set(100, 100, 100);
    sceneLetrero.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 3, 200); // Intensidad aumentada
    pointLight2.position.set(-100, -100, -100);
    sceneLetrero.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 3, 200); // Intensidad aumentada
    pointLight3.position.set(-100, 100, 100);
    sceneLetrero.add(pointLight3);

    const pointLight4 = new THREE.PointLight(0xffffff, 3, 200); // Intensidad aumentada
    pointLight4.position.set(100, -100, -100);
    sceneLetrero.add(pointLight4);

    // Luz direccional para iluminación general
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Intensidad aumentada
    directionalLight.position.set(100, 0, -200); // Posición ajustada para iluminar desde arriba
    sceneLetrero.add(directionalLight);

    // Crear las letras individualmente y posicionarlas
    const texto = "GAMES CULTURE ";
    const letters = [];
    const radius = 80; // Radio de la circunferencia sobre la que estará el texto
    let letterSpacing = 21; // Espacio entre cada letra

    for (let i = 0; i < texto.length; i++) {
        const letter = new THREE.Mesh(
            new TextGeometry(texto[i], {
                font: font,
                size: 20,
                height: 4,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.7,
                bevelSize: 0.4,
                bevelSegments: 5
            }),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.1, // Reducir la rugosidad para más reflejo
                metalness: 0.9 // Aumentar el metalness para más brillo
            })
        );

        // Calcular la posición inicial de cada letra
        const angle = i * letterSpacing / radius; // Calcular un ángulo proporcional a la posición de la letra

        letter.position.x = Math.cos(angle) * radius;
        letter.position.z = Math.sin(angle) * radius;
        letter.position.y = 0;

        // Calcular la dirección tangente de cada letra
        const tangentAngle = angle + Math.PI / 2;
        letter.rotation.y = tangentAngle;

        sceneLetrero.add(letter);
        letters.push(letter);
    }

    // Posición de la cámara (un poco alejada, mirando en dirección tangente)
    let cameraAngle = 0; // Inicializamos el ángulo de la cámara
    cameraLetrero.position.x = Math.cos(cameraAngle) * (radius + 55); // Cámara alejada
    cameraLetrero.position.z = Math.sin(cameraAngle) * (radius + 50);
    cameraLetrero.position.y = 20; // Ligera elevación para una mejor vista
    cameraLetrero.lookAt(0, 0, 0); // Cámara mirando hacia el centro (la esfera)

    let angleIncrement = 0.01; // Incremento del ángulo para hacer rotar las letras
    let pulseIntensity = 1.0; // Intensidad inicial del color azul

    // Animación
    function animate() {
        requestAnimationFrame(animate);

        // Desplazar el texto alrededor de la esfera (movimiento de izquierda a derecha)
        angleIncrement += 0.0025;

        // Actualizar la posición de todas las letras
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
           
            let angle = (i * letterSpacing / radius) - angleIncrement; // Movimiento angular hacia la izquierda

            // Calcular la nueva posición de la letra
            letter.position.x = Math.cos(angle) * radius;
            letter.position.z = - Math.sin(angle) * radius;
            letter.position.y = 0;

            // Mantener la orientación tangencial de cada letra
            const tangentAngle = angle + Math.PI / 2;
            letter.rotation.y = tangentAngle;
        }

        // Pulsar el color azul de la esfera (variación del color de las líneas)
        pulseIntensity = 0.4 + 0.05 * Math.sin(Date.now() * 0.005); // Cambiar el valor de la intensidad para el pulso
        wireframeMaterial.color.setRGB(pulseIntensity, pulseIntensity, 1); // Cambiar el color de las líneas a azul pulsante

        // Renderizar la escena
        rendererLetrero.render(sceneLetrero, cameraLetrero);
    }

    animate();
});