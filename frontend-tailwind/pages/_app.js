import '../styles/globals.css'
import { themeChange } from 'theme-change'
import { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '../apollo-client';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from "next-auth/react"
import { DAppProvider, Polygon } from '@usedapp/core'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {

    useEffect(() => {
        themeChange(false)
    }, [])

    const config = {
        readOnlyChainId: Polygon.chainId,
        readOnlyUrls: {
            [Polygon.chainId]: "https://polygon-mainnet.infura.io/v3/489bd63d599647f79eb6f6cf1600daa9",
        },
    }

    return (
        <DAppProvider config={config}>
            <Toaster />
            <SessionProvider session={session}>
                <ApolloProvider client={client} >
                    <Component {...pageProps} className="bg-base-200" />
                </ApolloProvider>
            </SessionProvider>
        </DAppProvider>
    )
}

export default MyApp
