function animateWords(containerCanvas) {
    // Recorrer todos los nodos hijos del contenedor
    Array.from(containerCanvas.children).forEach((node, nodeIndex) => {
        // Verificar si el nodo es el botón con id="JUGARAHORA"
        if (node.id === 'JUGARAHORA') {
            // Si es el botón, ignorarlo y continuar con el siguiente elemento
            return;
        }

        // Verificar si el nodo es un elemento <p> o <div>
        if (node.tagName === 'P' || node.tagName === 'DIV') {
            const text = node.textContent.trim(); // Guardar el texto original
            if (!text) return; // Si no hay texto, salir

            const words = text.split(/(\s+)/); // Dividir el texto en palabras y espacios
            node.innerHTML = ''; // Limpiar el contenido original del nodo

            // Calcular el retraso inicial para este párrafo
            const paragraphDelay = nodeIndex * 1.2; // 20% extra de tiempo de retraso entre párrafos

            // Verificar si el texto es "RPG DE ACCIÓN" (sin espacios)
            const isRPGAction = text.replace(/\s+/g, '') === "RPGDEACCIÓN";

            // Procesar cada palabra en el párrafo actual
            words.forEach((word, wordIndex) => {
                if (word.trim() === '') {
                    // Si es un espacio, añadirlo directamente
                    node.appendChild(document.createTextNode(word));
                    return;
                }

                const wordSpan = document.createElement('span');
                wordSpan.textContent = word; // Añadir la palabra

                // Aplicar la clase de animación de movimiento a todas las palabras
                wordSpan.classList.add('word-animation');

                // Aplicar la clase retro-text solo si no es "RPG DE ACCIÓN"
                if (!isRPGAction) {
                    wordSpan.classList.add('retro-text');
                }

                // Retraso para cada palabra (basado en su posición en el párrafo actual)
                const wordDelay = wordIndex * 0.125; // 0.125 segundos entre palabras
                wordSpan.style.animationDelay = `${paragraphDelay + wordDelay}s`; // Retraso total
                node.appendChild(wordSpan);
            });
        }
    });
}

// Llamar a la función con el div contenedor
const container = document.getElementById('container');
animateWords(container);