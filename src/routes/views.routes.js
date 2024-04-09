import { Router } from "express";
import handlebars from 'handlebars';

import { authToken, handlePolicies } from '../utils.js'
import ProductManager from '../dao/product.controller.js';
import CartManager from '../dao/cart.controller.js';
import { UserController } from '../dao/user.controller.js';

const router = Router();

const productManager = new ProductManager();
const cartManager = new CartManager();
const userController = new UserController();


// Vista de la página principal con todos los productos
router.get('/products', authToken, async (req, res) => {
    try {
        const page = req.query.page || 10;
        res.render('home', {user: req.user, page});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "Error", payload: err.message});
    }
    
});

//Vista de un producto individual
router.get('/products/:pid', authToken, async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);
        res.render('product', { product, user: req.user});
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "Error", payload: err.message})
    }
})

// Vista de un carrito
router.get('/carts/:cid', authToken, async (req, res) => {
    // Vista de los productos de un carrito
    const cartId = req.params.cid;
    const result = await cartManager.getCartById(cartId);

    res.render('cart', { products: result.products, total: result.total});
})

// Vista de administración de usuarios
router.get('/users', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const data = await userController.getUsersPaginated(req.query.page || 1, req.query.limit || 50)
        data.pages = []
        for (let i = 1; i <= data.totalPages; i++) data.pages.push(i)

        handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });

        res.render('users', {
            title: 'Administración de Usuarios',
            data: data
        })
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "Error", payload: err.message})
    }
    
})

// Vista de Login
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

// Vista de Registro
router.get('/register', async (req, res) => {
    res.render('register', {})
})

// Vista para enviar email de restauración
router.get('/send-restore-email', async (req, res) => {
    res.render('send-restore-email', { msg: req.query.msg || null })
})

// Vista de email de restauración enviado
router.get('/restore-email-sent', async (req, res) => {
    res.render('restore-email-sent', { msg: req.query.msg || null })
})

// Vista de restauración de contraseña
router.get('/restore', async (req, res) => {
    const token = req.query.token
    res.render('restore', { token, msg: req.query.msg || null })
})

// Vista de perfil
router.get('/profilejwt', authToken, async (req, res) => {
    try {
        res.render('profile', { user: req.user });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "Error", payload: err.message});
    }
})

// Vista para mockear Usuarios
router.get("/mockingUsers", async (req, res) => {
    try {
        const users = userController.generateMockUsers(100);
        res.status(200).send({ status: "OK", data: users });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: "ERR", data: err.message });
    }
});

// Vista para testear el logger
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
