import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Head from "next/head";
import "../styles/globals.css";
import Footer from "../components/Footer";
import toast, { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';


// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "ethereum";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={activeChain}>
      <Head>
        <title>Snapshot Tool</title>
        <meta name="description" content="ERC721 NFT Collection Snapshot Tool" />
      </Head>
      <Toaster />
      <Component {...pageProps} />
      <Footer />
      <Analytics />
    </ThirdwebProvider>
  );
}

export default MyApp;

