import './globals.css'
import type { AppProps } from "next/app";

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
