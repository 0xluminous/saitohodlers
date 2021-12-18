import * as scrapers from "../../src/scrapers"

export default async function handler(req, res) {
  const erc20 = await scrapers.erc20();
  if (erc20 !== null) {
    res.setHeader("Cache-Control", "s-maxage=86400");
    res.status(200).send(erc20);
  } else {
    res.status(200).send(0);
  }
}
