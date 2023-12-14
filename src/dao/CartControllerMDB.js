import cartModel from './models/cart.model.js';

export default class CartManager {

    constructor(path) {
    }

    async addCart() {
        const cart = { products: [], total: 0}
        try {
            await cartModel.create(cart);
            return "Carrito agregado";

        } catch (err) {
            return err.message;
        }
    }


    async getCarts() {
        try {
            //lean brinda el resultado en formato limpio js nativo
            const carts = await cartModel.find().lean()
            if (carts.length === 0) {
                return { status: "Not Found", data: "No existen carritos cargados" } 
            } else {
                return { status: "OK", data: carts }
            }
        } catch (err) {
            return err.message;
        }
            
    }

    async addProductToCart(cid, pid) {

    }

    async getCartById(id) {

        try {
            const cart = await cartModel.findById(id);
            return cart === null ? "No se encontró el carrito" : cart;
        } catch (err) {
            return err.message;
        }
    }

}