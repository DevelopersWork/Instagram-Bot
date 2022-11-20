import { spawn } from 'child_process';

import _Instagram from './Instagram/index.js';

export const Instagram = _Instagram;

export function pythonScriptExecution(script, callback = null, params = []) {

    const pipe = spawn(`${process.env.PYTHON}`, [script, ...params], {
        encoding: 'utf8',
        stdio: ['inherit', 'inherit', 'inherit']
    });

    // in close event we are sure that stream from child process is closed
    pipe.on('close', () => {
        callback();
    });
}
