import CartService from "../services/cart.services.js";
import CustomError from "../services/error.custom.class.js";
import errorsDictionary from "../services/errors.dictionary.js";
import { ProductController } from "./product.controller.js";

const cartService = new CartService;
const productManager = new ProductController;

export default class CartManager {

    constructor() {
    }

    async addCart() {
        return await cartService.addCartService();
    }


    async getCarts() {
        return await cartService.getCartsService();
    }

    async addProductToCart(cid, pid, quantity) {
        const stockData = await productManager.getProductById(pid);
        
        if (stockData === null) {
            throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND);
        } else {
            const stock = stockData.stock;
            if (stock < quantity) {
                throw new CustomError({ ...errorsDictionary.INSUFFICIENT_STOCK, moreInfo: `max: ${stock} unidades` });
            } else {
                return await cartService.addProductToCartService(cid, pid, quantity, stockData.price);
            }
        }
    }

    async getCartById(id) {
        return await cartService.getCartByIdService(id);
    }

    async updateAllProducts(cid, updatedProducts) {
        return await cartService.updateAllProductsService(cid, updatedProducts);
    }

    async deleteAllProductsToCart(id) {
        return await cartService.deleteAllProductsToCartService(id);
    }

    async deleteOneProductToCart(cid, pid) {
        return await cartService.deleteOneProductToCartService(cid, pid);
    }

    async processPurchase(cid, email) {
        return await cartService.processPurchaseService(cid, email);
    }

}