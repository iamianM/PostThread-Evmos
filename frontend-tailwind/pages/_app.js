import '../styles/globals.css'
import { RecoilRoot } from 'recoil';
import { themeChange } from 'theme-change'
import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '../apollo-client';
import Header from '../components/Header'
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {

    useEffect(() => {
        themeChange(false)
    }, [])

    return (
        < ApolloProvider client={client} >
            <RecoilRoot>
                <Header />
                <Component {...pageProps} />
                <Toaster />
            </RecoilRoot>
        </ApolloProvider >

    )
}

export default MyApp
