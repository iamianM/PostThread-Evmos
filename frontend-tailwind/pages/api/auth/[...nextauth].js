import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from '../../../supabaseClient';

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
        }),
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "credentials",
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "username", type: "text", placeholder: "jsmith" },
                password: { label: "password", type: "password" }
            },
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied

                console.log("logging in with credentials")
                let { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', credentials.username)


                if (user) {
                    // Any object returned will be saved in `user` property of the JWT
                    console.log(user)
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        })
    ],

    session: {
        // Set to jwt in order to CredentialsProvider works properly
        strategy: 'jwt'
    },

    pages: {
        signIn: '/auth/signin',
        // signOut: '/auth/signout',
        // error: '/auth/error', // Error code passed in query string as ?error=
        // verifyRequest: '/auth/verify-request', // (used for check email message)
        // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },

    callbacks: {
        async session({ session, token }) {
            // session.user.username = session.user.name ?? session.user.username
            // session.user.uid = token.sub
            session.user = token.user
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
    },

    secret: process.env.NEXTAUTH_SECRET // SECRET env variable 

}

export default (req, res) => NextAuth(req, res, options)