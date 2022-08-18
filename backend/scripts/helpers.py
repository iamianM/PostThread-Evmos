from brownie import network, config, PostThread, Thread
import json


LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["hardhat", "development", "ganache", "mainnet-fork", "local"]


def deploy_contracts(accounts, use_previous=False, publish=False, testnet=False):
    previous = json.load(open("previous.json"))

    if not testnet:
        from_dict1 = {"from": accounts.add(config["wallets"]["from_key"][3])}
    else:
        from_dict1 = {"from": accounts[0]}

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        cur_network = "local"
        accounts = accounts[:10]
        account = from_dict1['from']
    else:
        cur_network = network.show_active()
        account = from_dict1['from']
        # accounts.load("main2")
        # accounts.load("new")

    if use_previous:
        postthread = PostThread.at(previous[cur_network]["postthread"])
        thread = Thread.at(previous[cur_network]["thread"])

        return postthread, thread, account
    else:
        postthread = PostThread.deploy(from_dict1)
        thread = Thread.deploy(from_dict1)

    if cur_network not in previous:
        previous[cur_network] = {}

    previous[cur_network] = {
        "postthread": postthread.address,
        "thread": thread.address,
    }

    json.dump(previous, open("previous.json", "w"))

    if publish and not network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        PostThread.publish_source(postthread)
        Thread.publish_source(thread)


    return postthread, thread, account
