import * as scrapers from "../../src/scrapers"

export default async function handler(req, res) {
  const run = await scrapers.run();
  if (run !== null) {
    res.setHeader("Cache-Control", "s-maxage=86400");
    res.status(200).send(run);
  } else {
    res.status(200).send(0);
  }
}
