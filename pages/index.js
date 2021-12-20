import Head from 'next/head'
import Image from 'next/image'
import moment from "moment"
import * as utils from "../src/utils"
import * as scrapers from "../src/scrapers"


export default function Home({ hodlers, networks }) {

  function handleClick() {
    document.querySelectorAll(".saito-table .protocol").forEach(row => {
      console.log("ROW", row);
      row.classList.toggle("hide-row");
    });
  }

  return (
    <div className="container">
      <Head>
        <title>Saito Hodlers</title>
        <meta name="description" content="10,473 Saito Hodlers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="hero is-fullheight">
        <div className="hero-body has-text-centered">
          <div className="container">
            <div className="content">
              <div className="saito-wrapper" onClick={handleClick}>
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
                    return <tr key={network.token} className="protocol hide-row" title={"Last updated " + moment(network.timestamp).fromNow() }>
                      <td>{utils.formatNumberForThousands(network.hodlers)}</td>
                      <td><span className="hodler-label">{network.token} Hodlers</span></td>
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
      </footer>
    </div>
  )
}


export async function getStaticProps(obj={}) {
  const networks = await scrapers.getAllAndUpdateOne();
  const hodlers = networks.map(network => { return network.hodlers }).reduce((a, b) => a + b);
  return {
    props: { hodlers, networks },
    revalidate: 60 * 60,
  };
}

