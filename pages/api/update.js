import * as scrapers from "../../src/scrapers"

export default async function handler(req, res) {
  const response = await scrapers.cachedUpdateOne();
  res.status(200).send(response);
}
