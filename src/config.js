import dotenv from 'dotenv';
import { Command } from 'commander';

const commandLineOptions = new Command();
commandLineOptions
    .option('--mode <mode>')
    .option('--port <port>');
commandLineOptions.parse();

dotenv.config();

const config = {
    PORT: commandLineOptions.opts().port || 8080,
    MONGOOSE_URL: process.env.MONGOOSE_URL_REMOTE,
    SECRET_KEY: process.env.SECRET_KEY,
    UPLOAD_DIR: 'public/img',
    GITHUB_AUTH: {
        clientId: process.env.GITHUB_AUTH_CLIENT_ID,
        clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        // Atención!: si bien podemos rearmar la url de callback acá con el puerto que deseemos,
        // debemos estar atentos a actualizarla también en la config de la app que hemos activado en Github
        callbackUrl: `http://localhost:${commandLineOptions.opts().port || 3000}/api/auth/githubcallback`
    },
};

export default config;