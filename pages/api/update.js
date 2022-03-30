import * as scrapers from "../../src/scrapers"

export default async function handler(req, res) {
  var cacheBust = false;
  if (process.env.ADMIN_KEY && process.env.ADMIN_KEY == req.query.admin) {
    cacheBust = true;
  }
  const response = await scrapers.cachedUpdateOne(cacheBust);
  res.status(200).send(response);
}
