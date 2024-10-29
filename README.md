# local-notifier

local-notifier is a simple library which can be hosted in docker to notify you via telegram when something appears/disappears from the page (local in your network or world wide web).

## Installation

1. Clone the repository
   ```bash
   git clone git@github.com:armata007/local-notifier.git
   ```
1. cd into the repository
   ```bash
   cd local-notifier
   ```
1. Copy `.env.example` file to `.env`
   ```bash
   cp .env.example .env
   ```
1. Change values in `.env`
   1. `TELEGRAM_TOKEN` - Create a bot at @botfather in Telegram with `/newbot` command and put generated token here
   1. `TELEGRAM_USER_ID` - This is your user id in telegram
   2. `TIMEZONE` - set to your timezone
   3. `ALL_GOOD_CRON_TIME` - crontab string which sends telegram message `All good - local notifier is working in background`. If you want it disabled set it to empty string, for example `ALL_GOOD_CRON_TIME=""`.
2. Copy `config.ts.example` to `config.ts`
   ```bash
   cp config.ts.example config.ts
   ```
3. Change values in `config.ts`. Config is an array of items. Each item consists of:
   1. `name` - name which will be used in notification
   2. `url` - url which should be checked
   3. `cronTime` - crontab string (how often you want this check to run)
   4. `type` - either `regexp` or `json`
      1. `regexps` - if `type` is `regexp` - array of items to check against page. Each item consists of:
         1. `regexp` - regexp which will trigger Telegram message. If regexp find something it is considered an error.
         2. `message` - user friendly message which will be sent to Telegram
      2. `jsonProperties` - if `type` is `json` - array of tests for json properties
         1. `property` - name of json property
         2. `message` - message which will be sent when check fails
         3. `value` - value for which the value of json property should be tested
            1. String type - it will compare strings
               1. `type: "string"`
               2. `value: "test"` - string which should be compared to property
            2. Boolean type - it will compare property to boolean value
               1. `type: "boolean"`
               2. `value: true` - it will check if property is true
            3. Number type - it will compare property to number
               1. `type: "number"`
               2. `value: 5`
               3. `modifier: "greaterthan"` - it can albo be `lesserthan` or `equals`. It will check if property is greater than 5.
            4. Regexp type - it will compare property to regexp
               1. `type: "regexp"`
               2. `value: new RegExp(/error/)` - regexp which will be run on property.
## Usage

To start this run:

```bash
docker-compose up --build
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
