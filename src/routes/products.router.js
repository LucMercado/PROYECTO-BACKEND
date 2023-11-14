import { Router } from 'express'
import ProductManager from '../ProductManager.js'

const router = Router()
const productManager = new ProductManager('./products.json')

router.get('/', async (req, res) => {
    const products = await productManager.getProducts()
    const limit = req.query.limit
    if (limit) {
        const productsLimit = products.slice(0, limit)
        res.status(200).send({products: productsLimit})
    } else {
        res.status(200).send({products: products})
    }
    
})

router.get('/:pid', async (req, res) => {
    const productId = Number.parseInt(req.params.pid)

    const productFound = await productManager.getProductById(productId)

    if (productFound) {
        res.status(200).send(productFound)
    } else {
        res.status(404).send(`No se ha encontrado ningún producto con el ID: ${req.params.pid}`)
    }
    
})

router.post('/', async (req, res) => {
    const newContent = req.body

    await productManager.addProduct(newContent)

    res.status(200).send({data:newContent})

})

router.put('/:pid', async (req, res) => {
    const newContent = req.body
    const pid = Number.parseInt(req.params.pid)


    await productManager.updateProduct(pid, newContent)

    res.status(200).send("Producto actualizado")
})

router.delete('/:pid', async (req, res) => {
    const pid = Number.parseInt(req.params.pid)

    await productManager.deleteProduct(pid)

    res.status(200).send("Producto eliminado")
})


export default router
