export function formatNumberForThousands(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function parsePositiveIntegerFromString(str) {
  if (!str) { return 0 }

  const num = Number(str.replace(",", ""));
  if (!Number.isInteger(num)) {
    return 0;
  }

  if (num < 0) {
    return 0;
  }

  return num;
}

export function proxyURL(url, api_key=process.env.PROXIESAPI_KEY) {
  return `http://api.scraperapi.com?api_key=59e8b7ea01bd95d4ebc84123324db2ec&url=${url}`;
}

