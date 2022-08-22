# PostThread

## Live Site
You can check out the site for yourself right now at polygon.PostThread.app. Feel free to create a username and make posts and comments. Keep in mind that Thread tokens have no value and will likely not be used going forward as this is just a sneak peak into the PostThread app for the hackathon.

## Inspiration
Social media is not in our best interest. We are the product and the service. Users create most of the content on these sites and are not rewarded appropriately. We also do not know how these algorithms work. Their loyalties lie with advertisers not with users and these misalign incentives led to the polarizing climate we live in. They want to keep you on the site as long as possible at any cost and have learned that playing with your emotions is the best way to do that.

Blockchain technology has made it so we no longer have to live in this social media dystopia. The blockchain can be thought of as an open decentralized database, where users can have control and ownership of their data. We believe this will not only allow content creators to be paid more effectively and efficiently, but will open up a world of possibilities where you can actually chose the type of social media experience you want. You will have a say in what they do with your data and have control over how the media is presented to you.

I consider the current state of social media to be a national emergency. The population is growing more polarized, angry and divisive everyday and it think it directly attributable to social media. We live in a new world of big data, which we haven't quite figured out how to navigate yet. Therefore, it opens up an opportunity for these large corporations to take advantage of us. Decentralization allows the people to take control back from the corporations and I think we have created the beginning of an application that can do just that.

## What it does
PostThread is a social media app first and a crypto app second. We hide all the crypto aspects from the user as most people aren't interested in it, but we believe it is important they have the ability to control their data should they choose to. At any time a user can take control of their assets and tokens. Also, all data is stored publicly on the blockchain or hosted on IPFS, so it can not be abused by a centralized entity. We believe we can give the user more control in the future by encrypting the data and allowing the user to provide a key to those they wish to share the data with.

Each day users are paid tokens depending on their user and social score. The user score is determined by their contributions to the site such as posting good content, curating the site by voting or linking to their web2 social media accounts. Their social score come strictly from who is following them. Using graph theory we can determine how important a user is in the overall social graph. Centralities are calculated and compared against all other users. Combining these two scores, I believe, results in a fair distribution of tokens each day and encourages users to contribute, curate and interact with the community.

## How we built it
The frontend was built using NextJS and Tailwinds for styling. The frontend stores all interactions into a database and uploads post and comment data to IPFS. The backend calls a solidity contract that mints data from the database. It also runs a nightly script that calculates users level, social score and tokens earned that day as well as transfers tokens that users have claimed.

Using the Reddit API, the top 100 posts are pulled every hour and saved to the database. We decided against minting all the posts to the blockchain due to the large cost involved. The posts metadata is uploaded to IPFS with the hash being stored on chain. We use Supabase as our database storage and query it using GraphQL. We also setup a script that listens for new blocks and will add new data to the database if for instance someone uses the contract to mint a post to the blockchain.

## Airdrop
We set it up where a user can input their Reddit username to check how many tokens have been airdropped to them based off of their Reddit karma. They can claim these tokens by posting about the airdrop on Reddit. We think this type of marketing can be an easy way to piggyback off of web2. Content creators have proven their value in web2 and now with our web3 app we can directly pay them to advertise for us and to come over to our app.

## Accomplishments that we're proud of
We are proud of having a functioning site on Polygon Mainnet that any user can instantly use no matter if they come from a crypto background or not. We are also proud we were able to implement some of the economic ideas we had for the app like the daily rewards and airdrop. I think these are the key to attracting quality users which will lead to the exponential adoption of the platform we believe can happen. We have many more ideas for attracting quality users in the future as well.

## What's next for PostThread
We are hoping to gain some attention from this hackathon and use that to gain more developers and move this project to something we can focus on full-time. We think we have come closest to a functional user-friendly crypto social media app for the masses. Most crypto apps UI's are not up to the standards most web2 users are used to and are gated by wallet sign ins and transactions. I am proud that we were able to surpass those hurdles.
