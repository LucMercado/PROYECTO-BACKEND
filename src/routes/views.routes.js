import { Router } from "express";
import ProductManager from '../dao/ProductControllerMDB.js';
import CartManager from '../dao/CartControllerMDB.js';
import { UserController } from '../dao/user.controller.mdb.js';

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
router.get('/users', async (req, res) => {
    // Si hay un usuario logueado y es admin
    if (req.session.user && req.session.user.admin === true) {
        const data = await userController.getUsersPaginated(req.query.page || 1, req.query.limit || 50)
        
        // Handlebars tiene algunas limitaciones al momento de evaluar expresiones.
        // Si queremos un listado completo de enlaces de página, armamos directamente un array
        // para recorrer y tener el número de página en cada caso (ver opción 1 paginado en plantilla)
        data.pages = []
        for (let i = 1; i <= data.totalPages; i++) data.pages.push(i)

        res.render('users', {
            title: 'Listado de USUARIOS',
            data: data
        })
    } else if (req.session.user) {
        // Si hay un usuario logueado pero no es admin
        res.redirect('/profile')
    } else {
        // caso contrario volvemos al login
        res.redirect('/login')
    }
})

router.get('/login', async (req, res) => {
    // Si el usuario tiene sesión activa, no volvemos a mostrar el login,
    // directamente redireccionamos al perfil.
    if (req.session.user) {
        res.redirect('/profile')
    } else {
        res.render('login', {})
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


export default router;
