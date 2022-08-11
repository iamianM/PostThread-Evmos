import { gql } from "@apollo/client"

export const ADD_POST = gql`
mutation AddPost(
    $body: String!, 
    $url: String!,
    $title: String!,
    $category_id: ID!,
    $user_id: ID! ) { 
    insertPost(
        body: $body,
        url: $url,
        title: $title,
        category_id: $category_id,
        user_id: $user_id
    ) {
        id
        body
        url
        title
        category_id
        user_id
        created_at
    }
}`

export const ADD_CATEGORY = gql`
mutation AddCategory(
    $name: String! ) { 
    insertCategory(name: $name) {
       id
       name
       created_at
    }
}`

export const ADD_USER = gql`
mutation AddUser(
    $username: String!, 
    $profile_pic: String!) { 
    insertUser(username: $username, profile_pic: $profile_pic) {
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
    $user_id: ID!) { 
    insertComment(
    post_id: $post_id,
    body: $body
    user_id: $user_id
  ) {
    id
    created_at
    body
    post_id,
    user_id
  }
}`

export const ADD_VOTE = gql`
mutation AddVote(
    $post_id: ID!,
    $up: Boolean!,
    $user_id: ID!) { 
    insertVote(
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
    insertFollow(
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
    deleteFollow(
    follower_id: $follower_id,
    following_id: $following_id
  ) {
    id
  }
}`