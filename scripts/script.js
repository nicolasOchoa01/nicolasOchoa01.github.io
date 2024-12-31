// Referencias a los elementos del formulario
let formulario = document.getElementById('registroForm');
let email = document.getElementById('email');
let nombre = document.getElementById('nombre');
let apellido = document.getElementById('apellido');
let mensaje = document.getElementById('mensaje');

// Referencias a los mensajes de error
let errorEmail = document.getElementById('errorEmail');
let errorNombre = document.getElementById('errorNombre');
let errorApellido = document.getElementById('errorApellido');
let errorMensaje = document.getElementById('errorMensaje');

// Funcion para validar el campo de Email
function validarEmail() {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        errorEmail.textContent = 'El correo no tiene un formato válido.';
        return false;
    } else {
        errorEmail.textContent = '';
        return true;
    }
}

// Funcion para validar campos de texto (Nombre y Apellido)
function validarCampoTexto(campo, errorCampo, nombreCampo) {
    if (campo.value.trim() === '') {
        errorCampo.textContent = `${nombreCampo} es obligatorio.`;
        return false;
    } else if (campo.value.trim().length < 2) {
        errorCampo.textContent = `${nombreCampo} debe tener al menos 2 caracteres.`;
        return false;
    } else {
        errorCampo.textContent = '';
        return true;
    }
}

// Funcion para validar el campo de Mensaje
function validarMensaje() {
    if (mensaje.value.trim() === '') {
        errorMensaje.textContent = 'El mensaje no puede estar vacío.';
        return false;
    } else if (mensaje.value.trim().length < 10) {
        errorMensaje.textContent = 'El mensaje debe tener al menos 10 caracteres.';
        return false;
    } else {
        errorMensaje.textContent = '';
        return true;
    }
}

// envio del formulario
formulario.addEventListener('submit', function (event) {
    let emailValido = validarEmail();
    let nombreValido = validarCampoTexto(nombre, errorNombre, 'Nombre');
    let apellidoValido = validarCampoTexto(apellido, errorApellido, 'Apellido');
    let mensajeValido = validarMensaje();

    if (!emailValido || !nombreValido || !apellidoValido || !mensajeValido) {
        event.preventDefault(); // Evita el envío del formulario si hay errores
        alert('Por favor, completa correctamente todos los campos.');
    } else {
        alert('Formulario enviado con éxito.');
    }
});

// Validaciones
email.addEventListener('input', validarEmail);
nombre.addEventListener('input', () => validarCampoTexto(nombre, errorNombre, 'Nombre'));
apellido.addEventListener('input', () => validarCampoTexto(apellido, errorApellido, 'Apellido'));
mensaje.addEventListener('input', validarMensaje);


// Funcion para cargar los productos desde el JSON
async function cargarProductos() {
    try {
        const respuesta = await fetch('./json/productos.json'); // Ruta del JSON
        if (!respuesta.ok) {
            throw new Error('Error al cargar los productos');
        }

        const productos = await respuesta.json(); // Convertir la respuesta a JSON
        renderizarProductos(productos); // Llamar a la función para renderizar
    } catch (error) {
        console.error('Error:', error);
    }
}

// renderizado de productos
function renderizarProductos(productos) {
    let container = document.getElementById('containerCard');
    container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas tarjetas

    productos.forEach(producto => {
        container.innerHTML += `
            <div class="card">
                <img src="${producto.imagen}" alt="${producto.titulo}" class="card-imagen">
                <div class="card-detalle">
                    <h3 class="card-titulo">${producto.titulo}</h3>
                    <h4 class="card-precio">${producto.precio}</h4>
                    <p class="card-descripcion">${producto.descripcion}</p>
                    <div class="card-detalle-botones">
                        <button class="boton-comprar" onclick="comprar()">Comprar</button>
                        <button class="boton-carrito" onclick="agregarAlCarrito(event)">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Llamar a la función para renderizar las tarjetas al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);


// Elementos del DOM
const carritoListado = document.getElementById('carrito-listado');
const totalPagarElemento = document.querySelector('#carrito-resumen p');
const botonesAgregarCarrito = document.getElementsByClassName('boton-carrito');


mostrarCarrito();

// Función para agregar un producto al carrito
function agregarAlCarrito(event) {
    const boton = event.target;
    const card = boton.closest('.card'); // Encuentra el contenedor más cercano con clase 'card'
    
    const titulo = card.querySelector('.card-titulo').textContent;
    const precioTexto = card.querySelector('.card-precio').textContent;
    const precio = parseFloat(precioTexto.replace('$', '').trim()); // Elimina el símbolo $ y convierte a número
    

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const productoExistente = carrito.find(producto => producto.nombre === titulo);

        if (productoExistente) {
            productoExistente.cantidad++;
        }else{
            carrito.push({
                nombre: titulo,
                precio: precio,
                cantidad: 1
            });
        }
    
    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    mostrarCarrito();
}

function mostrarCarrito(){

    // Recuperar el carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    carritoListado.innerHTML = '';

    let totalPagar = 0;
    carrito.forEach(producto => {
        // Crear un nuevo elemento de producto en el carrito
        const nuevoProducto = document.createElement('li');
        nuevoProducto.innerHTML = `
            <p class="carrito-producto-nombre">${producto.nombre}</p>
            <p class="carrito-producto-precio">Precio $${producto.precio}</p>
            <div id="cantidad-container">
                <p class="carrito-producto-cantidad">Cantidad: ${producto.cantidad}</p>
                <button class="carrito-producto-cantidad" onclick="aumentarCantidad(event)">+</button>
                <button class="carrito-producto-cantidad" onclick="disminuirCantidad(event)">-</button>
            </div>
            <button class="carrito-producto-eliminar" onclick="eliminarDelCarrito(event)">Eliminar</button>
        `;
        carritoListado.appendChild(nuevoProducto);
        
        // Actualizar el total
        totalPagar += producto.precio;
        totalPagar = totalPagar * producto.cantidad;
        totalPagarElemento.textContent = `Total a pagar: $${totalPagar.toFixed(2)}`;
    });

}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(event) {
    const boton = event.target;
    const card = boton.closest('li'); 
    let nombreProducto = card.querySelector('.carrito-producto-nombre').textContent;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    carrito = carrito.filter(producto => producto.nombre !== nombreProducto);
    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    mostrarCarrito();
}

function aumentarCantidad(event) {
    let boton = event.target;
    let card = boton.closest('li'); 
    let nombreProducto = card.querySelector('.carrito-producto-nombre').textContent;
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let producto = carrito.find(producto => producto.nombre === nombreProducto);
    
    if (producto) {
        console.log(producto);
        console.log(producto.cantidad);
        producto.cantidad++;
        console.log(producto.cantidad);
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

function disminuirCantidad(event) {
    const boton = event.target;
    const card = boton.closest('li'); 
    let nombreProducto = card.querySelector('.carrito-producto-nombre').textContent;
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(producto => producto.nombre === nombreProducto);
    
    if (producto) {
        if (producto.cantidad >= 1) {
            producto.cantidad--;
        } else {
            eliminarDelCarrito(event);
        }
    } else {
        console.log("Producto no encontrado");
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

function limpiarCarrito(){
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function comprar(event){
    alert("felicidades, compra exitosa!");
    limpiarCarrito();
    mostrarCarrito();
}
