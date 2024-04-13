import nodemailer from 'nodemailer';
import config from './config.js';

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

// Enviar correo electrónico de eliminación de producto
export const sendDeleteProductEmail = (email, product) => {
    const transporter = mailerService;

    const mailOptions = {
        from: config.GOOGLE_APP_EMAIL,
        to: email,
        subject: 'Producto eliminado - HYM MATERIALES',
        text: `Hola, el producto ${product} ha sido eliminado de la tienda.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw new CustomError(error);
        } else {
            return 'Correo electrónico enviado:', info.response;
        }
    });
}

// Enviar correo electrónico de bienvenida
export const sendWelcomeEmail = (email, name) => { 
    const transporter = mailerService;

    const mailOptions = {
        from: config.GOOGLE_APP_EMAIL,
        to: email,
        subject: 'Bienvenido a HYM MATERIALES',
        text: `Hola ${name}, gracias por registrarte en HYM MATERIALES!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw new CustomError(error);
        } else {
            return 'Correo electrónico enviado:', info.response;
        }
    });
}