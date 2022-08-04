import { gql } from "@apollo/client"

export const GET_CATEGORY_BY_NAME = gql`
query getCategoryByName(
    $name: String!) { 
    getCategoryByName(name: $name) {
        id
        name
        created_at
    }
}`