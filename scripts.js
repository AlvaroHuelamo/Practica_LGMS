       
       






       // Seleccionar el botón y los contenedores
       const botonResizable = document.getElementById('BotonResizable');
       const contenedorPrincipal = document.getElementById('ContenedorPrincipal');
       const sectionPrincipal = document.getElementById('sectionPrincipal');

       // Variable para almacenar el estado del contenedor (visible/oculto)
       let isVisible = false;

       // Función para calcular el ancho de sectionPrincipal
       const getSectionWidth = () => {
           return sectionPrincipal.getBoundingClientRect().width;
       };

       // Ocultar el contenedor principal al cargar la página
       contenedorPrincipal.style.transform = `translateX(-${getSectionWidth()}px)`;
       
       // Función para alternar la visibilidad del contenedor
       const toggleVisibility = () => {
           isVisible = !isVisible; // Cambiar el estado de visibilidad
           const translateXValue = isVisible ? 0 : -getSectionWidth();
           contenedorPrincipal.style.transform = `translateX(${translateXValue}px)`;
           // Añadir o quitar la clase flex-col en función de la visibilidad
    if (isVisible) {
      contenedorPrincipal.classList.add('flex-col','gap-4');
      
  } else {
      contenedorPrincipal.classList.remove('flex-col','gap-4');
  }
           // Actualizar atributos ARIA
           botonResizable.setAttribute('aria-expanded', isVisible);
         
          
       };

       // Asignar el evento de clic al botón resizable
       botonResizable.addEventListener('click', function (event) {
           event.stopPropagation(); // Evitar que el clic en el botón propague al documento
           
         
           toggleVisibility();
           
       });

       // Detener eventos de arrastre si existen
       botonResizable.addEventListener('mousedown', (e) => e.stopPropagation());
       botonResizable.addEventListener('touchstart', (e) => e.stopPropagation());

       // Cerrar el panel al hacer clic fuera
       document.addEventListener('click', (event) => {
           if (isVisible && !contenedorPrincipal.contains(event.target)) {
            contenedorPrincipal.classList.remove('flex-col');
               toggleVisibility();
               
           }
       });

       // Actualizar el desplazamiento al redimensionar la ventana
       window.addEventListener('resize', () => {
           if (!isVisible) {
               contenedorPrincipal.style.transform = `translateX(-${getSectionWidth()}px)`;
           }
       });

       // Usar ResizeObserver para detectar cambios en el tamaño de sectionPrincipal
       const resizeObserver = new ResizeObserver(() => {
           if (!isVisible) {
               contenedorPrincipal.style.transform = `translateX(-${getSectionWidth()}px)`;
          
           }
       });
       resizeObserver.observe(sectionPrincipal);





// Selecciona el contenedor
const botones = document.getElementById('botones');
const accesosDirectos = ["Inicio", "QUIZ", "Laboratorio de Scripts"];
const numberOfButtons = accesosDirectos.length;

// Datos de ejemplo para las opciones de cada botón
const opcionesPorBoton = [
  // Opciones para el botón "Inicio" , ACTUALMENTE LLEVAN TODAS A LA SECCIÓN DEL JUEGO DONDE SE ENCUENTRA EL QUIZ
  [
    { texto: "Inicio Opción 1", enlace: "#AsteroidSimulator" },
    { texto: "Inicio Opción 2", enlace: "#AsteroidSimulator" },
    { texto: "Inicio Opción 3", enlace: "#AsteroidSimulator" },
  ],
  // Opciones para el botón "QUIZ"
  [
    { texto: "QUIZ Opción 1", enlace: "#Principantes" },
    { texto: "QUIZ Opción 2", enlace: "#Principantes" },
    { texto: "QUIZ Opción 3", enlace: "#Principantes" },
  ],
  // Opciones para el botón "Laboratorio de Scripts"
  [
    { texto: "Laboratorio Opción 1", enlace: "#" },
    { texto: "Laboratorio Opción 2", enlace: "#" },
    { texto: "Laboratorio Opción 3", enlace: "#" },
  ],
];

// Función para generar la lista desplegable
function generarLista(dropdownList, opciones) {
  dropdownList.innerHTML = ''; // Limpiar la lista antes de agregar elementos

  opciones.forEach(opcion => {
    const li = document.createElement('li');
    li.className = 'w-full text-left '; // Alinear el texto a la izquierda

    const a = document.createElement('a');
    a.href = opcion.enlace;
    a.textContent = opcion.texto;
    a.className = 'block w-full px-4 py-2 text-gray-700 retro-bg dorado text-sm md:text-xl hover:brightness-200  break-words whitespace-normal text-left'; // Alinear el texto a la izquierda
    li.appendChild(a);
    dropdownList.appendChild(li);
  });
}

// Función para ocultar todos los menús desplegables
function ocultarTodosLosMenus() {
  const menus = document.querySelectorAll('[id^="dropdownMenu"]');
  menus.forEach(menu => {
    menu.classList.add('hidden');
  });
}

// Generar los botones y sus listas desplegables
for (let i = 0; i < numberOfButtons; i++) {
  // Crear un contenedor para el botón y la lista desplegable
  const container = document.createElement('div');
  container.className = 'h-full inline-block text-left';

  // Crear un botón
  const button = document.createElement('button');
  button.className =
    'flex h-full text-white px-4 py-2 rounded w-full hover:bg-pink-700 text-sm md:text-2xl exocet-font isolate transition duration-300 justify-center';
  button.textContent = accesosDirectos[i];

  // Crear un contenedor para la lista desplegable
  const dropdownMenu = document.createElement('div');
  dropdownMenu.id = `dropdownMenu${i}`;
  dropdownMenu.className =
    'hidden w-screen absolute left-0 mt-2 bg-white border border-gray-200 rounded shadow-lg z-50'; // Usar w-screen para ocupar todo el ancho de la pantalla

  // Crear la lista dentro del contenedor
  const dropdownList = document.createElement('ul');
  dropdownList.id = `dropdownList${i}`;
  dropdownList.className = 'py-1';
  dropdownMenu.appendChild(dropdownList);

  // Añadir el botón y la lista al contenedor
  container.appendChild(button);
  container.appendChild(dropdownMenu);

  // Añadir el contenedor al contenedor principal de botones
  botones.appendChild(container);

  // Asignar el evento de clic al botón para mostrar/ocultar la lista
  button.addEventListener('click', function (event) {
    // Evitar que el clic en el botón propague al documento
    event.stopPropagation();

    // Ocultar todos los menús desplegables antes de mostrar el actual
    ocultarTodosLosMenus();

    // Mostrar u ocultar el menú desplegable actual
    dropdownMenu.classList.toggle('hidden');

    // Generar la lista solo si está oculta (para evitar regenerarla innecesariamente)
    if (!dropdownMenu.classList.contains('hidden')) {
      generarLista(dropdownList, opcionesPorBoton[i]); // Pasar las opciones específicas del botón
    }
  });
}

// Evento de clic en el documento para cerrar el menú al hacer clic fuera
document.addEventListener('click', function (event) {
  // Verificar si el clic ocurrió fuera de cualquier menú desplegable o botón
  const isClickInsideDropdown = event.target.closest('[id^="dropdownMenu"]');
  const isClickInsideButton = event.target.closest('button');

  if (!isClickInsideDropdown && !isClickInsideButton) {
    // Ocultar todos los menús desplegables
    ocultarTodosLosMenus();
  }
});















// Función para crear la lista de controles
function crearListaControles() {
  const listaControles = document.getElementById('listaControles');

  // Definir los controles y sus descripciones
  const controles = [
      { tecla: 'W / S', accion: 'Pitch (Inclinar hacia arriba/abajo)' },
      { tecla: 'A / D', accion: 'Yaw (Girar a la izquierda/derecha)' },
      { tecla: 'Q / E', accion: 'Roll (Rotar a la izquierda/derecha)' },
      { tecla: 'Shift', accion: 'Aumentar velocidad' },
      { tecla: 'Control', accion: 'Disminuir velocidad' },
      { tecla: 'Velocidad', accion: 'Niveles de -1 (reversa) a 5 (máxima)' }
  ];

  // Limpiar el contenedor antes de agregar elementos
  listaControles.innerHTML = '';

  // Agregar cada control como un div con estilos
  controles.forEach(control => {
      const divControl = document.createElement('div');
      divControl.className = 'control';

      const divTecla = document.createElement('div');
      divTecla.className = 'tecla';
      divTecla.textContent = control.tecla;

      const divAccion = document.createElement('div');
      divAccion.className = 'accion';
      divAccion.textContent = control.accion;

      divControl.appendChild(divTecla);
      divControl.appendChild(divAccion);
      listaControles.appendChild(divControl);
  });
}

// Llamar a la función para crear la lista de controles
crearListaControles();









     // Datos de las características del juego
     const características = [
      "Construcción de naves: Diseña y construye naves espaciales desde cero, pieza por pieza, con un sistema de construcción detallado y realista.",
      "Universo masivo: Explora un vasto universo con planetas, asteroides y estaciones espaciales, todo en un entorno de mundo abierto.",
      "Simulación física: Experimenta una física realista que afecta a todo, desde el movimiento de las naves hasta la destrucción de objetos.",
      "Jugabilidad multijugador: Juega con miles de otros jugadores en un universo compartido, donde puedes cooperar o competir.",
      "Recursos y minería: Extrae recursos de asteroides y planetas para construir y mejorar tus naves y estaciones.",
      "Combate espacial: Participa en intensos combates espaciales con un sistema de daño detallado que afecta a cada componente de tu nave.",
      "Economía dinámica: Comercia con otros jugadores y participa en una economía en constante evolución.",
      "Personalización: Personaliza tus naves, estaciones y personajes con una gran variedad de opciones."
  ];

  // Crear el contenedor principal
  const listaCaracteristicas = document.getElementById('ListaCaracteristicas');

  // Crear el título principal
  const tituloPrincipal = document.createElement('h1');
  tituloPrincipal.className = 'text-xl md:text-3xl exocet-font dorado  brigthness-200 font-bold text-center mb-8';
  tituloPrincipal.textContent = 'Características de Starbase';
  listaCaracteristicas.appendChild(tituloPrincipal);

  // Crear el div que contendrá la lista
  const divCaracteristicas = document.createElement('div');
  divCaracteristicas.className = 'bg-white/5 text-center p-6 rounded-lg shadow-lg';
  listaCaracteristicas.appendChild(divCaracteristicas);

  // Crear el subtítulo
  const subtitulo = document.createElement('h2');
  subtitulo.className = 'text-xm md:text-2xl font-semibold exocet-font brigthness-200 text-white/70 mb-4';
  subtitulo.textContent = '¿Qué hace especial a Starbase?';
  divCaracteristicas.appendChild(subtitulo);

  // Crear la lista
  const lista = document.createElement('ul');
  lista.className = 'list-disc list-inside space-y-3';
  divCaracteristicas.appendChild(lista);

  // Añadir cada característica a la lista
  características.forEach(caracteristica => {
      const item = document.createElement('li');
      item.className = 'text-sm md:text-lg exocet-font text-white/80 bg-gradient-to-r from-black to-red-700 text-center rounded-2xl md:rounded-full p-4 opacity-70';
      // Resaltar la parte de la característica en negrita
      const [titulo, descripcion] = caracteristica.split(':');
      item.innerHTML = `<span class="font-bold">${titulo}:</span> ${descripcion}`;
      lista.appendChild(item);
  });