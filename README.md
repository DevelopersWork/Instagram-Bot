<h1 align="center">Welcome to Instagram Bot 👋</h1>
<p align="center">Tool that <b>automates</b> your social media interactions to Post on Instagram.</p>
<p align="center">Implemented in Python, Javascript using the Puppeteer<p>
<p align="center">
  <a href="https://github.com/developerswork/Instagram-Bot/blob/master/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/license-GPLv3-blue.svg?style=for-the-badge" target="_blank"/>
  </a>
  <a href="https://www.python.org/" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-Python3-blue.svg?style=for-the-badge&logo=python" />
  </a>
  <a href="https://nodejs.org/en" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NodeJs-green.svg?style=for-the-badge&logo=javascript" />
  </a>
  <a href="https://github.com/puppeteer/puppeteer" target="_blank">
    <img src="https://img.shields.io/github/package-json/dependency-version/DevelopersWork/Instagram-Bot/puppeteer?filename=package.json&logo=puppeteer&style=for-the-badge" />
  </a>
</p>
<p align="center">
  <a href="#stars">
    <img src="https://img.shields.io/github/stars/developerswork/Instagram-Bot?style=social" />
  </a>
  <a href="#forks">
    <img src="https://img.shields.io/github/forks/developerswork/Instagram-Bot?style=social" />
  </a>
  <a href="#watchers">
    <img src="https://img.shields.io/github/watchers/developerswork/Instagram-Bot?style=social" />
  </a>
</p>

## Setup

```sh
sh init.sh
```

## Input parameters


### Environment Variables
#### Example [[TEMPLATE].env](https://raw.githubusercontent.com/DevelopersWork/Instagram-Bot/master/%5BTEMPLATE%5D.env?token=GHSAT0AAAAAABXUHCQEUDIHP7OHA7X7BRHUY32LHVQ)
```yaml

CHROME_EXECUTABLE_PATH='/usr/bin/chromium-browser'
PYTHON=python3
TEMPORARY_DIRECTORY='./tmp'

YT_API_KEY='MyGoogleAPIKey'

INSTA_USERNAME='developerswork'
INSTA_PASSWORD='password'
INSTA_2AUTH=true

```

### JSON Configuration
#### Example [[TEMPLATE]query.json](https://raw.githubusercontent.com/DevelopersWork/Instagram-Bot/master/%5BTEMPLATE%5Dquery.json?token=GHSAT0AAAAAABXUHCQFFCB4BOMPUIVR73VGY32LOOQ)
```json

[
  {
    "q": "\"#shorts\" #twitch #gaming",
    "publishedAfter": "2022-11-20T11:02:55Z"
  },
  {
    "channelId": "UCLOuJz6XA80hEE8a8CbQ3iQ"
  },
  {
    "q": "\"#shorts\" @user-rs8xl8sv5j"
  },
  {
    "relatedToVideoId": "ASXCTgvuEk4"
  }
]

```

## Show your support

Give a ⭐️ if this project helped you!

***

> **Disclaimer**<a name="disclaimer" />: Please be aware that this tool is experimental. Do not use it in a manner that may cause you harm or inconvenience. I am not responsible for any consequences arising from its use.