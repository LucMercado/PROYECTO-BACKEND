import ProductService from "../services/product.services";

const productService = new ProductService;

export default class ProductController {
    constructor() {
    }

    async addProduct(product) {
        return await productService.addProductService(product);
    }

    async getProducts(page, limit) { 
        return await productService.getProductsService(page, limit);
    }

    async getProductById(id) {
        return await productService.getProductByIdService(id);
    }

    async updateProduct(id, newContent) {
        return await productService.updateProductService(id, newContent);
    }

    async deleteProduct(id) {
        return await productService.updateProductService(id);
    }
}