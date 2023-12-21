import express from "express";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import { __dirname } from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";

const PORT = 8080;
const MOONGOSE_URL =
    "mongodb+srv://hymmateriales:hym123@cluster0.glgppls.mongodb.net/ecommerce";

try {
    await mongoose.connect(MOONGOSE_URL);

    const app = express();
    // Asignamos a httpServer la instancia de Express para poder luego pasarlo al server de socket.io
    const httpServer = app.listen(PORT, () => {
        console.log(
            `Servidor EXPRESS activo en puerto ${PORT}, conectado a base de datos`
        );
    });

    //Creo servidor websockets con socket.io
    const io = new Server(httpServer);

    let messages = []

    // Manejar la conexión de los clientes mediante Socket.io
    io.on("connection", (socket) => {
        console.log("Nuevo cliente conectado");
        // Cuando un nuevo cliente se conecta, enviamos (SOLO a ese cliente)
        // el array actual de mensajes del chat
        socket.emit('messagesLogs', messages)
        console.log(`Chat actual enviado a ${socket.id}`)

        // "Escuchamos" por el tópico message
        socket.on('message', data => {
            messages.push(data)
            io.emit('messagesLogs', messages)
        })

    });

    // Configuración para uso de motor de plantillas Handlebars
    app.engine("handlebars", handlebars.engine());
    app.set("views", `${__dirname}/views`);
    app.set("view engine", "handlebars");

    // Guardo la instancia de Socket.IO en la aplicación de Express
    app.set("socketio", io);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //Endpoints productos
    app.use("/api/products", productsRouter);
    //Endpoints carritos
    app.use("/api/carts", cartsRouter);
    //Endpoints views
    app.use("/", viewsRouter);
    // Servicio de contenidos estáticos
    app.use("/static", express.static(`${__dirname}/public`));

    app.get("/", (req, res) => {
        res.status(200).send("Servidor OK");
    });

} catch (err) {
    console.error("Error al inicializar el servidor");
}
