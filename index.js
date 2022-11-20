import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

import { pythonScriptExecution, Instagram } from './lib/index.js';

const DIR = path.resolve(`${process.env.TEMP_DIRECTORY}`)

function main() {
    const instagram = new Instagram(DIR);
    return (async () => await instagram.main())();
}

pythonScriptExecution('./lib/PythonScripts/main.py', main, [process.env.YT_API_KEY, DIR]);
