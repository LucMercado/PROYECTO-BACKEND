import productModel from '../dao/models/product.model.js';
import userModel from '../dao/models/user.model.js';
import { sendDeleteProductEmail } from '../email-utils.js';

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
            const product = await productModel.findById(id)
            const owner = await userModel.findById(product.owner)
            if (owner.role === 'premium') {
                sendDeleteProductEmail(owner.email, product.title)
            }
            const procedure = await productModel.findByIdAndDelete(id)
            return procedure
        } catch (err) {
            return err.message
        }
    }
}