import fs from "fs";

export default class CartManager {
    static contadorCarritos = 0;

    constructor(path) {
        this.carts = [];
        this.path = path;
    }

    async addCart() {
        
        const id = ++CartManager.contadorCarritos;
        const cart = {id, products: []}

        const carts = await fs.promises.readFile(this.path, {
            encoding: "utf-8",
        })

        if(!carts) {
            cart.id = 1
            this.carts.push(cart)

            const jsonData = JSON.stringify(this.carts);

            await fs.promises.writeFile(this.path, jsonData);
        } else {
            const cartsParse = JSON.parse(carts)

            cart.id = cartsParse[cartsParse.length-1].id + 1
            cartsParse.push(cart)

            const jsonCarts = JSON.stringify(cartsParse)
            await fs.promises.writeFile(this.path, jsonCarts);
        }
        

        console.log("Carrito creado");
    }


    async getCarts() {
        const carts = await fs.promises.readFile(this.path, {
            encoding: "utf-8",
        });
        const cartsParse = JSON.parse(carts);
        return cartsParse;
    }

    async addProductToCart(cid, pid) {
        const carts = await fs.promises.readFile(this.path, {
            encoding: "utf-8",
        });
        const cartsParse = JSON.parse(carts)
        
        const cartFound = cartsParse.find((c) => c.id === cid);
        if (cartFound) {
            const indexCart = cartsParse.findIndex((c) => c.id === cid)
            const productFound = cartFound.products.find((p) => p.product === pid)
            if (productFound) {
                const indexProduct = cartFound.products.findIndex((p) => p.product === pid);

                cartsParse[indexCart].products[indexProduct] = { ...productFound, quantity: productFound.quantity + 1 };
            } else {
                cartsParse[indexCart].products.push({product: pid, quantity: 1})
            }
        } else {
            return console.error("No se encontro ningun carrito con ese ID");
        }

        const cartJSON = JSON.stringify(cartsParse)
        await fs.promises.writeFile(this.path, cartJSON);

    }

    async getCartById(id) {
        const carts = await fs.promises.readFile(this.path, {
            encoding: "utf-8",
        });
        const cartsParse = JSON.parse(carts);
        const cartFound = cartsParse.find((c) => c.id === id);
        if (cartFound) {
            return cartFound;
        } else {
            return console.error("No se encontro ningun carrito con ese ID");
        }
    }

}

// const manager = new CartManager('./carts.json')

// await manager.addCart()
// await manager.addCart()

// await manager.addProductToCart(1,1)
// await manager.addProductToCart(1,1)

// console.log(await manager.getCartById(1))