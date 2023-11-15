import express from 'express'
import productsRouter from './routes/products.router.js'
import cartsRouter from './routes/carts.router.js'
import viewsRouter from './routes/views.router.js'
import {__dirname} from './utils.js'
import handlebars from 'express-handlebars'
import {Server} from 'socket.io'

const PORT = 8080
const app = express()
app.listen(PORT, () => {
    console.log(`Servidor EXPRESS activo en puerto ${PORT}`)
})

// const socketServer = new Server(httpServer)

// Configuración para uso de motor de plantillas Handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Endpoints productos
app.use('/api/products', productsRouter)
//Endpoints carritos
app.use('/api/carts', cartsRouter)
//Endpoints views
app.use('/api/', viewsRouter)
// Servicio de contenidos estáticos
app.use('/public', express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
    res.status(200).send("Servidor OK")
})

