import fetch from "node-fetch"
import * as utils from "./utils.js"
import debug from "debug"
import { PrismaClient } from "@prisma/client"
const log = debug("saitohodlers:scraper:index");

const prisma = new PrismaClient();

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

// hit live internet to scrape new value for network
export async function scrape(network, proxy=false) {
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development") { proxy = true }
    log(`scraping ${network.name} (${network.protocol}) (proxy=${proxy})`);

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

// update scraped value to database
export async function update(network) {
    log(`updating ${network.name} (${network.protocol})`);
    const hodlers = await scrape(network);
    if (!Number.isInteger(hodlers) || hodlers <= 0) {
        log(`invalid hodlers`);
        return;
    }

    log(`updating hodlers for ${network.name} to ${hodlers}`);
    await prisma.hodlers.create({
        data: {
            token: network.protocol,
            hodlers,
        },
    });

    return hodlers;
    
}

// update a random network
export async function updateOne() {
    const randomNetwork = Object.keys(all)[Math.floor(Math.random()*Object.keys(all).length)];
    const network = all[randomNetwork];
    await update(network);
}

// get recent hodlers for each network
export async function getAll() {
    return await prisma.$queryRaw`SELECT token, hodlers, timestamp from (SELECT * FROM hodlers ORDER BY timestamp DESC) GROUP BY token`;
}

// get all hodlers and update the one that most out of date
let lastUpdateDate = Date.now();
const cacheBustDuration = 60 * 60 * 12 * 1000; // 12 hours
export async function getAllAndUpdateOne() {
    const diff = (Date.now() - lastUpdateDate);
    if (diff >= cacheBustDuration) {
        log(`update cache (${diff / 1000}s since last)`);
        lastUpdateDate = Date.now();
        await updateOne();
    }
    return await getAll();
}

