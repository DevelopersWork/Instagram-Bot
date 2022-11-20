import puppeteer from 'puppeteer';
import readline from 'readline-sync';
import fs from 'fs';

class InstagramUtils{

    constructor(dir){
        console.log("InstagramUtils:: {STARTED}")
        this.__DIR = dir
        this.timeout = (process.env.DEFAULT_TIMEOUT || 30) * 1000
    }

    auth = async () => {
        console.log("InstagramUtils.auth():: {STARTED}")
        try{
            const page = await getPageInstance();
            const username = process.env.INSTA_USERNAME;
            const password = process.env.INSTA_PASSWORD;
            
            await this.__login(page, username, password);
            
            await this.__verificationCode(page);
        }
        catch(error){
            throw error;
        }
    }

    upload = async () => {
        console.log("InstagramUtils.upload():: {STARTED}");
        let completed = []
        try{
            const page = await getPageInstance();
            const username = process.env.INSTA_USERNAME;

            const yt_videos_list = readJSON(this.__DIR + "/yt_videos_list.json")

            completed = readJSON(this.__DIR + "/db.json") || []

            for(let i in yt_videos_list){
                const video = yt_videos_list[i];

                if(completed.filter(videoId => video['id']['videoId'] === videoId).length) 
                    continue;

                await this.__open(page, username);
                await this.__uploadYTVideo(page, video);
                // break;

                completed.push(video['id']['videoId']);
            }
        }
        catch(error){
            throw error;
        } finally {
            writeJSON(this.__DIR + "/db.json", completed);
        }
    }

    following = async () => {
        console.log("InstagramUtils.following():: {STARTED}");
        try{
            const page = await getPageInstance();
            const username = process.env.INSTA_USERNAME;

            for(let x=0; x<5; x++){
                await this.__open(page, username);

                // Extract the FOLLOWING usernames
                const usernames = await this.__fetchFollowing(page);
                
                // for(const i in usernames){
                //     await this.__open(page, usernames[i]);
                //     await this.__unFollow(page, usernames[i]);
                // }

                await this.__unFollowAll(page, usernames);

                if(usernames.length == 0) break;
            }
            
        }
        catch(error){
            throw error;
        } finally {
            
        }
    }

    main = async () => {
        console.log("InstagramUtils.main():: {STARTED}")
        
        try{

            // await this.auth(page);

            await this.upload();

            // await this.following();

        } catch(error){
            throw error;
        }

        console.log("InstagramUtils.main():: {COMPLETED}")
    }

    __unFollowAll = async (page, usernames) => {
        console.log("InstagramUtils.__unFollowAll():: {STARTED}");

        for(let n=0; n<usernames.length; n++){
            // await page.waitForSelector('button[class="_acan _acap _acat"]');
            await page.evaluate(async () => {
                const following = document.querySelectorAll('button._acan._acap._acat');
                if(following.length > 0)
                    following[0].click();
            });
            await page.screenshot({path: `${this.__DIR}/screenshots/unFollowAll.png`});

            // await page.waitForSelector('button[class="_a9-- _a9-_"]');
            await page.evaluate(async () => {
                const unFollow = document.querySelectorAll('button._a9--._a9-_');
                if(unFollow.length > 0)
                    unFollow[0].click();
            });
            await page.screenshot({path: `${this.__DIR}/screenshots/unFollowAll.png`});
        }
    }

    __unFollow = async (page, username) => {
        console.log("InstagramUtils.__unFollow():: {STARTED}");

        const element = await page.$('[class="_aacl _aacs _aact _aacx _aada"]');
        const elementValue = await (await element.getProperty('textContent')).jsonValue()
        console.log("InstagramUtils.__unFollow():: " + elementValue);
        // if(elementValue != username) return null;

        await page.evaluate(async () => {
            const buttons = document.querySelectorAll('button._acan._acap._acat');
            if(buttons.length > 0){
                buttons[1].click();
            }
        });
        await page.waitForSelector('button[class="_a9-- _a9-_"]');
        await page.screenshot({path: `${this.__DIR}/screenshots/unFollow.png`});
        await page.evaluate(async () => {
            const buttons = document.querySelectorAll('button._a9--._a9-_');
            if(buttons.length > 0){
                buttons[0].click();
            }
        });
        
    }

    __fetchFollowing = async (page) => {
        const string = `InstagramUtils.__fetchFollowing(})::`;
        let usernames = [];

        console.log(`${string} {STARTED}`);
        await page.waitForSelector('a[href="/accounts/edit/"]', {timeout: this.timeout});
        await page.screenshot({path: `${this.__DIR}/screenshots/fetchFollowing.png`});
        await page.evaluate(async () => {
            const stats = document.querySelectorAll('div._aacl._aacp._aacu._aacx._aad6._aade');
            if(stats.length > 0){
                stats[2].click();
            }
        });

        await page.waitForSelector('div[class="x7r02ix xf1ldfh x131esax xdajt7p xxfnqb6 xb88tzc xw2csxc x1odjw0f x5fp0pe"]', {timeout: this.timeout});
        await page.waitForSelector('div[class=" _ab8y  _ab94 _ab97 _ab9f _ab9k _ab9p _abcm"]');
        await page.screenshot({path: `${this.__DIR}/screenshots/fetchFollowing.png`});
        
        usernames = await page.evaluate(async () => {
            return await new Promise(resolve => {
                const usernames = [];

                let followingBlock = document.querySelectorAll('div._aano');
                if(followingBlock.length > 0){
                    followingBlock = followingBlock[0].childNodes[0].childNodes[0].childNodes;
                    
                    followingBlock.forEach(following => {
                        const username = following.childNodes[1].childNodes[0].innerText;

                        usernames.push(username);
                    });
                }
    
                return resolve(usernames);
            })
        });

        return usernames;
    }

    __uploadYTVideo = async (page, video) => {
        const string = `InstagramUtils.__uploadYTVideo(${video['id']['videoId']})::`

        console.log(`${string} {STARTED}`);
        console.log(`${string} ${JSON.stringify(video)}`);
        
        await page.waitForSelector('a[href="/accounts/edit/"]', {timeout: this.timeout});
        await page.screenshot({path: `${this.__DIR}/screenshots/uploadYTVideo1.png`});
        await page.click("button[class='_abl- _abm2']");
        
        await page.waitForSelector('input[accept="image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"]');
        await page.screenshot({path: `${this.__DIR}/screenshots/uploadYTVideo2.png`});
        const inputUploadHandle = await page.$('input[accept="image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"]');
        let fileToUploadDir = `${this.__DIR}/videos`;
        let fileToUpload = "";
        const dirs = fs.readdirSync(fileToUploadDir);
        if(dirs.length > 0){
            fileToUploadDir = `${fileToUploadDir}/${dirs[0]}/${video['id']['videoId']}`;
            const files = fs.readdirSync(fileToUploadDir);
            if(files.length > 0){
                fileToUpload = fileToUploadDir + "/" + files[0]
            } else return null;
        } else return null;
        await inputUploadHandle.uploadFile(fileToUpload);
        
        await page.waitForSelector('button[class="_acan _acao _acas"]', {timeout: this.timeout});
        await page.screenshot({path: `${this.__DIR}/screenshots/uploadYTVideo3.png`});
        await page.evaluate(async () => {
            const svg_buttons = document.querySelectorAll('div._abfz._abg1');
            if(svg_buttons.length > 0){
                svg_buttons[0].childNodes[0].click();
            }
        });

        await page.evaluate(async () => {
            const sizes_window = document.querySelectorAll('div._ac36._ac38');
            if(sizes_window.length > 0){
                sizes_window[0].childNodes[0].click();
            }
        });

        await page.evaluate(async () => {
            const next = document.querySelectorAll('div._ac7b._ac7d');
            if(next.length > 0){
                next[0].childNodes[0].childNodes[0].click();
            }
        });

        await page.waitForSelector('div[class="_aacl _aacp _aacw _aacx _aad6"]');
        await page.screenshot({path: `${this.__DIR}/screenshots/uploadYTVideo4.png`});

        await page.evaluate(() => {
            const next = document.querySelectorAll('div._ac7b._ac7d');
            if(next.length > 0){
                next[0].childNodes[0].childNodes[0].click();
            }
        });

        await page.waitForSelector('textarea[aria-label="Write a caption..."]');
        await page.screenshot({path: `${this.__DIR}/screenshots/uploadYTVideo5.png`});

        const title = video['snippet']['title']
        await page.type('textarea[aria-label="Write a caption..."]', title);
        await page.evaluate(() => {
            const share = document.querySelectorAll('div._ac7b._ac7d');
            if(share.length > 0){
                share[0].childNodes[0].childNodes[0].click();
            }
        });
        
        await page.waitForSelector('[class="_aacl _aacr _aact _aacx _aad6 _aadb"]', {timeout: this.timeout});
        await page.screenshot({path: `${this.__DIR}/screenshots/uploadYTVideo.png`});
    }

    __open = async (page, username) => {
        console.log("InstagramUtils.__open():: {STARTED}")
        await page.goto(`https://www.instagram.com/${username}`);
        
        await page.waitForSelector('[class="_aacl _aacs _aact _aacx _aada"]', {timeout: this.timeout});
        await page.screenshot({path: `${this.__DIR}/screenshots/open.png`});

        const element = await page.$('[class="_aacl _aacs _aact _aacx _aada"]');
        const elementValue = await (await element.getProperty('textContent')).jsonValue();
        console.log(`InstagramUtils.__open():: Opened ${elementValue} page`);
        
        await page.screenshot({path: `${this.__DIR}/screenshots/open.png`});
    }

    __login = async (page, username, password) => {
        console.log("InstagramUtils.__login():: {STARTED}")
        await page.goto('https://www.instagram.com/accounts/login/');

        await page.waitForSelector('[name="username"]', {timeout: this.timeout});
        await page.waitForSelector('[name="password"]');
        await page.waitForSelector('[type="submit"]');
        await page.screenshot({path: `${this.__DIR}/screenshots/login.png`});

        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');

        await page.screenshot({path: `${this.__DIR}/screenshots/login.png`});
        await page.waitForNavigation();
    }

    __verificationCode = async(page) => {
        console.log("InstagramUtils.__verificationCode():: {STARTED}")
        await page.waitForSelector('[name="verificationCode"]', {timeout: this.timeout});
        await page.waitForSelector('[type="button"]');
        await page.screenshot({path: `${this.__DIR}/screenshots/verification.png`});
        
        const code = readline.question("Enter 2FA Code: ");
        await page.type('input[name="verificationCode"]', code);
        await page.click('button[type="button"]');

        await page.screenshot({path: `${this.__DIR}/screenshots/verification.png`});
        await page.waitForNavigation();
    }

}

const getPageInstance = async () => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox', 
            '--enable-font-antialiasing', 
            '--font-render-hinting=medium',
            '--hide-scrollbars',
            '--mute-audio',
            '--headless',
            '--in-process-gpu'
        ],
        dumpio: false,
        devtools: false,
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        userDataDir: '/tmp/puppeteerChromeSessionInstagramUtils'
    });
    console.log("getPageInstance():: {BROWSER LAUNCHED}")
    // const incognitoBrowserContext = browser.createIncognitoBrowserContext();
    // incognitoBrowserContext.close = browser.close;
    // return incognitoBrowserContext;

    const page = await browser.newPage();
    console.log("getPageInstance():: {PAGE CREATED}")
    return page
};

const readJSON = (filepath) => {
    if(!fs.existsSync(filepath)) return null

    const data = fs.readFileSync(filepath)
    return JSON.parse(data)
}

const writeJSON = (filepath, data) => {
    fs.writeFileSync(filepath, JSON.stringify(data));
}

export default InstagramUtils;