import * as scrapers from "../../src/scrapers"
import moment from "moment"

const MAX_LAST_UPDATE_MINUTES = 60;

export default async function handler(req, res) {
  const all = await scrapers.getAll();
  var recentTimestamp = -Infinity;
  for (const network of all) {
    const timestamp = new Date(network.timestamp);
    if (timestamp > recentTimestamp) {
      recentTimestamp = timestamp;
    }
    console.log("TIMESTAMP", timestamp);
  }


  if (recentTimestamp == -Infinity) {
    return res.status(500).send("error");
  }

  const minutesSinceLastUpdate = (Date.now() - recentTimestamp) / 1000 / 60;
  if (minutesSinceLastUpdate > MAX_LAST_UPDATE_MINUTES) {
    return res.status(500).send(`error, it's been ${minutesSinceLastUpdate.toFixed(2)}m since last update`);
  }

  return res.status(200).send("ok");
}
