import Post from "./Post"

function Posts({ posts }) {

    return (
        <div>
            {posts.map(post => (
                <Post key={post.node?.id ?? post.id} post={post.node ?? post} showAddComment={true} />
            ))}
        </div>
    )
}

export default Posts