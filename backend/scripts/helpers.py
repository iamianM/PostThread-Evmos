from brownie import network, config, PostThread
import json


LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["hardhat", "development", "ganache", "mainnet-fork"]


def get_account(accounts, index=None, id=None):
    # accounts[0]
    # accounts.add("env")
    # accounts.load("id")
    if index:
        return accounts[index]
    if id:
        return accounts.load(id)
    return accounts.add(config["wallets"]["from_key"])


def deploy_contracts(accounts, use_previous=False, publish=True, testnet=False):
    previous = json.load(open("previous.json"))

    if testnet:
        from_dict1 = {"from": accounts.add(config["wallets"]["from_key"][0])}
        from_dict2 = {"from": accounts.add(config["wallets"]["from_key"][1])}
    else:
        from_dict1 = {"from": accounts[0]}
        from_dict2 = {"from": accounts[1]}

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        publish_source = False
        cur_network = "local"
        accounts = accounts[:10]
        account = accounts[0]
    else:
        publish_source = True
        cur_network = network.show_active()
        # accounts.load("main2")
        # accounts.load("new")

    if use_previous:
        postthread = PostThread.at(previous[cur_network]["postthread"])

        return postthread
    else:
        postthread = PostThread.deploy(from_dict1)

    if cur_network not in previous:
        previous[cur_network] = {}

    previous[cur_network] = {
        "postthread": postthread.address,
    }

    json.dump(previous, open("previous.json", "w"))

    if publish and not network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        PostThread.publish_source(postthread)


    return postthread
