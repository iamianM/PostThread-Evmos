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