import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Head from "next/head";
import "../styles/globals.css";
import toast, { Toaster } from 'react-hot-toast';


const ClientID = process.env.NEXT_PUBLIC_CLIENT_ID;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={ClientID}
    >
      <Head>
        <title>Snapshot Tool</title>
        <meta name="description" content="ERC721 NFT Collection Snapshot Tool" />
      </Head>
      <Toaster />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;

