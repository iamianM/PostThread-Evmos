import { gql } from "@apollo/client"

export const GET_ALL_POSTS = gql`
    query getAllPosts {
        getPostList {
    body
    category {
      name
    }
    commentList {
      body
      user {
        username
        profile_pic
        commentList {
          id
        }
      }
      created_at
    }
    title
    url
    user {
      username
      profile_pic
    }
    created_at
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