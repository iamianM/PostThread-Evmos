import '../styles/globals.css'
import { RecoilRoot } from 'recoil';
import { themeChange } from 'theme-change'
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {

    useEffect(() => {
        themeChange(false)
    }, [])

    return (
        <RecoilRoot>
            <Component {...pageProps} />
        </RecoilRoot>
    )
}

export default MyApp
