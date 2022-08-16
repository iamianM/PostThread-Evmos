import Post from "./Post"
import { uuid } from 'uuidv4';


function Posts({ posts }) {

    return (
        <div>
            {posts.map(post => (
                <Post key={uuid()} post={post} showAddComment={true} />
            ))}
        </div>
    )
}

export default Posts