import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { CronJob } from "cron";
import { JsonCheck, RegexpCheck } from "./types";
import config from "../config";

console.log(`Current time is ${new Date().toLocaleString()}`);

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (typeof TELEGRAM_TOKEN !== "string") {
  console.error("There is no TELEGRAM_TOKEN");
  process.exit(1);
}
const TELEGRAM_USER_ID = Number(process.env.TELEGRAM_USER_ID);
if (TELEGRAM_USER_ID === 0) {
  console.error("There is no TELEGRAM_USER_ID");
  process.exit(1);
}

const ALL_GOOD_CRON_TIME = process.env.ALL_GOOD_CRON_TIME;
if (typeof ALL_GOOD_CRON_TIME !== "string") {
  console.error("There is no ALL_GOOD_CRON_TIME");
  process.exit(1);
}

const TIMEZONE = process.env.TIMEZONE;
if (typeof TIMEZONE !== "string") {
  console.error("There is no TIMEZONE");
  process.exit(1);
}

const start = async (check: RegexpCheck | JsonCheck) => {
  console.log("Running check");
  const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });
  try {
    const response = await fetch(check.url);
    const errors: string[] = [];
    if (check.type === "regexp") {
      const responseText = await response.text();
      for (let j = 0; j < check.regexps.length; j += 1) {
        if (check.regexps[j].regexp.test(responseText)) {
          errors.push(check.regexps[j].message);
        }
      }
    } else if (check.type === "json") {
      const responseJson = (await response.json()) as Record<string, any>;
      for (let i = 0; i < check.jsonProperties.length; i += 1) {
        const jsonCheck = check.jsonProperties[i];
        if (jsonCheck.value.type === "boolean") {
          if (responseJson[jsonCheck.property] !== jsonCheck.value.value) {
            errors.push(jsonCheck.message);
          }
        } else if (jsonCheck.value.type === "string") {
          if (responseJson[jsonCheck.property] !== jsonCheck.value.value) {
            errors.push(jsonCheck.message);
          }
        } else if (jsonCheck.value.type === "number") {
          if (
            jsonCheck.value.modifier === "greaterthan" &&
            responseJson[jsonCheck.property] <= jsonCheck.value.value
          ) {
            errors.push(jsonCheck.message);
          } else if (
            jsonCheck.value.modifier === "lesserthan" &&
            responseJson[jsonCheck.property] >= jsonCheck.value.value
          ) {
            errors.push(jsonCheck.message);
          } else if (
            jsonCheck.value.modifier === "equals" &&
            responseJson[jsonCheck.property] === jsonCheck.value.value
          ) {
            errors.push(jsonCheck.message);
          }
        } else if (jsonCheck.value.type === "regexp") {
          if (
            jsonCheck.value.value.test(String(responseJson[jsonCheck.property]))
          ) {
            errors.push(jsonCheck.message);
          }
        }
      }
    }
    if (errors.length > 0) {
      console.log("Sending errors", errors);
      bot.sendMessage(
        TELEGRAM_USER_ID,
        `Check failed for ${check.name}. Errors: ${errors
          .map((error) => `"${error}"`)
          .join(", ")}.`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      bot.sendMessage(
        TELEGRAM_USER_ID,
        `Automatic check failed. Error: "${error.message}".`
      );
    }
  }
  console.log("Check finished");
};

const allGood = async () => {
  console.log("Running all good");
  const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });
  bot.sendMessage(
    TELEGRAM_USER_ID,
    "All good - local notifier is working in the background"
  );
  console.log("All good done");
};
for (let i = 0; i < config.length; i += 1) {
  new CronJob(
    config[i].cronTime,
    function () {
      start(config[i]);
    },
    null,
    true,
    TIMEZONE,
    null,
    true
  );
}

if (ALL_GOOD_CRON_TIME !== "") {
  new CronJob(
    ALL_GOOD_CRON_TIME,
    function () {
      allGood();
    },
    null,
    true,
    TIMEZONE,
    null,
    true
  );
}
