import Head from 'next/head'
import Image from 'next/image'
import moment from "moment"
import dynamic from 'next/dynamic'
import * as utils from "../src/utils"
import * as scrapers from "../src/scrapers"

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Home({ hodlers, networks, history }) {

  return (
    <div>
      <div className="container">
        <Head>
          <title>{ utils.formatNumberForThousands(hodlers) } Saito Hodlers</title>
          <meta name="description" content={ utils.formatNumberForThousands(hodlers) + " Saito Hodlers"} />
          <link rel="icon" href="/favicon.ico" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-8GX6YRB27C"></script>
          <script dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8GX6YRB27C')`,}} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Saito Hodlers" />
          <meta name="twitter:description" content={"There are " + utils.formatNumberForThousands(hodlers) + " Saito hodlers across " + networks.length + " networks"} />
          <meta name="twitter:image" content="https://saitohodlers.com/social.png" />
        </Head>

        <section className="hero is-fullheight">
          <div className="hero-body has-text-centered">
            <div className="container">
              <div className="content">
                <DailyHodlerChart history={history} />
                <div className="saito-wrapper">
                  <img src="/redcube.png" alt="Saito Cube" />
                  <table className="saito-table">
                    <tbody>
                    <tr key="hodlers" className="saito">
                      <td>
                        { utils.formatNumberForThousands(hodlers) }
                      </td>
                      <td>
                        Saito Hodlers
                      </td>
                    </tr>
                    {networks.map(network => {
                      return <tr key={network.token} className="protocol">
                        <td>
                          <a href={network.network.url}>
                              {utils.formatNumberForThousands(network.hodlers)}
                          </a>
                        </td>
                        <td>
                          <a href={network.network.url}>
                            <span className="hodler-label">{network.token} Hodlers</span>
                            <span className="hodler-updated">updated {network.timeago}</span>
                          </a>
                        </td>
                      </tr>
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <ul>
          <li><a href="https://twitter.com/0xluminous">@0xluminous</a></li>
          <li><a href="https://github.com/0xluminous/saitohodlers">source</a></li>
          </ul>
        </footer>
      </div>
    </div>
  )
}

export function DailyHodlerChart({ history }) {
  const options = {
    tooltip: { enabled: true },
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
      height: '100px',
      animations: { enabled: false },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 4,
      curve: 'smooth'
    },
    colors: ['#C62C2B'],
    yaxis: {
      labels: {
        show: false,
      }
    },
    xaxis: {
      labels: {
        show: true,
      },
      axisTicks: {
        show: true,
      }
    },
    grid: { 
      show: false
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: Object.keys(history).map(date => {
        const monthyear = date.split("-");
        monthyear.shift();
        return monthyear.join("-");
      })
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 1,
        type: 'horizontal',
        opacityFrom: 1,
        opacityTo: 1,
        colorStops: [
          {
            offset: 0,
            color: "#982221",
            opacity: 1
          },
          {
            offset: 20,
            color: "#A62524",
            opacity: 50
          },
          {
            offset: 40,
            color: "#B52927",
            opacity: 50
          },
          {
            offset: 60,
            color: "#C23C2A",
            opacity: 50
          },
          {
            offset: 100,
            color: "#D12F2D",
            opacity: 1
          }
        ]
      },
    },

  };
  const series = [
    {
      name: 'Saito Hodlers',
      data: Object.values(history)
    },
  ];

  return (
    <div className='chart'>
    <Chart options={options} series={series} type='line' />

    <style jsx>{`
        .chart {
          width: 100%;
          max-width: 500px;
          margin: auto;
        }
      `}</style>
    </div>
  );
}

export async function getStaticProps(obj={}) {

  const history = Object.fromEntries(Object.entries(await scrapers.getDailyHistoryForSaito()).reverse());

  const networks = (await scrapers.getAll()).map(network => {
    network.timeago = moment(network.timestamp).fromNow();
    delete network.timestamp;
    delete network.network.regex;
    return network;
  }).sort((a, b) => {
    return b.hodlers - a.hodlers;
  });
  const hodlers = networks.map(network => { return network.hodlers }).reduce((a, b) => a + b);
  return {
    props: { hodlers, history, networks },
    revalidate: 1,
  };
}

