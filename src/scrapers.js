import fetch from "node-fetch"
import * as utils from "../utils.js"
import Prisma from "@prisma/client";
import debug from "debug"
const log = debug("saitohodlers:scraper:index");
const { PrismaClient } = Prisma;

// Scrapers

export const Ethereum = {
    name: "Ethereum",
    protocol: "ERC-20",
    url: "https://etherscan.io/token/0xfa14fa6958401314851a17d6c5360ca29f74b57b",
    regex: /number of holders (?<holders>[\d,]+) and updated information of the token/,
};

export const BSV = {
    name: "BSV",
    protocol: "RUN",
    url: "https://bsv.run/7f6aa3e66b83205e283b8df39ff1d79c8ff3feacc5d1febf57650969f28f08a7_o2/",
    regex: /Token holders: (?<holders>[\d]+)\n/,
};


export const all = { Ethereum, BSV };


// fns

export async function scrape(network, proxy=false) {
    log(`scraping ${network.name} (${network.protocol})`);

    const url = (proxy ? utils.proxyURL(network.url) : network.url);
    log(`hitting ${url}`);

    const response = await fetch(url);
    log(`response ${response.status} ${response.statusText}`);
    if (response.status !== 200) return null;

    const body = await response.text();
    if (!body) return null;
    log(`body length ${body.length}`);

    try {
        const pattern = body.match(network.regex);
        const holders = utils.parsePositiveIntegerFromString(pattern.groups.holders);
        log(`holders ${holders}`);
        return holders;
    } catch (e) {
        return null;
    }
}

(async function() {
    for (const network of Object.keys(all)) {
        console.log("SCRAPE", await scrape(all[network]));
    }

})();

