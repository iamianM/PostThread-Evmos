import React, { useState, useEffect } from 'react'
import { useToasts } from 'react-toast-notifications'
import { useAppContext } from '../../context/AppContext'
import ProgressBar from './ProgressBar'
import { useQuery } from 'react-query'
import AnimateWheel from '../AnimateWheel'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const TxComponent = dynamic(() => import('../TxComponent'), { ssr: false })

export default function ProfileCard({ id, username, profilePic }) {

    const { data: userInfo, isLoading, isFetching } = useQuery("userInfo", fetchUserInfo);
    const dailyReward = Math.floor(userInfo?.payout_amount_left_to_claim)
    const userScore = isNaN(userInfo?.user_social_score) ? 0 : parseFloat(userInfo?.user_social_score).toFixed(3)

    const [percentage, setPercentage] = useState(0)
    const [score, setScore] = useState(0)
    const [spinner, setSpinner] = useState(false)
    const [level, setLevel] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)
    const [numFollowing, setNumFollowing] = useState(0)
    const [numFollowers, setNumFollowers] = useState(0)
    const [disabled, setDisabled] = useState(false);

    const context = useAppContext()
    const loggedUser = context.username
    const loggedId = context.id
    const isLoggedIn = context.isLoggedIn

    const { addToast } = useToasts()

    useEffect(() => {
        async function getExpInfo() {
            const response = await fetch(`/api/user/level/${id}`)
            const data = await response.json()
            const percentageToNextLevel = (data.exp * 100) / data.exp_to_next_level
            setPercentage(Math.floor(percentageToNextLevel))
            setLevel(data.level)
        }

        async function getIsFollowing() {
            const response = await fetch('/api/user/get/following?' + new URLSearchParams({
                user_msa_id: loggedId,
                user_msa_id_to_check: id
            }))
            const data = await response.json()
            setIsFollowing(data)
        }

        async function getFollowing() {
            const response = await fetch('/api/user/get/following?' + new URLSearchParams({
                user_msa_id: id,
            }))
            const data = await response.json()
            setNumFollowing(data.length)
        }

        async function getFollowers() {
            const response = await fetch('/api/user/get/followers?' + new URLSearchParams({
                user_msa_id: id,
            }))
            const data = await response.json()
            setNumFollowers(data.length)
        }

        async function fetchData() {
            if (id > 0) {
                getFollowers()
                getFollowing()
                getIsFollowing()
                getExpInfo()
            }
        }

        fetchData()

    }, [id])


    async function fetchUserInfo() {
        const response = await fetch('/api/user/dailypayout?' + new URLSearchParams({
            user_msa_id: loggedId
        }))
        return response.json()
    }


    async function dailyPayout() {
        setDisabled(true)
        if (dailyReward > 0) {
            addToast(`Request for ${dailyReward} tokens submitted!`, { appearance: 'info', autoDismiss: true })
            const response = await fetch('/api/user/dailypayout?' + new URLSearchParams({
                user_msa_id: loggedId,
            }),
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
            const data = await response.json()
            console.log(data)
            addToast(`You have claimed ${dailyReward} tokens!`, { appearance: 'success', autoDismiss: true })
        }
        else {
            addToast('You don&apos;t have any rewards left, come back tomorrow!', { appearance: 'info', autoDismiss: true })
        }

        setTimeout(() => {
            setDisabled(false);
        }, 600000)
    }

    const handleClick = async () => {
        console.log("click")
        let method = isFollowing ? 'unfollow' : 'follow'
        addToast(`Request to ${method} submitted!`, { appearance: 'info', autoDismiss: true })
        const response = await fetch(`/api/user/interact/${method}?` + new URLSearchParams({
            user_msa_id: loggedId,
            user_msa_id_to_interact_with: id,
            wait_for_inclusion: true
        }),
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        const data = await response.json()
        addToast(`Request to ${method} finalized on the blockchain!`, { appearance: 'success', autoDismiss: true })
        console.log(data)
    }

    return (
        <div className="w-1/5 md:w-1/5 md:mx-2">
            <div className="bg-base-200 p-3 border-t-4 border-primary">
                <div className="image overflow-hidden">
                    <img className="h-auto w-full mx-auto"
                        src={profilePic}
                        alt="" />
                </div>
                <h1 className="text-inherit font-bold text-xl leading-8 my-1">{username}</h1>
                <ul
                    className="bg-base-300 text-inherit py-2 px-3 mt-3 rounded shadow-sm">
                    <li className="flex items-center py-3">
                        {(loggedUser === username || !isLoggedIn) ? <></> :
                            <button className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-md" onClick={handleClick}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button >}
                    </li>
                    <li>
                        <ProgressBar percentage={percentage} level={level} />
                    </li>
                    <li>
                        <p className='mt-4 gap-3 flex'>Social score: {spinner ? <AnimateWheel stroke="stroke-primary" fill="fill-primary" /> : <>{userScore}</>}</p>
                    </li>
                    <li>
                        <p className='mt-4'>Followers: {numFollowers ?? 0}</p>
                    </li>
                    <li>
                        <p>Following: {numFollowing ?? 0}</p>
                    </li>
                    {
                        (loggedId === id) ?
                            <>
                                <li>
                                    <button className="w-full mt-4 bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex disabled:bg-base-200" onClick={dailyPayout} disabled={dailyReward <= 0 || disabled}>
                                        Get Reward💰 {isFetching ? <AnimateWheel stroke="stroke-primary-focus" fill="fill-primary-focus" /> : <>{dailyReward}</>}
                                    </button >
                                </li>
                                <li>
                                    <p className='mt-4'>Verify your wallet:</p>
                                </li>
                                <li>
                                    <TxComponent type="tron" />
                                </li>
                                <li>
                                    <TxComponent type="metamask" />
                                </li>
                                <li>
                                    <p className='mt-4 gap-3 flex'>Connect your accounts:</p>
                                    <Link href="/auth/signin">
                                        <a
                                            className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex">
                                            Connect
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <p className='mt-4 gap-3 flex'>Claim an aidrop:</p>
                                    <Link href="/airdrop">
                                        <a
                                            className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex">
                                            Airdrop
                                        </a>
                                    </Link>
                                </li>
                            </> :
                            <></>
                    }

                    {/* <li className="flex items-center py-3">
                        <span>Member since</span>
                        <span className="ml-auto">Nov 07, 2016</span>
                    </li> */}
                </ul>
            </div>
        </div>
    )
}
