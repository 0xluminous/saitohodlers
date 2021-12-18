import debug from "debug"
const log = debug("saitohodlers:scraper:erc20");
import fetch from "node-fetch"

const TOKEN_ADDRESS = "0xfa14fa6958401314851a17d6c5360ca29f74b57b";

export default async function erc20() {
    const url = `https://etherscan.io/token/${TOKEN_ADDRESS}`;
    log(`hitting ${url}`);

    const response = await fetch(url);
    log(`response ${response.status}`);
    if (response.status !== 200) return null;

    const body = await response.text();
    if (!body) return null;
    log(`body length ${body.length}`);

    try {
        const pattern = body.match(/number of holders (?<holders>[\d,]+) and updated information of the token/);
        const holders = Number(pattern.groups.holders.replace(",", ""));
        if (!Number.isInteger(holders) || holders <= 0) {
            log(`invalid holder number returned`);
            return null;
        }

        log(`holders ${holders}`);
        return holders;
    } catch (e) {
        return null;
    }
}

//    erc20().then(console.log);
