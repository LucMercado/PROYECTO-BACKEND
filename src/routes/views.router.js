import { Router } from "express";
import ProductManager from '../dao/ProductControllerMDB.js';
import CartManager from '../dao/CartControllerMDB.js';

const router = Router();

const productManager = new ProductManager();
const cartManager = new CartManager();


router.get('/products', async (req, res) => {
    //Vista de la lista productos
    try {
        let limit = parseInt(req.query.limit) || 10;
        let page = parseInt(req.query.page) || 1;
        
        const result = await productManager.getProducts(page, limit);

        res.render('home', {products: result.docs})
    } catch (err) {
        res.status(500).send({ status: "Error", payload: err.message})
    }
    
});

router.get('/products/:pid', async (req, res) => {
    //Vista de un producto individual
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId)
        res.render('product', { product })
    } catch (err) {
        res.status(500).send({ status: "Error", payload: err.message})
    }
})

router.get('/carts/:cid', async (req, res) => {
    // Vista de los productos de un carrito
    const cartId = req.params.cid;
    const result = await cartManager.getCartById(cartId);
    console.log(result.products)

    res.render('cart', { products: result.products });

})

router.get('/realtimeproducts', async (req, res) => {
    const result = await productManager.getProducts();

    res.render('realtimeproducts', { products: result.data });
});

router.get('/chat', async (req, res) => {
    res.render('chat', {
        title: 'Chat de Compras'
    })
})

export default router;
