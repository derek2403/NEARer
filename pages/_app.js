// pages/_app.js
import '../styles/globals.css';
import { WalletSelectorContextProvider } from '../components/WalletSelectorContext'
import '@near-wallet-selector/modal-ui/styles.css';
import { NextUIProvider } from "@nextui-org/react";

function MyApp({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <WalletSelectorContextProvider>
        <Component {...pageProps} />
      </WalletSelectorContextProvider>
    </NextUIProvider>
  )
}

export default MyApp;