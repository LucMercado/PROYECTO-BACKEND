import ProductService from "../services/product.services.js";

const productService = new ProductService;

class ProductDTO {
    constructor(product) {
        this.title = product.title;
        this.description = product.description;
        this.price = product.price;
        this.code  = product.code;
        this.status = product.status;
        this.stock = product.stock;
        this.category = product.category;
        this.thumbnail = product.thumbnail;
        this.owner = product.owner;
    }
}

export default class ProductController {
    constructor() {
    }

    async addProduct(product) {
        const normalizedProduct = new ProductDTO(product);
        return await productService.addProductService(normalizedProduct);
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