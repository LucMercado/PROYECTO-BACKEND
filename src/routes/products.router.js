import { Router } from "express";
import ProductManager from "../dao/ProductControllerMDB.js";
import { uploader } from '../uploader.js'


const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 10;
        let page = parseInt(req.query.page) || 1;
        
        const result = await productManager.getProducts(page, limit);

        res.status(200).send({ status: "Succes", payload: result });
    } catch (err) {
        res.status(500).send({ status: "Error", payload: err.message})
    }


});

router.get("/:pid", async (req, res) => {
    const productFound = await productManager.getProductById(req.params.pid);

    if (productFound) {
        res.status(200).send(productFound);
    } else {
        res
            .status(404)
            .send(`No se ha encontrado ningún producto con el ID: ${req.params.pid}`);
    }
});

router.post("/", uploader.single('thumbnail'), async (req, res) => {
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });

    //Desestructuración del body para validar contenido
    const { title, description, price, code, stock, status, category } = req.body;
    if (!title || !description || !price || !code || !stock || !status || !category) {
        return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
    }
    const newContent = {
        title,
        description,
        price,
        // el obj req.file está disponible porque estamos utilizando Multer como middleware,
        // mediante el objeto uploader que estamos importando e inyectando.
        thumbnail: req.file.filename,
        code,
        status,
        category,
        stock
    };

    const result = await productManager.addProduct(newContent);

    //Emito el nuevo producto creado a traves de socket.io para actualizar lista en tiempo real
    if (req.app.get("socketio")) {
        req.app.get("socketio").emit('newProduct', newContent);
        console.log("Emitido");
    }

    res.status(200).send({ data: result });
});

router.put("/:pid", async (req, res) => {
    const newContent = req.body;
    const pid = Number.parseInt(req.params.pid);

    const result = await productManager.updateProduct(pid, newContent);

    res.status(200).send(result);
});

router.delete("/:pid", async (req, res) => {
    const productId = Number.parseInt(req.params.pid);

    await productManager.deleteProduct(productId);

    //Emito el evento producto eliminado a traves de socket.io para actualizar lista en tiempo real
    if (req.app.get("socketio")) {
        req.app.get("socketio").emit('deleteProduct', productId);
        console.log("Emitido")
    }

    res.status(200).send("Producto eliminado");
});

export default router;
