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

// Dejamos esta ruta como PRIVADA, solo los usuarios admin pueden verla
router.get('/users', authToken, handlePolicies(['admin']), async (req, res) => {

        const data = await userController.getUsersPaginated(req.query.page || 1, req.query.limit || 50)
        data.pages = []
        for (let i = 1; i <= data.totalPages; i++) data.pages.push(i)

        res.render('users', {
            title: 'Listado de USUARIOS',
            data: data
        })
})

router.get('/login', async (req, res) => {
    // Si el usuario tiene sesión activa, no volvemos a mostrar el login,
    // directamente redireccionamos al perfil.
    if (req.session.user) {
        res.redirect('/profile')
    } else {
        res.render('login', { msg: req.query.msg || null })
    }
})

router.get('/profile', async (req, res) => {
    // Si el usuario tiene sesión activa, mostramos su perfil
    if (req.session.user) {
        const userInDB = await userController.getUserByEmail(req.session.user.username);
        res.render('profile', { user: userInDB });
    } else {
        // sino volvemos al login
        res.redirect('/login')
    }
})

router.get('/register', async (req, res) => {
    res.render('register', {})
})

router.get('/profilejwt', authToken, async (req, res) => {
    res.render('profile', { user: req.user })
})

router.get("/mockingproducts", async (req, res) => {
    try {
        const users = userController.generateMockUsers(100);
        res.status(200).send({ status: "OK", data: users });
    } catch (err) {
        res.status(500).send({ status: "ERR", data: err.message });
    }
});


export default router;
