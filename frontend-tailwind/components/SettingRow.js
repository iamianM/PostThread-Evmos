import { SocialIcon } from 'react-social-icons';
import { PencilIcon, CheckCircleIcon } from "@heroicons/react/solid"
import { useState } from 'react'
import { UPDATE_USER_DISCORD, UPDATE_USER_EMAIL, UPDATE_USER_GITHUB, UPDATE_USER_REDDIT } from '../graphql/mutations'
import client from '../apollo-client';
import { GET_USER_SOCIAL_INFO } from '../graphql/queries';
import toast from "react-hot-toast"

function SettingRow({ social, value, id }) {

    const [disabled, setDisabled] = useState(true)
    const [text, setText] = useState('')

    const changeUserInfo = async (e) => {
        e.preventDefault()
        setDisabled(true)

        switch (social) {
            case "discord":
                await client.mutate({
                    mutation: UPDATE_USER_DISCORD,
                    variables: {
                        id: id,
                        value: text
                    },
                    refetchQueries: [{ query: GET_USER_SOCIAL_INFO, variables: { id: id } }]
                })
                break;
            case "reddit":
                await client.mutate({
                    mutation: UPDATE_USER_REDDIT,
                    variables: {
                        id: id,
                        value: text
                    },
                    refetchQueries: [{ query: GET_USER_SOCIAL_INFO, variables: { id: id } }]
                })
                break;
            case "email":
                await client.mutate({
                    mutation: UPDATE_USER_EMAIL,
                    variables: {
                        id: id,
                        value: text
                    },
                    refetchQueries: [{ query: GET_USER_SOCIAL_INFO, variables: { id: id } }]
                })
            case "github":
                await client.mutate({
                    mutation: UPDATE_USER_GITHUB,
                    variables: {
                        id: id,
                        value: text
                    },
                    refetchQueries: [{ query: GET_USER_SOCIAL_INFO, variables: { id: id } }]
                })
            default:
                break;
        }

        toast.success("Info updated!")
    }

    return (
        <div className="flex space-x-4 items-center p-4">
            <SocialIcon network={`${social}`} />
            <input
                onChange={(e) => setText(e.target.value)}
                className="rounded-xl h-12 bg-base-100 border-primary focus:ring-primary focus:border-primary flex-grow px-5 focus:outline-none disabled:bg-base-200"
                type="text"
                placeholder={value ? value : `${social}`}
                disabled={disabled} />
            {
                disabled ?
                    <button type='submit' onClick={(e) => {
                        e.preventDefault()
                        setDisabled(false)
                    }}>
                        <PencilIcon className="h-6 cursor-pointer text-neutral" />
                    </button> :
                    <button type='submit' onClick={(e) => {
                        changeUserInfo(e)
                    }}>
                        <CheckCircleIcon className="h-6 cursor-pointer text-success" />
                    </button>
            }
        </div>
    )
}

export default SettingRow