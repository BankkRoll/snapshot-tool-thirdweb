import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Head from "next/head";
import "../styles/globals.css";
import Footer from "../components/Footer";
import toast, { Toaster } from 'react-hot-toast';


const activeChain = "ethereum";
const ClientID = process.env.CLIENT_ID;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={ClientID}
    >
      <Head>
        <title>Snapshot Tool</title>
        <meta name="description" content="ERC721 NFT Collection Snapshot Tool" />
      </Head>
      <Toaster />
      <Component {...pageProps} />
      <Footer />
    </ThirdwebProvider>
  );
}

export default MyApp;

