const datosQuiz = [
    {
        pregunta: "¿A qué temperatura está el Sol",
        respuestas: ["10.000 °C", "5.505 °C", "400 °C", "No se ha podido medir"],
        respuestasCorrectas: ["5.505 °C"] // Solo una respuesta válida
    },
    {
        pregunta: "¿Cuántos planetas hay en el sistema solar?",
        respuestas: ["7", "8", "9", "10"],
        respuestasCorrectas: ["8"] // Solo una respuesta válida
    },
    {
        pregunta: "¿Existe el rozamiento en el espacio?",
        respuestas: ["Sí, depende de la distancia al Sol y a los planetas más cercanos", "No, no existe el rozamiento en el vacío", "Pues claro !", "El rozamiento en el espacio es prácticamente 0 Newtons por la ausencia de materia"],
        respuestasCorrectas: ["No, no existe el rozamiento en el vacío", "El rozamiento en el espacio es prácticamente 0 Newtons por la ausencia de materia"] // Dos respuestas válidas
    },
    {
        pregunta: "¿Cuál de estos materiales son útiles para la fabricación de naves?",
        respuestas: ["Piedra", "Metal", "Tela", "Material combustible"],
        respuestasCorrectas: ["Metal","Material combustible"] // Solo dos respuesta válida
    },
    {
        pregunta: "¿Cuáles de estos gases son necesarios dentro de una nave?",
        respuestas: ["Oxígeno", "Nitrógeno", "Fluor", "Hidrógeno"],
        respuestasCorrectas: ["Oxígeno", "Nitrógeno", "Hidrógeno"] // Tres respuestas válidas
    },
    {
        pregunta: "¿Cuántas Lunas hay en el sistema solar?",
        respuestas: ["218", "387", "318", "129"],
        respuestasCorrectas: ["218"] // Solo una respuesta válida
    },
    {
        pregunta: "¿A qué equivale una unidad astronómica?",
        respuestas: ["149.597.870,691 kilómetros", "Es una sección o cuadrilla de un ejército espacial", "Se utiliza para medir radiación", "Equivale a la velocidad de la luz"],
        respuestasCorrectas: ["149.597.870,691 kilómetros"] // Solo una respuesta válida
    },
    {
        pregunta: "¿Cuál de estos minerales es comúnmente buscado en la minería espacial?",
        respuestas: ["Oro", "Platino", "Helio-3", "Carbón"],
        respuestasCorrectas: ["Platino", "Helio-3"] // Dos respuestas válidas
    },
    {
        pregunta: "¿Qué cuerpo celeste es considerado un objetivo principal para la minería espacial?",
        respuestas: ["Luna", "Marte", "Ceres", "Titán"],
        respuestasCorrectas: ["Luna", "Ceres"] // Dos respuestas válidas
    },
    {
        pregunta: "¿Qué ventaja tiene la minería espacial sobre la minería terrestre?",
        respuestas: ["Menor impacto ambiental en la Tierra", "Mayor abundancia de recursos raros", "Costos más bajos de extracción", "Tecnología más avanzada"],
        respuestasCorrectas: ["Menor impacto ambiental en la Tierra", "Mayor abundancia de recursos raros"] // Dos respuestas válidas
    }

];

// Mezclar las preguntas en un orden aleatorio
let datosQuizMezclados = [...datosQuiz].sort(() => Math.random() - 0.5);

let preguntaActual = 0;
let puntuacion = 0;
let respuestasUsuario = Array(datosQuizMezclados.length).fill(null); // Inicializa un array para almacenar las respuestas del usuario

const app = document.getElementById('app');
const pantallaInicio = document.getElementById('pantalla-inicio');
const contenedorQuiz = document.getElementById('contenedor-quiz');
const contenedorResultados = document.getElementById('contenedor-resultados');
const elementoPregunta = document.getElementById('pregunta');
const elementoRespuestas = document.getElementById('respuestas');
const botonAnterior = document.getElementById('boton-anterior');
const botonSiguiente = document.getElementById('boton-siguiente');
const elementoResultados = document.getElementById('resultados');
const botonInicio = document.getElementById('boton-inicio');
const botonReintentar = document.getElementById('boton-reintentar');
const barraProgreso = document.getElementById('barra-progreso');
const contadorPreguntas = document.getElementById('contador-preguntas');

function cargarPregunta() {
    const datosPreguntaActual = datosQuizMezclados[preguntaActual];
    elementoPregunta.innerText = datosPreguntaActual.pregunta;
    elementoRespuestas.innerHTML = '';
    datosPreguntaActual.respuestas.forEach(respuesta => {
        const boton = document.createElement('button');
        boton.innerText = respuesta;
        boton.classList.add('w-full', 'px-4', 'py-2', 'bg-gradient-to-r', 'from-black', 'from-0%', 'via-green-900/20', 'via-50%', 'to-green-700/30', 'to-100', 'rounded', 'hover:bg-gray-300', 'transition', 'duration-300');

        // Si la pregunta ya fue respondida, deshabilitar los botones y aplicar estilos
        if (respuestasUsuario[preguntaActual] !== null) {
            boton.disabled = true;
            if (datosPreguntaActual.respuestasCorrectas.includes(respuesta)) {
                boton.classList.add('border-2', 'border-green-500', 'bg-green-500/20', 'scale-up');
            } else if (respuestasUsuario[preguntaActual].includes(respuesta)) {
                boton.classList.add('bg-gray-500', 'text-white', 'scale-up');
            }
        } else {
            boton.addEventListener('click', () => seleccionarRespuesta(respuesta));
        }

        elementoRespuestas.appendChild(boton);
    });

    // Agregar botón de confirmar si la pregunta permite múltiples respuestas
    if (datosPreguntaActual.respuestasCorrectas.length > 1) {
        const botonConfirmar = document.createElement('button');
        botonConfirmar.innerText = 'Confirmar';
        botonConfirmar.classList.add('w-full', 'px-4', 'py-2', 'bg-amber-500', 'text-white', 'rounded', 'hover:bg-indigo-600', 'transition', 'duration-300', 'mt-4');
        botonConfirmar.addEventListener('click', confirmarRespuesta);
        elementoRespuestas.appendChild(botonConfirmar);
    }

    actualizarBotones();
    actualizarBarraProgreso();
    actualizarContadorPreguntas();
}

function seleccionarRespuesta(respuesta) {
    const datosPreguntaActual = datosQuizMezclados[preguntaActual];
    const botones = elementoRespuestas.querySelectorAll('button');

    // Si la pregunta permite múltiples respuestas, no deshabilitar las opciones
    if (datosPreguntaActual.respuestasCorrectas.length > 1) {
        const botonSeleccionado = Array.from(botones).find(boton => boton.innerText === respuesta);
        botonSeleccionado.classList.toggle('bg-organe-500'); // Cambiar estilo para indicar selección
        botonSeleccionado.classList.toggle('text-white');
    } else {
        // Para preguntas de una sola respuesta, deshabilitar todas las opciones
        botones.forEach(boton => {
            boton.disabled = true;
            if (datosPreguntaActual.respuestasCorrectas.includes(boton.innerText)) {
                boton.classList.add('border-2', 'border-green-500', 'bg-green-500/20', 'scale-up');
            } else if (boton.innerText === respuesta) {
                boton.classList.add('bg-gray-500', 'text-white', 'scale-up');
            }
        });
        respuestasUsuario[preguntaActual] = [respuesta]; // Guardar la respuesta del usuario
        if (datosPreguntaActual.respuestasCorrectas.includes(respuesta)) {
            puntuacion++;
        }
        botonSiguiente.disabled = false; // Habilitar el botón "Siguiente"
        botonSiguiente.classList.add('scale-up');
    }
}

function confirmarRespuesta() {
    const datosPreguntaActual = datosQuizMezclados[preguntaActual];
    const botones = elementoRespuestas.querySelectorAll('button');
    const respuestasSeleccionadas = Array.from(botones)
        .filter(boton => boton.classList.contains('bg-amber-300'))
        .map(boton => boton.innerText);

    // Deshabilitar todas las respuestas después de confirmar
    botones.forEach(boton => {
        boton.disabled = true;
        if (datosPreguntaActual.respuestasCorrectas.includes(boton.innerText)) {
            boton.classList.add('border-2', 'border-green-500', 'bg-green-500/20', 'scale-up');
        } else if (respuestasSeleccionadas.includes(boton.innerText)) {
            boton.classList.add('bg-gray-500', 'text-white', 'scale-up');
        }
    });

    // Guardar las respuestas seleccionadas
    respuestasUsuario[preguntaActual] = respuestasSeleccionadas;

    // Verificar respuestas correctas
    const respuestasCorrectasSeleccionadas = respuestasSeleccionadas.filter(respuesta => datosPreguntaActual.respuestasCorrectas.includes(respuesta)).length;
    if (respuestasCorrectasSeleccionadas === datosPreguntaActual.respuestasCorrectas.length) {
        puntuacion++;
    }

    // Cambiar el estilo del botón de confirmar a verdoso
    const botonConfirmar = Array.from(botones).find(boton => boton.innerText === 'Confirmar');
    if (botonConfirmar) {
        botonConfirmar.classList.remove('bg-amber-500', 'hover:bg-indigo-600');
        botonConfirmar.classList.add('bg-green-500', 'hover:bg-green-600');
    }

    botonSiguiente.disabled = false; // Habilitar el botón "Siguiente"
    botonSiguiente.classList.add('scale-up');
}

function actualizarBotones() {
    botonAnterior.disabled = preguntaActual === 0;
    botonSiguiente.disabled = respuestasUsuario[preguntaActual] === null;
}

function actualizarBarraProgreso() {
    const progreso = ((preguntaActual + 1) / datosQuizMezclados.length) * 100;
    barraProgreso.style.width = `${progreso}%`; // Actualizar el ancho de la barra de progreso
}

function actualizarContadorPreguntas() {
    contadorPreguntas.textContent = `Pregunta ${preguntaActual + 1} de ${datosQuizMezclados.length}`;
}

function mostrarResultados() {
    contenedorQuiz.classList.add('hidden');
    contenedorResultados.classList.remove('hidden');
    const porcentaje = (puntuacion / datosQuizMezclados.length) * 100;
    elementoResultados.innerText = `Tuviste ${puntuacion} de ${datosQuizMezclados.length} correctas (${porcentaje.toFixed(2)}%)`;
}

function reiniciarQuiz() {
    // Reiniciar variables
    preguntaActual = 0;
    puntuacion = 0;
    respuestasUsuario = Array(datosQuizMezclados.length).fill(null);
    datosQuizMezclados = [...datosQuiz].sort(() => Math.random() - 0.5); // Mezclar preguntas nuevamente

    // Ocultar resultados y mostrar el quiz
    contenedorResultados.classList.add('hidden');
    contenedorQuiz.classList.remove('hidden');
    cargarPregunta(); // Cargar la primera pregunta
}

botonAnterior.addEventListener('click', () => {
    if (preguntaActual > 0) {
        preguntaActual--;
        cargarPregunta();
    }
});

botonSiguiente.addEventListener('click', () => {
    if (preguntaActual < datosQuizMezclados.length - 1) {
        preguntaActual++;
        cargarPregunta();
    } else {
        mostrarResultados();
    }
});

botonInicio.addEventListener('click', () => {
    pantallaInicio.classList.add('hidden'); // Ocultar la pantalla de inicio
    contenedorQuiz.classList.remove('hidden'); // Mostrar el quiz
    cargarPregunta(); // Cargar la primera pregunta
});

botonReintentar.addEventListener('click', () => {
    reiniciarQuiz(); // Reiniciar el quiz
});

// Inicializar la pantalla de inicio
pantallaInicio.classList.remove('hidden');