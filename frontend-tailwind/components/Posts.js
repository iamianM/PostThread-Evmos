import Post from "./Post"

function Posts({ posts }) {

    return (
        <div>
            {posts.map(post => (
                <Post key={post.id} post={post} showAddComment={true} />
            ))}
        </div>
    )
}

export default Posts