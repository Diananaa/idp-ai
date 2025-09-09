
import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import { GeistProvider, CssBaseline } from '@geist-ui/core'
import Head from "next/head";
import RootLayout from "@/components/layout";
// import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>IDP - Intelligent Document Processing</title>
        <meta name="description" content="Document processing and OCR management system" />
        <meta name="generator" content="v0.app" />
      </Head>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>

    </>
  )
}
