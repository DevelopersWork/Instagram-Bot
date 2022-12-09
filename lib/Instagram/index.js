import fs from 'fs';
import path from 'path';

import puppeteer from 'puppeteer';
import winston from 'winston';

import Login from './Login.js';
import Post from './Post.js';

class Instagram {
	constructor(dir) {
		this.dir = dir.replace(/\/+$/, '') + '/Instagram/';
		fs.mkdirSync(this.dir, { recursive: true });

		this.logger = createLogger(this.dir + 'logs/', 'Instagram');

		this.logger.debug('Instagram.constructor():: {STARTED}');

		this.features = {
			login: new Login(this.dir, this.logger),
			post: new Post(this.dir, this.logger),
		};
	}

	main = async () => {
		this.logger.info('Instagram.main():: {STARTED}');

		const _timestamp = new Date().toISOString().split('T')[0] + 'T00:00:00Z';
		const _api_dir = '../PythonScripts/YouTubeDataAPI';
		const apiDir = isDirExists([this.dir, _api_dir, _timestamp].join('/'));

		const _videoDir = '../PythonScripts/VideoDowloader';
		const videoDir = isDirExists([this.dir, _videoDir].join('/'));

		if (!apiDir || !videoDir) return false;
		const api_result_jsons = fs.readdirSync(apiDir);
		const video_dirs = fs.readdirSync(videoDir);

		const page = await this.getPageInstance();

		await this.features['login'].main(page);

		const data = [];
		for (let i in api_result_jsons) {
			const filename = api_result_jsons[i];
			const api_result = readJSON(`${apiDir.replace(/\/+$/, '')}/${filename}`);

			api_result['items'].map((item) => {
				const videoId = item['id']['videoId'];

				if (video_dirs.filter((dirName) => dirName === videoId).length) {
					const videoIdDir = `${videoDir.replace(/\/+$/, '')}/${videoId}`;
					const videos = fs.readdirSync(videoIdDir);

					videos.map((video) => {
						const videoLocation = `${videoIdDir}/${video}`;
						data.push({
							filename: videoLocation,
							title: item['snippet']['title'],
							videoId,
						});
					});
				}
			});
		}

		const completed = readJSON(`${this.dir.replace(/\/+$/, '')}/db.json`) || [];

		for (let i in data) {
			try {
				if (completed.filter((id) => id === data[i]['videoId']).length)
					continue;

				await this.features['post'].main(page, data[i]);
				completed.push(data[i]['videoId']);
				writeJSON(`${this.dir.replace(/\/+$/, '')}/db.json`, completed);
			} catch (error) {
				this.logger.error('Instagram.main():: ' + error);
			}
		}

		this.logger.info('Instagram.main():: {COMPLETED}');
	};

	async getIncognitoPageInstance() {
		const browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--enable-font-antialiasing',
				'--font-render-hinting=medium',
				'--hide-scrollbars',
				'--mute-audio',
				'--headless',
				'--in-process-gpu',
			],
			dumpio: false,
			devtools: false,
			executablePath: `${process.env.CHROME_EXECUTABLE_PATH}`,
			headless: true,
			userDataDir: `${this.dir.replace(
				/\/+$/,
				''
			)}/puppeteerChromeSessionInstagram`,
		});

		const incognitoBrowserContext = browser.createIncognitoBrowserContext();
		incognitoBrowserContext.close = browser.close;

		const page = await incognitoBrowserContext.newPage();
		return page;
	}

	async getPageInstance() {
		const browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--enable-font-antialiasing',
				'--font-render-hinting=medium',
				'--hide-scrollbars',
				'--mute-audio',
				'--headless',
				'--in-process-gpu',
			],
			dumpio: false,
			devtools: false,
			executablePath: `${process.env.CHROME_EXECUTABLE_PATH}`,
			headless: true,
			userDataDir: `${this.dir.replace(
				/\/+$/,
				''
			)}/puppeteerChromeSessionInstagram`,
		});

		const page = await browser.newPage();
		
		const cdp = await page.target().createCDPSession();
		await cdp.send('Log.enable');
		const logger = createLogger(this.dir + 'logs/', 'ChromeSession');
		cdp.on('Log.entryAdded', async ({ entry }) => {
      		logger.debug(JSON.stringify(entry));
    	});

		return page;
	}
}

const createLogger = (_dir, _sub_dir) => {
	const dir = _dir.replace(/\/+$/, '') + '/' + _sub_dir;
	fs.mkdirSync(dir, { recursive: true });

	const logger = winston.createLogger({
		level: 'debug',
		format: winston.format.json(),
		transports: [
			new winston.transports.File({
				filename: `${dir.replace(/\/+$/, '')}/stderr.log`,
				level: 'error',
			}),
			new winston.transports.File({
				filename: `${dir.replace(/\/+$/, '')}/stdout.log`,
				level: 'info',
			}),
			new winston.transports.File({
				filename: `${dir.replace(/\/+$/, '')}/std.log`,
			}),
		],
	});
	logger.add(
		new winston.transports.Console({
			format: winston.format.simple(),
			level: 'info',
		})
	);

	return logger;
};

const isDirExists = (dir) => {
	if (!fs.existsSync(dir)) return false;
	return path.resolve(dir);
};

const readJSON = (filepath) => {
	if (!fs.existsSync(filepath)) return null;

	const data = fs.readFileSync(filepath);
	return JSON.parse(data);
};

const writeJSON = (filepath, data) => {
	fs.writeFileSync(filepath, JSON.stringify(data));
};

export default Instagram;
