import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cors from 'cors';

import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import usersRouter from './routes/users.routes.js';
import sessionsRouter from './routes/session.routes.js';
import cookiesRouter from './routes/cookies.routes.js';
import viewsRouter from './routes/views.routes.js';
import { __dirname } from './utils.js';
import MongoSingleton from './services/mongo.singleton.js'

import config from './config.js'
import errorsDictionary from './services/errors.dictionary.js';

import MessageController from './dao/message.controller.js';

const messageManager = new MessageController();

const PORT = config.PORT;
const MONGOOSE_URL = config.MONGOOSE_URL

try {
    await MongoSingleton.getInstance();
    // await mongoose.connect(MONGOOSE_URL)

    const app = express();
    // Asignamos a httpServer la instancia de Express para poder luego pasarlo al server de socket.io
    const httpServer = app.listen(PORT, () => {
        console.log(
            `Servidor EXPRESS activo en puerto ${PORT}, conectado a base de datos`
        );
        process.on('uncaughtException', exception => {
            /* console.error(`ERROR!: ${exception.stack}`); */
            console.error(exception.name);
            console.error(exception.message);
        });
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
        socket.on('message', async data => {
            messages.push(data)
            io.emit('messagesLogs', messages)
            const result = await messageManager.addMessage(data)
            console.log(result)
        })

    });

    app.use(cors({
        origin: '*', // http://127.0.0.1:5500
        methods: 'GET,POST,PUT,PATCH,DELETE'
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser('cookieHYM'))
    
    app.use(session({
        store: MongoStore.create({ mongoUrl: MONGOOSE_URL, mongoOptions: {}, ttl: 60, clearInterval: 5000 }), // MONGODB
        secret: 'cookieHYM',
        resave: false,
        saveUninitialized: false
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    // Configuración para uso de motor de plantillas Handlebars
    app.engine("handlebars", handlebars.engine());
    app.set("views", `${__dirname}/views`);
    app.set("view engine", "handlebars");

    // Guardo la instancia de Socket.IO en la aplicación de Express
    app.set("socketio", io);

    //Endpoints productos
    app.use('/api/products', productsRouter);
    //Endpoints carritos
    app.use('/api/carts', cartsRouter);
    //Endpoints usuarios
    app.use('/api/users', usersRouter);
    //Endpoints sesiones
    app.use('/api/sessions', sessionsRouter);
    //Endpoints cookies
    app.use('/api/cookies', cookiesRouter);
    //Endpoints views
    app.use('/', viewsRouter);
    // Servicio de contenidos estáticos
    app.use('/static', express.static(`${__dirname}/public`));

    //Middleware captura general de errores

    app.use((err, req, res, next) => {
        const code = err.code || 500;
        const message = err.message || 'Hubo un problema, error desconocido';
        
        return res.status(code).send({
            status: 'ERR',
            data: message,
            // Habilitar si se quiere más info del error en modo development
            // stack: config.MODE === 'devel' ? err.stack : {}
        });
    });

    app.all('*', (req, res, next)=>{
        res.status(404).send({ status: 'ERR', data: errorsDictionary.PAGE_NOT_FOUND.message });
    });


} catch (err) {
    console.error("Error al inicializar el servidor");
}
