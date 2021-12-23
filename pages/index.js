import Head from 'next/head'
import Image from 'next/image'
import moment from "moment"
import * as utils from "../src/utils"
import * as scrapers from "../src/scrapers"


export default function Home({ hodlers, networks }) {

  function handleClick() {
    document.querySelectorAll(".saito-table .protocol").forEach(row => {
      row.classList.toggle("hide-row");
    });
  }

  return (
    <div onClick={handleClick}>
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
                      return <tr key={network.token} className="protocol hide-row" title={"Last updated " + network.timeago}>
                        <td>
                          <a href={network.network.url}>
                              {utils.formatNumberForThousands(network.hodlers)}
                          </a>
                        </td>
                        <td>
                          <a href={network.network.url}>
                            <span className="hodler-label">{network.token} Hodlers</span>
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


export async function getStaticProps(obj={}) {
  const networks = (await scrapers.getAll()).map(network => {
    network.timeago = moment(network.timestamp).fromNow();
    delete network.timestamp;
    delete network.network.regex;
    return network;
  });
  const hodlers = networks.map(network => { return network.hodlers }).reduce((a, b) => a + b);
  return {
    props: { hodlers, networks },
    revalidate: 1,
  };
}

