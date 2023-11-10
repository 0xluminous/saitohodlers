import fetch from "node-fetch"
import * as utils from "./utils.js"
import debug from "debug"
import { PrismaClient } from "@prisma/client"
const log = debug("saitohodlers:scraper:index");

const options = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
    }
};

const prisma = new PrismaClient();

// Scrapers

export const Ethereum = {
    name: "Ethereum",
    protocol: "ERC-20",
    url: "https://ethplorer.io/address/0xfa14fa6958401314851a17d6c5360ca29f74b57b",
    regex: /transactions and (?<holders>[\d,]+) holders/,
    proxy: false
};

export const BinanceSmartChain = {
    name: "Binance Smart Chain",
    protocol: "BEP-20",
    url: "https://bscscan.com/token/0x3c6dad0475d3a1696b359dc04c99fd401be134da",
    regex: /number of holders (?<holders>[\d,]+) and updated information of the token/,
    proxy: false
};

export const BSV = {
    name: "BSV",
    protocol: "RUN",
    url: "https://staging-backend.relayx.com/api/market/SAITO/orders",
    regex: /\"owners\":(?<holders>[\d]+),/,
    proxy: false
};


export const networks = [Ethereum, BSV, BinanceSmartChain];

export const protocols = Object.fromEntries(networks.map(network => [network.protocol, network]));

const NUM_NETWORKS = networks.length;

// fns

// hit live internet to scrape new value for network
export async function scrape(network) {
    //if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development") { proxy = true }
    const start = Date.now();

    const proxy = !!network.proxy;

    log(`scraping ${network.name} (${network.protocol}) (proxy=${proxy})`);

    const url = (proxy ? utils.proxyURL(network.url) : network.url);
    log(`hitting ${url}`);

    const diff = Date.now() - start;

    const response = await fetch(url, options);
    log(`response ${response.status} ${response.statusText} in ${diff}ms`);
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
    const all = await getAll();
    let lowestTimestamp = Infinity;
    let needsUpdate = null;
    for (const network of all) {
        const timestamp = (new Date(network.timestamp)).getTime();
        if (timestamp < lowestTimestamp) {
            lowestTimestamp = timestamp;
            needsUpdate = network;
        }
    }

    log(`updating oldest network cache ${needsUpdate.network.name}`);
    return await update(needsUpdate.network);
}

// get recent hodlers for each network
export async function getAll() {
    const networks = await prisma.$queryRaw`SELECT DISTINCT ON (token) token, hodlers, timestamp FROM "public"."Hodlers" ORDER BY token, timestamp DESC`;
    return networks.map(network => {
        network.network = Object.assign({}, protocols[network.token]);
        return network;
    });
}

// get best daily hodlers for each network
export async function getDailyHistoryForNetworks() {
    const networks = await prisma.$queryRaw`select timestamp::date, token, MAX(hodlers) from "public"."Hodlers" GROUP BY token, timestamp::date ORDER BY timestamp DESC LIMIT 100`;
    return networks.map(network => {
        network.network = Object.assign({}, protocols[network.token]);
        return network;
    });
}

// get history for each day
export async function getDailyHistoryForSaito() {
    const networks = await getDailyHistoryForNetworks();
    const history = {};
    for (const network of networks) {
        if (history[network.timestamp]) {
            history[network.timestamp].push(network.max);
        } else {
            history[network.timestamp] = [network.max];
        }
    }

    for (const date of Object.keys(history)) {
        if (history[date].length === NUM_NETWORKS) {
            history[date] = history[date].reduce((a, b) => { return a + b });
        } else {
            delete history[date];
        }
    }

    return history;
}

// update random network
let lastUpdateDate = -Infinity;
//const cacheBustDuration = 60 * 60 * 12 * 1000; // 12 hours
//const cacheBustDuration = 60 * 60 * 1000; // 1 hour
const cacheBustDuration = 60 * 5 * 1000; // 5 mins
export async function cachedUpdateOne(cacheBust = false) {
    const diff = (Date.now() - lastUpdateDate);
    if (cacheBust || diff >= cacheBustDuration) {
        log(`update cache (${diff / 1000}s since last)`);
        lastUpdateDate = Date.now();
        await updateOne();
        return true;
    } else {
        log(`skipping cache bust, only (${diff / 1000}s since last, looking for ${cacheBustDuration / 1000}s)`);
    }
    return false;
}

