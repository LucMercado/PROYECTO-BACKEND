import productModel from '../models/product.model.js';

export default class ProductController {
    constructor() {
    }

    async addProduct(product) {

        try {
            await productModel.create(product);
            return "Producto agregado";

        } catch (err) {
            return err.message;
        }
    }

    async getProducts() {

        try {
            //lean brinda el resultado en formato limpio js nativo
            const products = await productModel.find().lean()
            if (products.length === 0) {
                return { status: "Not Found", data: "No existen productos cargados" } 
            } else {
                return { status: "OK", data: products }
            }
        } catch (err) {
            return err.message;
        }

    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id);
            return product === null ? "No se encontró el producto" : product;
        } catch (err) {
            return err.message;
        }

    }

    async updateProduct(id, newContent) {
        try {
            const procedure = await productModel.findByIdAndUpdate(id, newContent)
            return procedure
        } catch (err) {
            return err.message
        }

    }

    async deleteProduct(id) {
        try {
            const procedure = await productModel.findByIdAndDelete(id)
            return procedure
        } catch (err) {
            return err.message
        }
    }
}