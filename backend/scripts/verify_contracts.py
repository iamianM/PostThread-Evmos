from brownie import (
    accounts,
    network,
    Messages,
    User,
    chain,
    config,
)
import random
import json

LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["hardhat", "development", "ganache", "mainnet-fork"]


def get_account(index=None, id=None):
    # accounts[0]
    # accounts.add("env")
    # accounts.load("id")
    if index:
        return accounts[index]
    if id:
        return accounts.load(id)
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return accounts[0]
    return accounts.add(config["wallets"]["from_key"])


use_previous = False
publish = False
previous = json.load(open("previous.json"))
if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
    publish_source = False
    cur_network = "local"
    accounts = accounts[:10]
    account = accounts[0]
    account2 = accounts[1]
else:
    publish_source = True
    cur_network = network.show_active()
    account = accounts.add(config["wallets"]["from_key"][0])
    account2 = accounts.add(config["wallets"]["from_key"][1])


from_dict1 = {"from": account}
from_dict2 = {"from": account2}

if use_previous:
    postthread = User.at(previous[cur_network]["postthread"])
else:
    postthread = User.deploy(from_dict1)

if cur_network not in previous:
    previous[cur_network] = {}

previous[cur_network] = {
    "postthread": postthread.address,
}

json.dump(previous, open("previous.json", "w"))


def main():
    if publish_source:
        User.publish_source(postthread)
