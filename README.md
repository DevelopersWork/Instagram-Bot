<h1 align="center">Welcome to Instagram Bot 👋</h1>

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
<h3 align="center"><b>Note: Educational Purposes Only</b><h3>