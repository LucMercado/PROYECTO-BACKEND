import cartModel from "../dao/models/cart.model.js";
import productModel from "../dao/models/product.model.js";
import { sendPurchaseEmail } from "../utils.js";

import TicketService from "./ticket.services.js";

const ticketManager = new TicketService();

export default class CartService {
    constructor() { }

    async addCartService() {
        const cart = { products: [], total: 0 };
        try {
            const newCart = await cartModel.create(cart);
            return newCart._id; // Devolver el ID del carrito creado
        } catch (err) {
            return err.message;
        }
    }

    async getCartsService() {
        try {
            //lean brinda el resultado en formato limpio js nativo
            const carts = await cartModel
                .find()
                .populate({ path: "products.product", model: productModel })
                .lean();
            return carts;
        } catch (err) {
            return err.message;
        }
    }

    async addProductToCartService(cid, pid, quantity, price) {
        try {
            const cartFound = await cartModel.findById(cid);
            if (cartFound) {
                const productIndex = cartFound.products.findIndex(
                    (p) => p.product.toString() === pid
                );
                if (productIndex !== -1) {
                    cartFound.products[productIndex].quantity += quantity;
                    cartFound.total += price * quantity;
                    await cartFound.save();

                } else {
                    cartFound.products.push({ product: pid, quantity: quantity });
                    cartFound.total += price * quantity;
                    await cartFound.save();
                }
            } else {
                return "No se encontro carrito o producto con ese id";
            }

            return "Producto agregado al carrito";
        } catch (err) {
            return err.message;
        }
    }

    async getCartByIdService(id) {
        try {
            const cart = await cartModel
                .findById(id)
                .populate({ path: "products.product", model: productModel })
                .lean();
            return cart;
        } catch (err) {
            return err.message;
        }
    }

    async updateAllProductsService(cid, updatedProducts) {
        try {
            const process = await cartModel.findByIdAndUpdate(cid, updatedProducts);
        } catch (err) {
            return err.message;
        }
    }    

    async deleteAllProductsToCartService(id) {
        try {
            const process = await cartModel.findByIdAndUpdate(
                id,
                { $set: { products: [], total: 0 } },
                { new: true }
            );

            return "Se han eliminado todos los productos del carrito";
        } catch (err) {
            return err.message;
        }
    }

    async deleteOneProductToCartService(cid, pid) {
        try {
            const cart = await cartModel.findById(cid).lean();

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            
            const quantity = cart.products.find((p) => p.product.toString() === pid).quantity;
            const product = await productModel.findById(pid).lean();
    
            const subtotal = quantity * product.price;
            const newTotal = cart.total - subtotal;
    
            const process = await cartModel.findByIdAndUpdate(
                cid,
                { 
                    $pull: { products: { product: pid } },
                    $set: { total: newTotal }
                },
                { new: true }
            );
    
            return "Producto eliminado del carrito y total actualizado";
        } catch (err) {
            return err.message;
        }
    }
    

    async processPurchaseService(cid, email) {
        try {
            const cart = await cartModel.findById(cid)
            const cartItems = cart.products;
            const outOfStock = [];
            const processedProducts = [];
            let total = 0;

            for (const item of cartItems) {
                const product = await productModel.findById(item.product._id);

                if (!product || product.stock < item.quantity) {
                    outOfStock.push(item);
                    continue;
                }


                processedProducts.push({ product: product.title, quantity: item.quantity, price: product.price });
                product.stock -= item.quantity;
                await product.save()
                total += product.price * item.quantity;
            }

            const ticket = await ticketManager.createTicketService(total, email);

            cart.products = outOfStock;
            cart.total = 0;
            await cart.save();

            if (outOfStock.length > 0){
                return { message: "Compra realizada incompleta, productos con insuficiente stock", products: outOfStock, ticket }
            }

            sendPurchaseEmail(email, processedProducts);

            return { message: "Compra realizada correctamente", ticket, products: processedProducts }
        } catch (err) {
            return err.message;
        }
    }
}