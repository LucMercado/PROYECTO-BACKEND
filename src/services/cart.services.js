import cartModel from '../dao/models/cart.model.js';
import productModel from '../dao/models/product.model.js'

export default class CartService {

    constructor() {
    }

    async addCartService() {
        const cart = { products: [], total: 0}
        try {
            await cartModel.create(cart);
            return "Carrito agregado";

        } catch (err) {
            return err.message;
        }
    }


    async getCartsService() {
        try {
            //lean brinda el resultado en formato limpio js nativo
            const carts = await cartModel.find().populate({ path: 'products.product', model: productModel }).lean()
            return carts
        } catch (err) {
            return err.message;
        }
            
    }

    async addProductToCartService(cid, pid, quantity) {
        try {
            const cartFound = await cartModel.findById(cid);
            if(cartFound){
                const productIndex = cartFound.products.findIndex((p) => p.product.toString() === pid);
                if(productIndex !== -1){
                    cartFound.products[productIndex].quantity += quantity;
                    await cartFound.save();
                } else{
                    cartFound.products.push({product: pid, quantity: quantity});
                    await cartFound.save();
                }
            } else{
                return "No se encontro carrito con ese id"
            }

            return "Producto agregado al carrito"
        } catch (err) {
            return err.message
        }
    }

    async getCartByIdService(id) {

        try {
            const cart = await cartModel.findById(id).populate({ path: 'products.product', model: productModel }).lean();
            return cart;
        } catch (err) {
            return err.message;
        }
    }

    async updateAllProductsService(cid, updatedProducts) {
        try{
            const process = await cartModel.findByIdAndUpdate(cid, updatedProducts)
        } catch (err) {
            return err.message
        }
    }

    async deleteAllProductsToCartService(id) {
        try {
            const process = await cartModel.findByIdAndUpdate(
                id, 
                { $set: { products: [] } },
                { new: true } )
                return "Se han eliminado todos los productos del carrito"
        } catch (err) {
            return err.message;
        }
    }

    async deleteOneProductToCartService(cid, pid) {
        try {
            const process = await cartModel.findByIdAndUpdate(
                cid, 
                { $pull: { products: { product: pid } } },
                { new: true } )
                return "Producto eliminado del carrito"
        } catch (err) {
            return err.message;
        }
    }

}