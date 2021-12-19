import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import * as utils from "../src/utils"
import * as scrapers from "../src/scrapers"

import { PrismaClient } from '@prisma/client'

export default function Home({ hodlers }) {
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
              <div className="saito-wrapper">
                <img src="/redcube.png" alt="Saito Cube" />
                <div className="saito">{ utils.formatNumberForThousands(hodlers) } Saito Hodlers</div>
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
  /*
  console.log(await prisma.hodlers.create({
    data: {
      token: "erc20",
      hodlers: 420,
    }
  }));
  */
  //const data = await scrapers.getCachedHodlers("erc20")
  //console.log("DATA", data);
  /*
  const prefix = process.env.VERCEL_ENV == "development" ? "http://" : "https://";
  const tokens = ["erc20", "run"];
  let hodlers = 0;
  for (const token of tokens) {
    const response = await fetch(`${prefix}${process.env.VERCEL_URL}/api/${token}`);
    hodlers += Number(await response.text());
  }
  */
  const hodlers = 100;
  //let hodlers = data[0].hodlers;
  return {
    props: { hodlers },
    revalidate: 100,
  };
}

