import { Router } from 'express';
import CartManager from '../dao/cart.controller.js';
import { passportCall, authToken, handlePolicies, checkProductOwner } from '../utils.js';
import CustomError from "../services/error.custom.class.js";
import errorsDictionary from "../services/errors.dictionary.js";

const router = Router();
const cartManager = new CartManager();

router.get('/', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const result = await cartManager.getCarts();
        res.status(200).send({ status: 'Succes', data: result });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: 'Error', data: err.message });
    }
})

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const result = await cartManager.getCartById(cartId);

    if (result) {
        res.status(200).send({ status: "Succes", data: result });
    } else {
        const message = `No se ha encontrado ningún carrito con el ID: ${req.params.cid}`
        req.logger.error({status:'ERR', code:'404', message});
        res.status(404).send(message);
    }

})

router.post('/', authToken, handlePolicies(['admin']), async (req, res) => {
    await cartManager.addCart();

    res.status(200).send("Carrito creado");
})

router.post('/:cid/product/:pid', authToken, checkProductOwner, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const process = await cartManager.addProductToCart(cartId, productId, 1);
        res.status(200).redirect(`/cart`);
        req.logger.info({status:'OK', code:'200', message: process});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.patch('/:cid/product/:pid', authToken, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body || 1;

        res.status(200).send({status: "Succes", data: await cartManager.addProductToCart(cartId, productId, parseInt(quantity))});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.put('/:cid', authToken, async (req, res) => {
    try{
        const cartId = req.params.cid;
        const updatedProducts = req.body;

        res.status(200).send({status: "Succes", data: await cartManager.updateAllProducts(cartId, updatedProducts)});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.delete('/:cid/product/:pid', authToken, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const result = await cartManager.deleteOneProductToCart(cartId, productId);

        req.logger.info({status:'OK', code:'200', message: result});
        res.status(200).send({status: "Succes", data: result});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.delete('/:cid', authToken, async (req, res) => {
    try {
        const cartId = req.params.cid;
        
        const result = await cartManager.deleteAllProductsToCart(cartId)
        req.logger.info({status:'OK', code:'200', message: result});
        res.status(200).send({status: "Succes", data: result});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.post('/:cid/purchase', passportCall('jwtAuth', { session: false }), async (req, res)=> {
    try {
        const cartId = req.params.cid;
        const email = req.user.email;

        const result = await cartManager.processPurchase(cartId, email);

        req.logger.info({status:'OK', code:'200', message: result.message});
        res.status(200).send({status: "Succes", data: result});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
});

router.param("cid", async (req, res, next) => {
    const regex = new RegExp(/^[a-fA-F0-9]{24}$/);
    
    if (regex.test(req.params.cid)) {
        next();
    } else {
      return next(new CustomError(errorsDictionary.INVALID_MONGOID_FORMAT));
    }
});

export default router