import { Router } from "express";
import ProductManager from '../ProductManager.js'

const router = Router();

const productManager = new ProductManager('./products.json')

const products = await productManager.getProducts()

router.get("/", (req, res) => {
    res.render("home", { products })
});

router.get("/realtimeproducts", (req, res) => {
    res.render("realtimeproducts", { products });
});

export default router;
