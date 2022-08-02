import { useEffect } from "react"
import { useState } from "react"
import { faker } from "@faker-js/faker";


function Trending() {

    const topics = [
        {
            id: 1,
            name: "Bitcoin",
            img: "https://www.cryptocompare.com/media/19633/btc.png",
        },
        {
            id: 2,
            name: "Ethereum",
            img: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        },
        {
            id: 3,
            name: "Litecoin",
            img: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
        },
        {
            id: 4,
            name: "DogeCoin",
            img: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
        },
        {
            id: 5,
            name: "Polygon",
            img: "https://cryptologos.cc/logos/polygon-matic-logo.png",
        }
    ]

    return (
        <div className="mt-4 ml-10 my-7 p-5 border rounded-t-2xl rounded-b-2xl shadow-sm">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Trending topics</h3>
                <button className="text-gray-600 font-semibold">See All</button>
            </div>
            {
                topics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between mt-3">
                        <img className="w-10 h-10 rounded-full border p-[2px]" src={topic.img} />
                        <div className="flex-1 ml-4">
                            <h2 className="font-semibold text-sm">{topic.name}</h2>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default Trending