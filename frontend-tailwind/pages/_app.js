import '../styles/globals.css'
import { RecoilRoot } from 'recoil';
import { themeChange } from 'theme-change'
import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '../apollo-client';
import Header from '../components/Header'
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from "next-auth/react"


function MyApp({ Component, pageProps: { session, ...pageProps } }) {

    useEffect(() => {
        themeChange(false)
    }, [])

    return (
        <SessionProvider session={session}>
            <ApolloProvider client={client} >
                <RecoilRoot>
                    <Header />
                    <Component {...pageProps} />
                    <Toaster />
                </RecoilRoot>
            </ApolloProvider >
        </SessionProvider>

    )
}

export default MyApp
