// Creamos un nuevo CLIENTE de socket.io
const socketClient = io();

// Generamos un par de constantes que hacen referencia al campo input y al botón del formulario, así
// podemos manejarlos desde aquí
const message = document.getElementById("message");
const received_messages = document.getElementById("received_messages");
const user = document.getElementById("user");

// Este tópico messagesLogs es emitido por el servidor cada vez que recibe un mensaje de chat
// nuevo de alguno de los clientes. De esa forma recibimos aviso y podemos actualizar el párrafo
// con la lista de mensajes
socketClient.on("messagesLogs", (data) => {
    let messages = "";
    data.forEach((message) => {
        messages += `[${message.user}] ${message.message}<br />`;
    });
    received_messages.innerHTML = messages;
});

// Emite un tópico message con el nuevo mensaje al pulsar el botón Enviar, manda
// además el nombre del usuario conectado con esta instancia del chat
const sendMessage = () => {
    if (message.value.trim() !== "") {
        const data = { user: user.value.trim(), message: message.value.trim() }
        socketClient.emit("message", data);

        message.value = "";
        user.value = "";
    }
};