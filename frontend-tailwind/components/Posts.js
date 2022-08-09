import Post from "./Post"

function Posts({ posts }) {

    return (
        <div>
            {posts.map(post => (
                <div key={post.id}>
                    <Post post={post} />
                </div>
            ))}
        </div>
    )
}

export default Posts