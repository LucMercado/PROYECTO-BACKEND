import CartService from "../services/cart.services.js";

const cartService = new CartService;

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
        return await cartService.addProductToCartService(cid, pid, quantity);
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

    async processPurchase(cid, products) {
        return await cartService.processPurchaseService(cid);
    }

}