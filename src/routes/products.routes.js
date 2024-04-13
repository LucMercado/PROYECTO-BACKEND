import { Router } from "express";
import { ProductController } from "../dao/product.controller.js";
import { uploader } from '../uploader.js'
import CustomError from "../services/error.custom.class.js";
import errorsDictionary from "../services/errors.dictionary.js";
import { authToken, handlePolicies, allowModifiedProduct } from "../utils.js";


const router = Router();
const productManager = new ProductController();

router.get('/', async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 10;
        let page = parseInt(req.query.page) || 1;

        const result = await productManager.getProducts(page, limit);

        res.status(200).send({ status: "Succes", payload: result });
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: "Error", payload: err.message })
    }


});

router.get('/:pid', async (req, res) => {
    try {
        const productFound = await productManager.getProductById(req.params.pid);

        if (productFound) {
            res.status(200).send(productFound);
        } else {
            const message = `No se ha encontrado ningún producto con el ID: ${req.params.pid}`
            req.logger.error({ status: 'ERR', code: '404', message });
            res.status(404).send(message);
        }

    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: "Error", payload: err.message })
    }
});

router.post('/', authToken, handlePolicies(['admin', 'premium']), uploader.single('thumbnail'), async (req, res) => {
    try {
        if (!req.file) {
            req.logger.error({ status: 'FIL', code: '400', message: 'No se pudo subir el archivo' });
            return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });
        }
        //Desestructuración del body para validar contenido
        const { title, description, price, code, stock, status, category } = req.body;
        if (!title || !price || !code || !stock || !status || !category) {
            req.logger.error({ status: 'ERR', code: '400', message: 'Faltan campos obligatorios' });
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
            stock,
            owner: req.user._id
        };
        const result = await productManager.addProduct(newContent);

        res.status(200).send({ data: result });
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: "Error", payload: err.message })
    }
});

router.put('/:pid', authToken, handlePolicies(['admin', 'premium']), allowModifiedProduct, async (req, res) => {
    try {
        const newContent = req.body;
        const pid = Number.parseInt(req.params.pid);

        const result = await productManager.updateProduct(pid, newContent);

        res.status(200).send(result);
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: "Error", payload: err.message })
    }
});

router.delete('/:pid', authToken, handlePolicies(['admin', 'premium']), allowModifiedProduct, async (req, res) => {
    try {
        const productId = Number.parseInt(req.params.pid);

        await productManager.deleteProduct(productId);

        res.status(200).send("Producto eliminado");
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: "Error", payload: err.message })
    }
});

router.param('pid', async (req, res, next, pid) => {
    const regex = new RegExp(/^[a-fA-F0-9]{24}$/)
    if (regex.test(req.params.pid)) {
        next();
    } else {
        req.logger.error({ status: 'ERR', code: '404', message: 'Parámetro no válido' });
        return next(new CustomError(errorsDictionary.INVALID_MONGOID_FORMAT));
    }
})

export default router;
