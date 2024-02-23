import { Router } from 'express';
import CartManager from '../dao/cart.controller.js';
import { passportCall } from '../utils.js';

const router = Router();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
    try {
        const result = await cartManager.getCarts();
        res.status(200).send({ status: 'Succes', data: result });
    } catch (err) {
        res.status(500).send({ status: 'Error', data: err.message });
    }
})

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const result = await cartManager.getCartById(cartId);

    if (result) {
        res.status(200).send({ status: "Succes", data: result });
    } else {
        res.status(404).send(`No se ha encontrado ningún carrito con el ID: ${req.params.cid}`);
    }

})

router.post('/', async (req, res) => {
    await cartManager.addCart();

    res.status(200).send("Carrito creado");
})

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        res.status(200).send({status: "Succes", data: await cartManager.addProductToCart(cartId, productId, 1)});
    } catch (err) {
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body || 1;

        res.status(200).send({status: "Succes", data: await cartManager.addProductToCart(cartId, productId, parseInt(quantity))});
    } catch (err) {
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.put('/:cid', async (req, res) => {
    try{
        const cartId = req.params.cid;
        const updatedProducts = req.body;

        res.status(200).send({status: "Succes", data: await cartManager.updateAllProducts(cartId, updatedProducts)});
    } catch (err) {
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        res.status(200).send({status: "Succes", data: await cartManager.deleteOneProductToCart(cartId, productId)});
    } catch (err) {
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;

        res.status(200).send({status: "Succes", data: await cartManager.deleteAllProductsToCart(cartId)});
    } catch (err) {
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.post('/:cid/purchase', passportCall('jwtAuth', { session: false }), async (req, res)=> {
    try {
        const cartId = req.params.cid;
        const email = req.user.email;

        res.status(200).send({status: "Succes", data: await cartManager.processPurchase(cartId, email)});
    } catch (err) {
        res.status(500).send({status: "Error", data: err.message});
    }
})

export default router