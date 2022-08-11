import React from 'react'
import { JellyTriangle } from '@uiball/loaders'

function test() {
    return (
        <div className="flex w-full h-screen items-center justify-center p-10 text-3-xl text-gray-700">
            <JellyTriangle
                size={50}
                speed={1.4}
                className="text-gray-700"
            />
        </div>
    )
}

export default test