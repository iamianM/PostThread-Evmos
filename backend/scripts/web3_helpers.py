import re
import json
import ipfshttpclient
from os import listdir
from os.path import isfile, join
from web3 import Web3
from eth_account.messages import encode_defunct
from eth_abi.packed import encode_abi_packed
from eth_utils import keccak
from brownie import network, config, PostThread, accounts

from web3 import Web3
w3 = Web3(Web3.HTTPProvider('https://bttc.trongrid.io'))

previous = json.load(open("previous.json"))

from_dict1 = {"from": accounts.add(config["wallets"]["from_key"][1]), 'required_confs':10}
delegate = from_dict1["from"]
from_dict1_dont_wait = from_dict1
from_dict1_dont_wait['required_confs'] = 0

cur_network = network.show_active()
postthread_contract = PostThread.at(previous[cur_network]["postthread"])


client = ipfshttpclient.connect()

schemas = json.load(open("schemas.json"))


def create_msa_and_mint_user(user_wallet, username, password, profile_pic):
    user_msa_id = create_msa_with_delegator(user_wallet, 
                                            wait_for_inclusion=True, wait_for_finalization=False)
    mint_user(user_msa_id, username, password, profile_pic, user_wallet, 
                wait_for_inclusion=False, wait_for_finalization=False)

def addSchema(schema, check=True, create=True, wait_for_inclusion=True, wait_for_finalization=False):
    schemaId = None
    if check:
        schemaCount = postthread_contract.getSchemaCount(from_dict1)
        for schemaId in range(schemaCount, 0, -1):
            foundSchema = postthread_contract.getSchema(schemaId, from_dict1)
            if foundSchema == schema:
                return schemaId

    if create:
        if wait_for_inclusion or wait_for_finalization:
            tx_hash = postthread_contract.registerSchema(schema, from_dict1)
        else:
            tx_hash = postthread_contract.registerSchema(schema, from_dict1_dont_wait)

            return postthread_contract.getSchemaCount(from_dict1)

def get_msa_id(wallet, create=False, wait_for_inclusion=True, wait_for_finalization=False):
    try:
        msa_id = postthread_contract.getMsaId(wallet.address, from_dict1)
    except:
        msa_id = None
    
    if not create:
        if msa_id is None:
            return None
        else:
            return msa_id

    if msa_id is None:        
        if wait_for_inclusion or wait_for_finalization:
            tx_hash = postthread_contract.createMsaId(wallet.address, from_dict1)
            tx_hash.wait(10)
            return postthread_contract.getMsaId(wallet.address, from_dict1)
        else:
            tx_hash = postthread_contract.createMsaId(wallet.address, from_dict1_dont_wait)
            return None

    return msa_id

delegate_msa_id = get_msa_id(delegate, create=True)
print(delegate_msa_id)

def create_msa_with_delegator(delegator_wallet, wait_for_inclusion=True, wait_for_finalization=False):
    msa_id = get_msa_id(delegator_wallet, create=False)
    if msa_id is not None:
        return msa_id

    private_key = delegator_wallet.privateKey
    hash = keccak(encode_abi_packed(['uint256'],[delegate_msa_id]))
    message = encode_defunct(hexstr=hash.hex())
    signed_message =  w3.eth.account.sign_message(message, private_key=private_key)
    
    if wait_for_inclusion or wait_for_finalization:
        try:
            tx_hash = postthread_contract.createSponsoredAccountWithDelegation(
                delegator_wallet.address, delegate.address, signed_message.signature.hex(), from_dict1
            )
        except:
            return None
        tx_hash.wait(10)
        msa_id = postthread_contract.getMsaId(delegator_wallet.address, from_dict1)
            
        return msa_id
    else:
        try:
            tx_hash = postthread_contract.createSponsoredAccountWithDelegation(
                delegator_wallet.address, delegate.address, signed_message.signature.hex(), from_dict1_dont_wait
            )
        except:
            return None
        return None

def mint_data(data, user_msa_id, schemaId, path=None, wait_for_inclusion=True, wait_for_finalization=False):
    if path is not None:
        # write to temp file first to get hash from ipfs
        json.dump(data, open(f"temp.json", "w"))
        data_hash = client.add('temp.json', only_hash=True)["Hash"]
        
        # use hash to check if we already added this post to the blockchain
        # if so then skip
        data_files = [f for f in listdir(path) if isfile(join(path, f))]
        file = f"{path}{data_hash}.json"
        if file in data_files:
            return data_hash, None

        json.dump(data, open(file, "w"))
        res_post = client.add(file)
        message = res_post["Hash"]
    else:
        message = data
    
    if wait_for_inclusion or wait_for_finalization:
        tx_hash = postthread_contract.addMessage(int(delegate_msa_id), int(user_msa_id), int(schemaId), f"{message}", from_dict1)
        tx_hash.wait(10)
        return message, None
    else:
        tx_hash = postthread_contract.addMessage(int(delegate_msa_id), int(user_msa_id), int(schemaId), f"{message}", from_dict1_dont_wait)

    return message, None

def mint_votes(user_msa_id, num_votes, parent_hash, post_data_hash, parent_type, wait_for_inclusion=False, wait_for_finalization=False):
    message = '{' + f'"post_hash": "{post_data_hash}", "parent_hash": "{parent_hash}","parent_type": "{parent_type}","num_votes": {num_votes}' + '}'
    _, receipt = mint_data(message, user_msa_id, schemas['vote'], path=None, 
                           wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)

    return receipt

def mint_user(user_msa_id, username, password, profile_pic, user_wallet, wait_for_inclusion=False, wait_for_finalization=False): 
    user_data = '{' + f'"msa_id": {user_msa_id},"username": "{username}","password": "{password}","profile_pic": "{profile_pic}","wallet_address": "{user_wallet.address}"' + '}'
    user_data_hash, receipt_user = mint_data(user_data, user_msa_id, schemas['user'],
                                             wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return receipt_user    

def follow_user(protagonist_msa_id, antagonist_msa_id, is_follow=True, wait_for_inclusion=False, wait_for_finalization=False):
    follow = "follow" if is_follow else "unfollow"
    message = '{' + f'"protagonist_msa_id": {protagonist_msa_id},"antagonist_msa_id": "{antagonist_msa_id}","event": "{follow}"' + '}'
    _, receipt_follow = mint_data(message, protagonist_msa_id, schemas['follow'], path=None, wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return receipt_follow