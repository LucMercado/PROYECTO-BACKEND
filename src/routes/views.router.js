import { Router } from "express";
import ProductManager from '../dao/ProductControllerMDB.js';

const router = Router();

const productManager = new ProductManager();


router.get("/", async (req, res) => {
    const result = await productManager.getProducts();
    res.render("home", { products: result.data });
});

router.get("/realtimeproducts", async (req, res) => {
    const result = await productManager.getProducts();
    res.render("realtimeproducts", { products: result.data });
});

export default router;
