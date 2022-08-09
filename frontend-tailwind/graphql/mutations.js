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