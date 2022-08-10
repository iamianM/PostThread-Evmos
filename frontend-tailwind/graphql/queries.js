import { gql } from "@apollo/client"

export const GET_ALL_POSTS = gql`
    query getPostList {
        getPostList {
    body
    category {
      name
    }
    title
    url
    user {
      username
      profile_pic
    }
    created_at
    id
  }
    }`

export const GET_CATEGORY_BY_NAME = gql`
query getCategoryByName(
    $name: String!) { 
    getCategoryByName(name: $name) {
        id
        name
        created_at
    }
}`

export const GET_USER_BY_USERNAME = gql`
query getUserByUsername(
    $username: String!) { 
      getUserByUsername(username: $username) {
        id
        created_at
    }
}`

export const GET_COMMENTS_BY_POST_ID = gql`
query getCommentUsingPost_id(
    $id: ID!) { 
      getCommentUsingPost_id(id: $id) {
      user {
        username
      }
      body
      created_at
  }
}`

export const GET_VOTES_BY_POST_ID = gql`
query getVoteUsingPost_id(
    $id: ID!) { 
      getVoteUsingPost_id(id: $id) {
        id
        created_at
        up
        post_id
        user_id
  }
}`
