import { useSession } from 'next-auth/react';
import SettingRow from './SettingRow';
import { useQuery } from '@apollo/client'
import { GET_USER_SOCIAL_INFO } from '../graphql/queries'
import SignMessage from './SignMessage';

function Settings({ id }) {

    const { data } = useQuery(GET_USER_SOCIAL_INFO, {
        variables: {
            id: id
        }
    })

    return (
        <form className="bg-base-100 p-2 rounded-2xl shadow-lg border text-base-content font-medium mt-10">
            <SettingRow social="email" value={data?.getUsers?.email} id={id} />
            <SettingRow social="reddit" value={data?.getUsers?.reddit_username} id={id} />
            <SettingRow social="discord" value={data?.getUsers?.discord_username} id={id} />
            <SettingRow social="github" value={data?.getUsers?.github_username} id={id} />
            <SignMessage wallet={data?.getUsers?.wallet_address_personal} />
        </form>
    )
}

export default Settings