import * as url from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import nodemailer from 'nodemailer'

import CustomError from './services/error.custom.class.js'

import config from './config.js'
import errorsDictionary from './services/errors.dictionary.js'
import ProductManager from './dao/product.controller.js'

const productManager = new ProductManager();

// Este private key es para cifrar el token
const PRIVATE_KEY = config.SECRET_KEY

export const __filename = url.fileURLToPath(import.meta.url)

export const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export const generateToken = (user, duration) => jwt.sign( user, PRIVATE_KEY, { expiresIn: duration })

export const authToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1]: undefined;
    const cookieToken = req.cookies && req.cookies['tokenHYM'] ? req.cookies['tokenHYM']: undefined;
    const queryToken = req.query.access_token ? req.query.access_token: undefined;  
    const receivedToken = headerToken || cookieToken || queryToken
    
    if (!receivedToken) return next(new CustomError(errorsDictionary.UNAUTHORIZED_ERROR))

    jwt.verify(receivedToken, PRIVATE_KEY, (err, credentials) => {
        if (err) return next(new CustomError(errorsDictionary.UNAUTHORIZED_ERROR))
        req.user = credentials
        next()
    })
}

export const passportCall = (strategy, options) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, options, (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(401).send({ status: 'ERR', data: info.messages ? info.messages: info.toString() });
            req.user = user;
            next();
        })(req, res, next);
    }
}

export const handlePolicies = policies => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })

        // Normalizamos todo a mayúsculas para comparar efectivamente
        const userRole = req.user.role.toUpperCase();
        policies.forEach((policy, index) => policies[index] = policies[index].toUpperCase());

        if (policies.includes('PUBLIC')) return next();
        if (policies.includes(userRole)) return next();
        return next(new CustomError(errorsDictionary.FORBIDDEN_ERROR));
    }
}

export const allowModifiedProduct = async (req, res, next) => {
    if (!req.user) return res.status(401).send({ status: 'ERR', data: errorsDictionary.UNAUTHORIZED_ERROR })
    if (req.user.role === 'admin') return next();
    const product = await productManager.getProductById(req.params.pid); 
    if (req.user.role === 'premium' && req.user._id === product.owner) return next();
    return next(new CustomError(errorsDictionary.UNAUTHORIZED_ERROR));
}

export const checkProductOwner = async (req, res, next) => {
    if (!req.user) return res.status(401).send({ status: 'ERR', data: errorsDictionary.UNAUTHORIZED_ERROR })
    const product = await productManager.getProductById(req.params.pid);
    const ownerId = product.owner.toString();
    console.log(ownerId);
    if (req.user._id !== ownerId) return next();
    return next(new CustomError(errorsDictionary.PRODUCT_OF_OWNER));
}

export const mailerService = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GOOGLE_APP_EMAIL,
        pass: config.GOOGLE_APP_PASS
    }
});

// Enviar correo electrónico con el enlace de restablecimiento
export const sendRestoreEmail = (email, token) => {
    const restoreLink = `http://hymmateriales.up.railway.app/restore?token=${token}`;

    const transporter = mailerService;

    const mailOptions = {
        from: config.GOOGLE_APP_EMAIL,
        to: email,
        subject: 'Restablecimiento de contraseña - HYM MATERIALES',
        text: `Hola, para restablecer tu contraseña, haz clic en el siguiente enlace: ${restoreLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw new CustomError(error);
        } else {
            return 'Correo electrónico enviado:', info.response;
        }
    });
}

// Enviar correo electrónico compra realizada

export const sendPurchaseEmail = (email, products) => {
    const transporter = mailerService;

    const data = products.map((product) => {
        return `${product.product} x ${product.quantity} - $${product.price}`;
    });

    const total = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

    const mailOptions = {
        from: config.GOOGLE_APP_EMAIL,
        to: email,
        subject: 'Compra realizada - HYM MATERIALES',
        text: `Hola, has realizado una compra de los siguientes productos: \n${data.join('\n')} \n\nTotal: $${total} \n\nGracias por tu compra!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw new CustomError(error);
        } else {
            return 'Correo electrónico enviado:', info.response;
        }
    });
}