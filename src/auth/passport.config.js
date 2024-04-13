/**
 * passport.local siempre requiere 2 cosas: username y password
 *
 * podemos usar el parámetro usernameField para cambiar el nombre del campo que
 * manejaremos como usuario (email en nuestro caso)
 *
 * passport utiliza un callback done():
 *  - parámetro 1: el error (null indica que no hay error)
 *  - parámetro 2: el objeto con datos de usuario que se devuelve en la respuesta
 *      - done(null, user) -> user tendrá los datos de usuario
 *      - done(null, false) -> no hay error pero los datos de usuario no se devuelven
 *
 * passport.use() nos permite configurar distintas estrategias
 */

import passport from "passport";
import LocalStrategy from "passport-local";
import GithubStrategy from "passport-github2";
import jwt from "passport-jwt";


import userModel from "../dao/models/user.model.js";
import CartManager from "../dao/cart.controller.js";
import { createHash, isValidPassword } from "../utils.js";
import { sendWelcomeEmail } from "../email-utils.js";

import config from "../config.js";

const cartManager = new CartManager();

const initPassport = () => {
    // Función utilizada por la estrategia loginAuth
    const verifyLogin = async (req, username, password, done) => {
        try {
            const userInDb = await userModel.findOne({ email: username });

            if (userInDb !== null && isValidPassword(userInDb, password)) {
                const { password, ...user } = userInDb._doc;
                userInDb.lastConnection = new Date();
                if (user) return done(null, user);
            }

            done(null, false);
        } catch (err) {
            return done(`Error passport login: ${err.message}`);
        }
    };

    // Función utilizada por la estrategia registerAuth
    const verifyRegistration = async (req, username, password, done) => {
        try {
            const { first_name, last_name, email, age } = req.body;

            if (!first_name || !last_name || !email || !age) {
                return done(
                    "Se requiere first_name, last_name, email y age en el body",
                    false
                );
            }
            const user = await userModel.findOne({ email: username });

            // El usuario ya existe, llamamos a done() para terminar el proceso de
            // passport, con null (no hay error) y false (sin devolver datos de usuario)
            if (user) return done(null, false);

            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: await cartManager.addCart()
            };

            console.log(newUser)

            const process = await userModel.create(newUser);

            sendWelcomeEmail(newUser.email, newUser.first_name);

            return done(null, process);
        } catch (err) {
            return done(`Error passport local: ${err.message}`);
        }
    };

    const verifyGithub = async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await userModel.findOne({ email: profile._json.email });

            if (!user) {
                const name_parts = profile._json.name.split(" ");
                const newUser = {
                    first_name: name_parts[0],
                    last_name: name_parts[1],
                    email: profile._json.email,
                    age: 1,
                    password: " ",
                    cart: await cartManager.addCart()
                };

                const process = await userModel.create(newUser);

                return done(null, process);
            } else {
                done(null, user);
            }
        } catch (err) {
            return done(`Error passport Github: ${err.message}`);
        }
    };

    const verifyJwt = async (payload, done) => {
        try {
            return done(null, payload);
        } catch (err) {
            return done(err);
        }
    };

    const cookieExtractor = (req) => {
        let token = null;
        if (req && req.cookies) token = req.cookies["tokenHYM"];
        return token;
    };

    // Creamos estrategia local de autenticación para login
    passport.use(
        "loginAuth",
        new LocalStrategy(
            {
                passReqToCallback: true,
                usernameField: "email",
                passwordField: "pass",
            },
            verifyLogin
        )
    );

    // Creamos estrategia para autenticación externa con Github
    passport.use(
        "githubAuth",
        new GithubStrategy(
            {
                clientID: config.GITHUB_AUTH.clientId,
                clientSecret: config.GITHUB_AUTH.clientSecret,
                callbackURL: config.GITHUB_AUTH.callbackUrl,
            },
            verifyGithub
        )
    );

    // Creamos estrategia local de autenticación para registro
    passport.use(
        "registerAuth",
        new LocalStrategy(
            {
                passReqToCallback: true,
                usernameField: "email",
                passwordField: "pass",
            },
            verifyRegistration
        )
    );

    passport.use(
        "jwtAuth",
        new jwt.Strategy(
            {
                jwtFromRequest: jwt.ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: config.SECRET_KEY,
            },
            verifyJwt
        )
    );

    // Métodos "helpers" de passport para manejo de datos de sesión
    // Son de uso interno de passport, normalmente no tendremos necesidad de tocarlos.
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            done(null, await userModel.findById(id));
        } catch (err) {
            done(err.message);
        }
    });
};

export default initPassport;
