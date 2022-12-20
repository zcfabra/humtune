import Head from 'next/head'
import '../styles/globals.css'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
  <Head>
    <title>Humtune</title>
    <link rel="shortcut icon" href="/images/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=0.5"/>
  </Head>
  <Component {...pageProps} />
  </>
}

export default MyApp
