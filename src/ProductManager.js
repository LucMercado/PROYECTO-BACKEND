import fs from "fs"

export default class ProductManager {

    static contadorProductos = 0;

    constructor( path ) {
        this.products = []
        this.path = path
    }

    async addProduct(productFromBody) {
        const productModel = { 
            title: "", 
            description: "", 
            price: 0, 
            code: "", 
            status: true, 
            stock: 0, 
            category: "", 
            thumbnails: []
        }
        const product = {...productModel, ...productFromBody}

        const products = await fs.promises.readFile(this.path, {
            encoding: "utf-8",
        })        

        if(!products) {
            product.id = 1
            this.products.push(product)

            const jsonData = JSON.stringify(this.products)

            await fs.promises.writeFile(this.path, jsonData)
        } else {
            const productsParse = JSON.parse(products)

            product.id = productsParse[productsParse.length-1].id + 1
            productsParse.push(product)

            const jsonProducts = JSON.stringify(productsParse)
            await fs.promises.writeFile(this.path, jsonProducts)
        }

        console.log("Producto agregado")
        
    }
        

    async getProducts() {
        
        const products = await fs.promises.readFile(this.path, { encoding: "utf-8" })
        const productsParse = JSON.parse(products)
        return productsParse
    }

    async getProductById(id) {
        const products = await fs.promises.readFile(this.path, { encoding: "utf-8" })
        const productsParse = JSON.parse(products)
        const productFound = productsParse.find(p => p.id === id)
        if (productFound) {
            return productFound
        } else {
            return console.error("No se encontro producto con ese ID")
        }
        
    }

    async updateProduct(id, field){
        const products = await fs.promises.readFile(this.path, { encoding: "utf-8" })
        const productsParse = JSON.parse(products)

        const indexProductToUpdate = productsParse.findIndex(p => p.id === id)

        const productToUpdate = productsParse.find(p => p.id === id)

        if (indexProductToUpdate !== -1) {
            productsParse[indexProductToUpdate] = {...productToUpdate, ...field, id}
            const productsJSON = JSON.stringify(productsParse)
            fs.writeFileSync(this.path, productsJSON)
        } else {
            console.error("No se encontró producto con ese id.")
        }

        
        

    }

    async deleteProduct(id) {
        const products = await fs.promises.readFile(this.path, { encoding: "utf-8" })
        const productsParse = JSON.parse(products)

        const productsFiltered = productsParse.filter(p => p.id !== id)

        const productsJSON = JSON.stringify(productsFiltered)
        fs.writeFileSync(this.path, productsJSON)
    }

}

//Pruebas

// const manager = new ProductManager('./products.json')

// await manager.addProduct({ title:"Coca Cola Zero", description: "sin azucar", price: 600, category: "Gaseosas", code: "aAbBcC", stock: 45})
// await manager.addProduct({ title:"Coca Cola light", description: "poca azucar", price: 600, category: "Gaseosas", code: "aAbBcC2", stock: 45})


// setTimeout(() => {
    
//     console.log(manager.getProductById(2))
    
// }, 1000)

// setTimeout(() => {
    
//     manager.updateProduct(2, {title: "Fanta", description: "naranja"})
    
// }, 2000)



// setTimeout(() => {
    
//     console.log(manager.getProducts())
    
// }, 3000)

// setTimeout(() => {
//     manager.deleteProduct(2)
//     console.log(manager.getProducts())
    
// }, 4000)


