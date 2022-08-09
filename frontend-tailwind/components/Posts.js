import Post from "./Post"

function Posts({ posts }) {

    return (
        <div>
            {posts.map(post => (
                <Post key={post.id} post={post} />
            ))}
        </div>
    )
}

export default Posts