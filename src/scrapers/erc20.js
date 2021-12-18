import debug from "debug"
const log = debug("saitohodlers:scraper:erc20");
import fetch from "node-fetch"
import * as utils from "../utils"

const TOKEN_ADDRESS = "0xfa14fa6958401314851a17d6c5360ca29f74b57b";
const ETHERSCAN_URL = `https://etherscan.io/token/${TOKEN_ADDRESS}`;

export default async function erc20() {
    const url = utils.proxyURL(ETHERSCAN_URL);
    log(`hitting ${url}`);

    const response = await fetch(url);
    log(`response ${response.status} ${response.statusText}`);
    if (response.status !== 200) return 0;

    const body = await response.text();

    if (!body) return null;
    log(`body length ${body.length}`);

    try {
        const pattern = body.match(/number of holders (?<holders>[\d,]+) and updated information of the token/);
        const holders = utils.parsePositiveIntegerFromString(pattern.groups.holders);
        log(`holders ${holders}`);
        return holders;
    } catch (e) {
        return 0;
    }
}

