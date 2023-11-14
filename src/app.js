import express from 'express'
import productsRouter from './routes/products.router.js'
import cartsRouter from './routes/carts.router.js'

const PORT = 8080
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.get('/', (req, res) => {
    res.status(200).send("Servidor OK")
})

app.listen(PORT, () => {
    console.log(`Servidor EXPRESS activo en puerto ${PORT}`)
})