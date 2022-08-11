import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import DiscordProvider from "next-auth/providers/discord";


const options = {
    providers: [
        GitHubProvider({
            clientId: process.env.NEXT_PUBLIC_GITHUB_ID,
            clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET
        }),
        TwitterProvider({
            clientId: process.env.NEXT_PUBLIC_TWITTER_ID,
            clientSecret: process.env.NEXT_PUBLIC_TWITTER_SECRET,
            version: "2.0",
        }),
        DiscordProvider({
            clientId: process.env.NEXT_PUBLIC_DISCORD_ID,
            clientSecret: process.env.NEXT_PUBLIC_DISCORD_SECRET
        })
    ],

    pages: {
        signIn: '/auth/signin',
        // signOut: '/auth/signout',
        // error: '/auth/error', // Error code passed in query string as ?error=
        // verifyRequest: '/auth/verify-request', // (used for check email message)
        // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },

    callbacks: {
        async session({ session, token, user }) {
            session.user.username = session.user.name.split(' ').join('').toLocaleLowerCase()
            session.user.uid = token.sub
            return session
        }
    },

    secret: process.env.SECRET // SECRET env variable 

}

export default (req, res) => NextAuth(req, res, options)