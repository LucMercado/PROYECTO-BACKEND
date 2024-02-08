import productModel from '../dao/models/product.model.js';

export default class ProductService {
    constructor() {
    }

    async addProductService(product) {

        try {
            await productModel.create(product);
            return "Producto agregado";

        } catch (err) {
            return err.message;
        }
    }

    async getProductsService(page, limit) { 

        try {
            //lean brinda el resultado en formato limpio js nativo

            const result = await productModel.paginate(
                {},
                {offset:(page * limit) - limit, limit:limit, lean: true}
            )
                return result
        } catch (err) {
            return err.message;
        }

    }

    async getProductByIdService(id) {
        try {
            const product = await productModel.findById(id).lean();
            return product === null ? "No se encontró el producto" : product;
        } catch (err) {
            return err.message;
        }

    }

    async updateProductService(id, newContent) {
        try {
            const procedure = await productModel.findByIdAndUpdate(id, newContent)
            return procedure
        } catch (err) {
            return err.message
        }

    }

    async deleteProductService(id) {
        try {
            const procedure = await productModel.findByIdAndDelete(id)
            return procedure
        } catch (err) {
            return err.message
        }
    }
}