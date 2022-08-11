import React from 'react'
import TimeAgo from 'react-timeago'

function ProfileCard({ username, profile_pic, created_at }) {
    return (
        <div className="bg-base-100 my-7 max-w-3xl border rounded-t-2xl rounded-b-2xl shadow-sm cursor-pointer">
            <div>
                <div className="flex flex-col items-center p-5">
                    <img src={profile_pic} className="object-cover w-full rounded-md" />
                    <div className="flex-col flex-1 mt-3">
                        <h4 className="font-bold text-3xl">{username}</h4>
                    </div>
                    <p className='text-sm'>Profile created: {' '}
                        <TimeAgo className="text-sm" date={created_at} />
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfileCard