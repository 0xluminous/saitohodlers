import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
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
                <div className="saito">10,473 Saito Hodlers</div>
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
