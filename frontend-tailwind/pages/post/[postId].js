import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import Comments from '../../components/Comments'
import ShowPost from '../../components/ShowPost'
import { GET_POST_BY_ID } from '../../graphql/queries'

function PostPage() {

    const router = useRouter()
    const { data } = useQuery(GET_POST_BY_ID, {
        variables: {
            id: router.query.postId
        }
    })

    const post = data?.getPostByPostId

    return (
        <div>
            <main className={`flex flex-col justify-center lg:grid lg:grid-cols-2 lg:gap-10 max-w-sm md:max-w-2xl lg:max-w-5xl 
        xl:max-w-6xl mx-auto`}>
                <section className="lg:col-span-1">
                    <ShowPost post={post} />
                </section>
                <section className="lg:col-span-1 mb-10">
                    <Comments id={router.query.postId} showAddComment={true} />
                </section>
            </main>
        </div>
    )
}

export default PostPage