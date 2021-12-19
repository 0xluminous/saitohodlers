import debug from "debug"
const log = debug("saitohodlers:scraper:run");
import fetch from "node-fetch"
import * as utils from "../utils"

const RUN_URL = "https://bsv.run/7f6aa3e66b83205e283b8df39ff1d79c8ff3feacc5d1febf57650969f28f08a7_o2/";

export default async function run() {
    const url = utils.proxyURL(RUN_URL);
    log(`hitting ${url}`);

    const response = await fetch(url);
    log(`response ${response.status} ${response.statusText}`);
    if (response.status !== 200) return 0;

    const body = await response.text();

    if (!body) return null;
    log(`body length ${body.length}`);

    try {
        const pattern = body.match(/Token holders: (?<holders>[\d]+)\n/);
        const holders = utils.parsePositiveIntegerFromString(pattern.groups.holders);
        log(`holders ${holders}`);
        return holders;
    } catch (e) {
        return 0;
    }
}


run();
