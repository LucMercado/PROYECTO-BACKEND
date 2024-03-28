import { Router } from 'express';
import CartManager from '../dao/cart.controller.js';
import { passportCall, authToken, handlePolicies } from '../utils.js';
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

router.post('/:cid/product/:pid', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        res.status(200).send({status: "Succes", data: await cartManager.addProductToCart(cartId, productId, 1)});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.patch('/:cid/product/:pid', authToken, handlePolicies(['admin']), async (req, res) => {
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

router.put('/:cid', authToken, handlePolicies(['admin']), async (req, res) => {
    try{
        const cartId = req.params.cid;
        const updatedProducts = req.body;

        res.status(200).send({status: "Succes", data: await cartManager.updateAllProducts(cartId, updatedProducts)});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.delete('/:cid/product/:pid', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        res.status(200).send({status: "Succes", data: await cartManager.deleteOneProductToCart(cartId, productId)});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.delete('/:cid', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const cartId = req.params.cid;

        res.status(200).send({status: "Succes", data: await cartManager.deleteAllProductsToCart(cartId)});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({status: "Error", data: err.message});
    }
})

router.post('/:cid/purchase', passportCall('jwtAuth', { session: false }), async (req, res)=> {
    try {
        const cartId = req.params.cid;
        const email = req.user.email;

        res.status(200).send({status: "Succes", data: await cartManager.processPurchase(cartId, email)});
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