import winston from 'winston';
import { __dirname } from '../utils.js';
import config from '../config.js';

const customErrLevels = {
    levels: { fatal: 0, error: 1, warning: 2, info: 3, http: 4, debug: 5 },
    colors: { fatal: 'red', error: 'magenta', warning: 'yellow', info: 'blue', http: 'green', debug: 'white' }
};

const devLogger = winston.createLogger({
    levels: customErrLevels.levels,
    format: winston.format.combine(
        winston.format.colorize({ colors: customErrLevels.colors }),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({ level: 'debug' }),
        new winston.transports.File({ level: 'error', filename: `${__dirname}/logs/errors.log`})
    ]
});

const prodLogger = winston.createLogger({
    levels: customErrLevels.levels,
    format: winston.format.combine(
        winston.format.colorize({ colors: customErrLevels.colors }),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ level: 'error', filename: `${__dirname}/logs/errors.log`})
    ]
});

const addLogger = (req, res, next) => {
    req.logger = config.MODE === 'devel' ? devLogger : prodLogger;
    req.logger.http(`${new Date().toDateString()} ${req.method} ${req.url}`);
    next();
};

export default addLogger;
