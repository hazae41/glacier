export default {
  github: 'https://github.com/hazae41/xswr',
  docsRepositoryBase: 'https://github.com/hazae41/xswr/blob/docs',
  titleSuffix: " – XSWR",
  logo: (
    <>
      <span className="mr-2 font-extrabold hidden md:inline">
        xswr
      </span>
      <span className="text-gray-600 font-normal hidden md:inline">
        The simplest React data (re)fetching library ever made
      </span>
    </>
  ),
  head: (
    <>
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="description" content="XSWR: The simplest React data (re)fetching library ever made" />
      <meta name="og:description" content="XSWR: The simplest React data (re)fetching library ever made" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://xswr.hazae41.me/og.png" />
      <meta name="twitter:site:domain" content="xswr.hazae41.me" />
      <meta name="twitter:url" content="https://xswr.hazae41.me" />
      <meta name="og:title" content="The simplest React data (re)fetching library ever made" />
      <meta name="og:image" content="https://xswr.hazae41.me/og.png" />
      <meta name="apple-mobile-web-app-title" content="XSWR" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
    </>
  ),
  search: true,
  prevLinks: true,
  nextLinks: true,
  footer: true,
  footerEditLink: 'Edit this page on GitHub',
  footerText: <>MIT {new Date().getFullYear()} © XSWR.</>,
  unstable_faviconGlyph: '👋',
}
