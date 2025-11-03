import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import RootLayout from "@/components/layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Daftar halaman yang tidak perlu layout
  const noLayoutPages = ["/login", "/Home"];

  const isNoLayout = noLayoutPages.includes(router.pathname);

  return (
    <>
      <Head>
        <title>IDP - Intelligent Document Processing</title>
        <meta
          name="description"
          content="Document processing and OCR management system"
        />
        <meta name="generator" content="v0.app" />
      </Head>

      {isNoLayout ? (
        // Render langsung tanpa layout
        <Component {...pageProps} />
      ) : (
        // Render dengan layout
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      )}
    </>
  );
}
