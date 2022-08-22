import { gql } from "@apollo/client"

export const ADD_POST = gql`
mutation AddPost(
    $body: String!, 
    $url: String!,
    $title: String!,
    $category_id: ID!,
    $user_id: ID!,
    $ipfs_hash: String! ) { 
    insertPosts(
        body: $body,
        url: $url,
        title: $title,
        category_id: $category_id,
        user_id: $user_id,
        ipfs_hash: $ipfs_hash
    ) {
        id
        body
        url
        title
        category_id
        user_id
        created_at
        ipfs_hash
    }
}`

export const ADD_CATEGORY = gql`
mutation AddCategory(
    $name: String! ) { 
    insertCategories(name: $name) {
       id
       name
       created_at
    }
}`

export const ADD_USER = gql`
mutation AddUser(
    $username: String!, 
    $profile_pic: String!) { 
    insertUsers(username: $username, profile_pic: $profile_pic) {
       id
       username
       profile_pic
       created_at
    }
}`

export const ADD_COMMENT = gql`
mutation AddComment(
    $post_id: ID!,
    $body: String!,
    $user_id: ID!,
    $ipfs_hash: String!) { 
    insertComments(
    post_id: $post_id,
    body: $body
    user_id: $user_id
    ipfs_hash: $ipfs_hash
  ) {
    id
    created_at
    body
    post_id,
    user_id
    ipfs_hash
  }
}`

export const ADD_VOTE = gql`
mutation AddVote(
    $post_id: ID!,
    $up: Boolean!,
    $user_id: ID!) { 
    insertVotes(
    post_id: $post_id,
    up: $up
    user_id: $user_id
  ) {
    id
    created_at
    up
    post_id,
    user_id
  }
}`

export const ADD_FOLLOW = gql`
mutation AddFollow(
    $follower_id: ID!,
    $following_id: ID!) { 
    insertFollows(
    follower_id: $follower_id,
    following_id: $following_id
  ) {
    id
    created_at
    follower_id
    following_id
  }
}`

export const REMOVE_FOLLOW = gql`
mutation deleteFollow(
    $follower_id: ID!,
    $following_id: ID!) { 
    deleteFollows(
    follower_id: $follower_id,
    following_id: $following_id
  ) {
    id
  }
}`

export const UPDATE_USER_TOKENS_CLAIMED = gql`
mutation updateUserDailyPayoutClaimed($id: BigInt!, $claimed: Boolean!) {
    updateusersCollection(set: {tokens_claimed: $claimed}, filter: {id: {eq: $id}}) {
      records {
      username
      id
    }
    }
}`

export const UPDATE_USER_DISCORD = gql`
mutation updateUserInfo($id: BigInt!, $value: String!) {
    updateusersCollection(set: {discord_username: $value}, filter: {id: {eq: $id}}) {
      records {
      username
      id
    }
    }
}`

export const UPDATE_USER_REDDIT = gql`
mutation updateUserInfo($id: BigInt!, $value: String!) {
    updateusersCollection(set: {reddit_username: $value}, filter: {id: {eq: $id}}) {
      records {
      username
      id
    }
    }
}`

export const UPDATE_USER_EMAIL = gql`
mutation updateUserInfo($id: BigInt!, $value: String!) {
    updateusersCollection(set: {email: $value}, filter: {id: {eq: $id}}) {
      records {
      username
      id
    }
    }
}`

export const UPDATE_USER_GITHUB = gql`
mutation updateUserInfo($id: BigInt!, $value: String!) {
    updateusersCollection(set: {github_username: $value}, filter: {id: {eq: $id}}) {
      records {
      username
      id
    }
    }
}`


export const UPDATE_USER_WALLET = gql`
mutation updateUserInfo($id: BigInt!, $value: String!) {
    updateusersCollection(set: {wallet_address_personal: $value}, filter: {id: {eq: $id}}) {
      records {
      username
      id
    }
    }
}`

export const UPDATE_USER_AIRDROP_STATUS = gql`
mutation updateUserAirdropStatus($id: BigInt!, $value: String!) {
    updateusersCollection(set: {reddit_airdrop_claimed: $value}, filter: {id: {eq: $id}}) {
      records {
      username
      id
    }
    }
}`

export const UPDATE_SIGNATURE = gql`
mutation updateUserSignature($id: BigInt!, $value: String!) {
    updateusersCollection(set: {signature: $value}, filter: {id: {eq: $id}}) {
      records {
      id
    }
    }
}`
