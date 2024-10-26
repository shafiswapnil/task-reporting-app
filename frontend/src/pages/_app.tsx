import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Navigation from '../components/Navigation';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Navigation />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
