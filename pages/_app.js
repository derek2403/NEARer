// pages/_app.js
import '../styles/globals.css';
import { WalletSelectorContextProvider } from '../components/WalletSelectorContext'
import '@near-wallet-selector/modal-ui/styles.css';

function MyApp({ Component, pageProps }) {
  return (
    <WalletSelectorContextProvider>
      <Component {...pageProps} />;
    </WalletSelectorContextProvider>
  )
}

export default MyApp;