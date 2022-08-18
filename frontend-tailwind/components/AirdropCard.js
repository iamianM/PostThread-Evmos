//https://cointelegraph.com/news/nifty-news-fluf-world-and-snoop-dogg-fundraise-adidas-and-prada-nfts-wax-gifts-10m-nfts

export default function AirdropCard() {


    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
    }

    return (
        <div className="h-auto p-10 flex items-center justify-center">
            <div className="w-auto max-w-2xl bg-base-300 border rounded-lg text-center hover:shadow-lg align-center">
                <img src="/airdrop.png" className="rounded-t-lg" />
                <div className="flex justify-center">
                    <span className="flex-shrink-0 w-12 h-12 bg-primary-400 -mt-6 rounded-full">
                        <img alt="profil" src="/postthreadicon.png"
                            className="mx-auto object-cover rounded-full" />
                    </span>
                </div>

                {0 === 0 ?
                    <>
                        <p className="font-bold pt-3 pb-2"> PostThread Airdrop </p>
                        <p className="px-10 py-2 mb-5 text-gray-500">The PostThread airdrop rewards users with a number of tokens determined by their existing reddit karma. Insert your username to check how much tokens you can receive for free!</p>

                        <form className="m-4 flex justify-center" onSubmit={handleSubmit}>
                            <input id="username" className="rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-neutral-100" placeholder="username" />
                            <button type='submit' className="px-8 rounded-r-lg bg-primary text-inherit font-bold p-4 border-primary border-t border-b border-r">Check</button>
                        </form>
                    </> :
                    <><p className="font-bold pt-3 pb-2"> {`Airdrop value: 🧵`}  </p>
                        <p className="font-semibold pt-3 pb-2"> Post the following message on reddit to receive the thread tokens:  </p>
                        <p className="px-10 py-2 mb-5 text-gray-500 font-semibold">title</p>
                        <p className="px-10 py-2 mb-5 text-gray-500">body</p>
                        <button className="bg-primary px-4 py-2 mb-4 rounded-xl font-semibold text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none"
                        >
                            Claim!
                        </button>
                    </>}
            </div>
        </div >
    )
}
