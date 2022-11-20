import fs from 'fs';
import readline from 'readline-sync';

class Login {
    constructor(dir, logger) {
        this.dir = dir.replace(/\/+$/, '') + "/Login/"
        fs.mkdirSync(this.dir, { recursive: true });

        this.logger = logger;

        this.browserTimeout = (process.env.DEFAULT_TIMEOUT || 30) * 1000

        this.logger.debug("Login.constructor():: {STARTED}");
    }

    main = async (page) => {

        this.logger.debug("Login.main():: {STARTED}");

        const is_logged_in = await this.isLoggedIn(page);

        if (!is_logged_in) {
            const username = process.env.INSTA_USERNAME || "";
            const password = process.env.INSTA_PASSWORD || "";
            await this.processLogin(page, username, password);

            const auth2FA = process.env.INSTA_2AUTH || false;
            if (auth2FA)
                await this.process2FA(page);
        }
    }

    async isLoggedIn(page) {

        this.logger.debug("Login.isLoggedIn():: {STARTED}");

        await page.goto('https://www.instagram.com/', { timeout: this.browserTimeout });
        await page.waitForSelector('[class="_aacl _aacn _aacu _aacy _aad6"]');

        await page.screenshot({ path: `${this.dir}isLoggedIn.png` });

        return await page.evaluate(async () => {
            return await new Promise(resolve => {
                const headerNavigation = document.querySelectorAll('div._acuq._acur');
                if (headerNavigation.length > 0)
                    return resolve(true);
                return resolve(false);
            });
        });
    }

    async processLogin(page, username, password) {

        this.logger.debug("Login.processLogin():: {STARTED}");

        await page.goto('https://www.instagram.com/accounts/login/', { timeout: this.browserTimeout });
        await page.waitForSelector('[name="username"]');
        await page.waitForSelector('[name="password"]');
        await page.waitForSelector('[type="submit"]');

        await page.screenshot({ path: `${this.dir}processLogin.png` });

        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ timeout: this.browserTimeout });
        await page.screenshot({ path: `${this.dir}processLogin.png` });
    }

    async process2FA(page) {

        this.logger.debug("Login.process2FA():: {STARTED}");

        await page.waitForSelector('[name="verificationCode"]', { timeout: this.browserTimeout });
        await page.waitForSelector('[type="button"]');
        await page.screenshot({ path: `${this.dir}process2FA.png` });

        const code = readline.question("Enter 2FA Code: ");
        await page.type('input[name="verificationCode"]', code);
        await page.click('button[type="button"]');

        await page.waitForNavigation({ timeout: this.browserTimeout });
        await page.screenshot({ path: `${this.dir}process2FA.png` });
    }

}

export default Login;