import { XSWR } from "@hazae41/xswr"
import type { AppProps } from 'next/app'
import "../styles/globals.css"

function MyApp({ Component, pageProps }: AppProps) {
  return <XSWR.CoreProvider
    cooldown={5 * 1000}
    expiration={5 * 60 * 1000}>
    <Component {...pageProps} />
  </XSWR.CoreProvider>
}

export default MyApp
