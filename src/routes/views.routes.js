import { authToken, handlePolicies } from '../utils.js'

import { Router } from "express";
import ProductManager from '../dao/product.controller.js';
import CartManager from '../dao/cart.controller.js';
import { UserController } from '../dao/user.controller.js';

const router = Router();

const productManager = new ProductManager();
const cartManager = new CartManager();
const userController = new UserController();


router.get('/products', async (req, res) => {
    //Vista de la lista productos
    try {
        let limit = parseInt(req.query.limit) || 10;
        let page = parseInt(req.query.page) || 1;
        
        const result = await productManager.getProducts(page, limit);

        res.render('home', {products: result.docs})
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
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
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "Error", payload: err.message})
    }
})

router.get('/carts/:cid', authToken, async (req, res) => {
    // Vista de los productos de un carrito
    const cartId = req.params.cid;
    const result = await cartManager.getCartById(cartId);

    res.render('cart', { products: result.products });
})

router.get('/realtimeproducts', async (req, res) => {
    const result = await productManager.getProducts();

    res.render('realtimeproducts', { products: result.data });
});

// Dejamos esta ruta como PRIVADA, solo los usuarios admin pueden verla
router.get('/users', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const data = await userController.getUsersPaginated(req.query.page || 1, req.query.limit || 50)
        data.pages = []
        for (let i = 1; i <= data.totalPages; i++) data.pages.push(i)

        res.render('users', {
            title: 'Listado de USUARIOS',
            data: data
        })
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "Error", payload: err.message})
    }
    
})

router.get('/login', async (req, res) => {
    // Si el usuario tiene sesión activa, no volvemos a mostrar el login,
    // directamente redireccionamos al perfil.
    const cookieToken = req.cookies && req.cookies['tokenHYM'] ? req.cookies['tokenHYM']: undefined;
    
    if (cookieToken) {
        res.redirect('/profilejwt')
    } else {
        res.render('login', { msg: req.query.msg || null })
    }
})

router.get('/register', async (req, res) => {
    res.render('register', {})
})

router.get('/send-restore-email', async (req, res) => {
    res.render('send-restore-email', { msg: req.query.msg || null })
})

router.get('/restore-email-sent', async (req, res) => {
    res.render('restore-email-sent', { msg: req.query.msg || null })
})

router.get('/restore', async (req, res) => {
    const token = req.query.token
    res.render('restore', { token, msg: req.query.msg || null })
})

router.get('/profilejwt', authToken, async (req, res) => {
    try {
        res.render('profile', { user: req.user });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "Error", payload: err.message});
    }
})

router.get("/mockingUsers", async (req, res) => {
    try {
        const users = userController.generateMockUsers(100);
        res.status(200).send({ status: "OK", data: users });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "ERR", data: err.message });
    }
});

router.get('/loggerTest', async (req, res) => {
    req.logger.fatal('Error fatal');
    req.logger.error('Error');
    req.logger.warning('Warning');
    req.logger.info('Info');
    req.logger.http('Http');
    req.logger.debug('Debug');

    res.send({status: "OK"});
    
})


export default router;
