import fs from 'fs';

class Post {
	constructor(dir, logger) {
		this.dir = dir.replace(/\/+$/, '') + '/Post/';
		fs.mkdirSync(this.dir, { recursive: true });

		this.logger = logger;

		this.browserTimeout = (process.env.DEFAULT_TIMEOUT || 30) * 1000;

		this.logger.debug('Post.constructor():: {STARTED}');
	}

	main = async (page, postDetails) => {
		this.logger.debug('Post.main():: {STARTED}');

		try {
			this.logger.info(`Post.main():: ${JSON.stringify(postDetails)}`);

			const username = process.env.INSTA_USERNAME || '';
			await this.publishPost(page, username, postDetails);
		} catch (error) {
			return Promise.reject(error);
		}

		return Promise.resolve('');
	};

	async publishPost(page, username, postDetails, type = 'video') {
		this.logger.debug('Post.publishPost():: {STARTED}');

		await this.setPostTitle(page, username, postDetails, type);

		await page.evaluate(() => {
			const share = document.querySelectorAll('div._ac7b._ac7d');
			if (share.length > 0) {
				share[0].childNodes[0].childNodes[0].click();
			}
		});

		await page.waitForSelector(
			'[class="_aacl _aacr _aact _aacx _aad6 _aadb"]',
			{ timeout: this.browserTimeout * 2 }
		);
		await page.waitForTimeout(parseInt((Math.random() * 1000) % 100));
		await page.screenshot({ path: `${this.dir}publishPost.png` });
	}

	async setPostTitle(page, username, postDetails, type) {
		this.logger.debug('Post.setPostTitle():: {STARTED}');

		await this.setPostSize(page, username, postDetails, type);

		await page.waitForSelector('div[class="_aacl _aacp _aacw _aacx _aad6"]');
		await page.evaluate(() => {
			const next = document.querySelectorAll('div._ac7b._ac7d');
			if (next.length > 0) {
				next[0].childNodes[0].childNodes[0].click();
			}
		});

		await page.waitForSelector('textarea[aria-label="Write a caption..."]');
		await page.screenshot({ path: `${this.dir}setPostTitle.png` });

		const postCaption = postDetails['title'];
		await page.type('textarea[aria-label="Write a caption..."]', postCaption);
		await page.screenshot({ path: `${this.dir}setPostTitle.png` });
	}

	async setPostSize(page, username, postDetails, type) {
		this.logger.debug('Post.setPostSize():: {STARTED}');

		if (type == 'video') await this.uploadVideo(page, username, postDetails);
		else return;

		await page.evaluate(async () => {
			const svg_buttons = document.querySelectorAll('div._abfz._abg1');
			if (svg_buttons.length > 0) {
				svg_buttons[0].childNodes[0].click();
			}
		});

		await page.evaluate(async () => {
			const sizes_window = document.querySelectorAll('div._ac36._ac38');
			if (sizes_window.length > 0) {
				sizes_window[0].childNodes[0].click();
			}
		});

		await page.evaluate(async () => {
			const next = document.querySelectorAll('div._ac7b._ac7d');
			if (next.length > 0) {
				next[0].childNodes[0].childNodes[0].click();
			}
		});

		await page.waitForSelector('div[class="_aacl _aacp _aacw _aacx _aad6"]');
		await page.screenshot({ path: `${this.dir}setPostSize.png` });
	}

	async uploadVideo(page, username, postDetails) {
		this.logger.debug('Post.uploadVideo():: {STARTED}');

		await this.openUploadPopup(page, username);

		const inputUploadHandle = await page.$(
			'input[accept="image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"]'
		);
		await inputUploadHandle.uploadFile(postDetails['filename']);

		await page.waitForSelector('button[class="_acan _acao _acas"]', {
			timeout: this.browserTimeout,
		});
		await page.screenshot({ path: `${this.dir}uploadVideo.png` });
	}

	async openUploadPopup(page, username) {
		this.logger.debug('Post.openUploadPopup():: {STARTED}');

		await this.open(page, username);

		await page.waitForSelector('a[href="/accounts/edit/"]', {
			timeout: this.browserTimeout,
		});

		await page.click("button[class='_abl- _abm2']");
		await page.waitForSelector(
			'input[accept="image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"]'
		);
		await page.screenshot({ path: `${this.dir}openUploadPopup.png` });
	}

	async open(page, username) {
		this.logger.debug('Post.open():: {STARTED}');

		await page.goto(`https://www.instagram.com/${username}`, {
			timeout: this.browserTimeout,
		});

		await page.waitForSelector('[class="_aacl _aacs _aact _aacx _aada"]');
		await page.screenshot({ path: `${this.dir}open.png` });
	}
}

export default Post;
