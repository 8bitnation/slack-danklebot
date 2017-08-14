import {randomBytes} from 'crypto';

export async function token(size) {
    return new Promise((resolve, reject) => {
        randomBytes(size || 48, (err, buf) => {
            if(err) reject(err);
            resolve(buf);
        })
    });
}

export async function urlSafeToken(size) {

    const t = await token(size);
    return t.toString('base64').
                replace(/\+/g, '-').
                replace(/\//g, '_').
                replace(/=+$/, '');

}