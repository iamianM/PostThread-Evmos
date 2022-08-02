import React from 'react'

export default function ThemeSelector() {
    return (
        <div className="m-5">
            <select data-choose-theme className="focus:outline-none h-10 rounded-full focus:ring-primary focus:border-primary px-3 border bg-secondary">
                <option value="light">🌕</option>
                <option value="dark">🌑</option>
                <option value="halloween">🎃</option>
                <option value="bumblebee">🐝</option>
                <option value="emerald">🪲</option>
                <option value="corporate">👔</option>
                <option value="synthwave">🎧</option>
                <option value="retro">💾</option>
                <option value="cyberpunk">🤖</option>
                <option value="forest">🌲</option>
                <option value="aqua">💧</option>
                <option value="lofi">🔉</option>
                <option value="fantasy">🐉</option>
                <option value="dracula">🧛‍♂️</option>
                <option value="coffee">☕️</option>
            </select>
        </div>
    )
}
