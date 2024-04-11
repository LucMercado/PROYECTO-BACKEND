import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import usersRouter from "./routes/users.routes.js";
import sessionsRouter from "./routes/session.routes.js";
import cookiesRouter from "./routes/cookies.routes.js";
import viewsRouter from "./routes/views.routes.js";
import { __dirname } from "./utils.js";
import MongoSingleton from "./services/mongo.singleton.js";

import config from "./config.js";
import errorsDictionary from "./services/errors.dictionary.js";
import addLogger from "./services/winston.logger.js";

import MessageController from "./dao/message.controller.js";

const messageManager = new MessageController();

const PORT = config.PORT;
const MONGOOSE_URL = config.MONGOOSE_URL;

try {
    // Inicialización de la base de datos
    await MongoSingleton.getInstance();
    const app = express();


    // Configuración de Swagger
    const swaggerOptions = {
        definition: {
            openapi: "3.0.1",
            info: {
                title: "Documentación HYM Materiales",
                description:
                    "Esta documentación describe los endpoints de la API del BACKEND de HYM Materiales",
            },
        },
        apis: ["./src/docs/**/*.yaml"], // todos los archivos de configuración de rutas estarán aquí
    };
    const specs = swaggerJsdoc(swaggerOptions);

    app.use(
        cors({
            origin: "*", // http://127.0.0.1:5500
            methods: "GET,POST,PUT,PATCH,DELETE",
        })
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser("cookieHYM"));

    app.use(
        session({
            store: MongoStore.create({
                mongoUrl: MONGOOSE_URL,
                mongoOptions: {},
                ttl: 60,
                clearInterval: 5000,
            }), // MONGODB
            secret: "cookieHYM",
            resave: false,
            saveUninitialized: false,
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    // Configuración para uso de motor de plantillas Handlebars
    app.engine("handlebars", handlebars.engine());
    app.set("views", `${__dirname}/views`);
    app.set("view engine", "handlebars");

    // Middleware para loggear las peticiones
    app.use(addLogger);

    //Endpoints views
    app.use("/", viewsRouter);
    //Endpoints productos
    app.use("/api/products", productsRouter);
    //Endpoints carritos
    app.use("/api/carts", cartsRouter);
    //Endpoints usuarios
    app.use("/api/users", usersRouter);
    //Endpoints sesiones
    app.use("/api/sessions", sessionsRouter);
    //Endpoints cookies
    app.use("/api/cookies", cookiesRouter);
    // Servicio de contenidos estáticos
    app.use("/static", express.static(`${__dirname}/public`));

    //Middleware captura general de errores
    app.use((err, req, res, next) => {
        const code = err.code || 500;
        const message = err.message || "Hubo un problema, error desconocido";

        req.logger.error({ status: "ERR", code, data: message });

        return res.status(code).send({
            status: "ERR",
            data: message,
        });
    });

    // SWAGGER
    app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

    // CONFIGURACIÓN DE CHAT
    // Asignamos a httpServer la instancia de Express para poder luego pasarlo al server de socket.io    
    const httpServer = app.listen(PORT, "0.0.0.0", () => {
        console.log(
            `Servidor EXPRESS activo en puerto ${PORT}, conectado a base de datos`
        );
        process.on("uncaughtException", (exception) => {
            console.error(exception.name);
            console.error(exception.message);
        });
    });
    //Creo servidor websockets con socket.io
    const io = new Server(httpServer);
    let messages = [];

    // Manejar la conexión de los clientes mediante Socket.io
    io.on("connection", (socket) => {
        console.log("Nuevo cliente conectado");
        // Cuando un nuevo cliente se conecta, enviamos (SOLO a ese cliente)
        // el array actual de mensajes del chat
        socket.emit("messagesLogs", messages);
        console.log(`Chat actual enviado a ${socket.id}`);

        // "Escuchamos" por el tópico message
        socket.on("message", async (data) => {
            messages.push(data);
            io.emit("messagesLogs", messages);
            const result = await messageManager.addMessage(data);
            console.log(result);
        });
    });

    // Guardo la instancia de Socket.IO en la aplicación de Express
    app.set("socketio", io);

    app.use("/chat", (req, res) => {
        res.render("chat", {
            title: "Chat de Compras",
        });
    });


    // Control de endpoints no encontrados
    app.all("*", (req, res, next) => {
        const message = errorsDictionary.PAGE_NOT_FOUND.message;
        req.logger.error({ status: "ERR", code: "404", message });
        res.status(404).send({ status: "ERR", data: message });
    });
} catch (err) {
    console.error("Error al inicializar el servidor");
}
