import { XSWR } from "@hazae41/xswr"
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <XSWR.CoreProvider>
    <Component {...pageProps} />
  </XSWR.CoreProvider>
}

export default MyApp
