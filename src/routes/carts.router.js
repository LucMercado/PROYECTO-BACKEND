import { Router } from 'express'
import CartManager from '../CartManager.js'

const router = Router()
const cartManager = new CartManager('./carts.json')

router.get('/:cid', async (req, res) => {
    const cartId = Number.parseInt(req.params.cid)
    const cartFound = await cartManager.getCartById(cartId)

    if (cartFound) {
        res.status(200).send(cartFound.products)
    } else {
        res.status(404).send(`No se ha encontrado ningún carrito con el ID: ${req.params.cid}`)
    }

})

router.post('/', async (req, res) => {
    await cartManager.addCart()

    res.status(200).send("Carrito creado")
})

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = Number.parseInt(req.params.cid)
    const productId = Number.parseInt(req.params.pid)

    await cartManager.addProductToCart(cartId, productId)

    res.status(200).send("Producto agregado")
})

export default router