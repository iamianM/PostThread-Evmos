import '../styles/globals.css'
import { RecoilRoot } from 'recoil';
import { themeChange } from 'theme-change'
import { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '../apollo-client';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from "next-auth/react"

function MyApp({ Component, pageProps: { session, ...pageProps } }) {

    useEffect(() => {
        themeChange(false)
    }, [])

    return (
        <>
            <Toaster />
            <SessionProvider session={session}>
                <ApolloProvider client={client} >
                    <RecoilRoot>
                        <Component {...pageProps} className="bg-base-200" />
                    </RecoilRoot>
                </ApolloProvider>
            </SessionProvider>
        </>
    )
}

export default MyApp
