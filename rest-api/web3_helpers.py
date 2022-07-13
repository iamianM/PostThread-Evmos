import re
import json
import ipfshttpclient
from os import listdir
from os.path import isfile, join
from web3 import Web3, EthereumTesterProvider
from eth_account.messages import encode_defunct
from eth_abi.packed import encode_abi_packed
from eth_utils import keccak

w3 = Web3(EthereumTesterProvider())
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
w3.eth.account.enable_unaudited_hdwallet_features()

MNEMONIC = json.load(open('.MNEMONIC.json'))
delegate = w3.eth.account.from_mnemonic(MNEMONIC['KEY'])

build = json.load(open("../backend/build/contracts/PostThread.json"))
prev = json.load(open("../backend/previous.json"))

postthread_contract = w3.eth.contract(
    address=prev['local']['postthread'],
    abi=build['abi']
)

client = ipfshttpclient.connect()

schemas = json.load(open("schemas.json"))

def addSchema(schema, check=True, create=True, wait_for_inclusion=True, wait_for_finalization=False):
    schemaId = None
    if check:
        schemaCount = postthread_contract.functions.getSchemaCount().call()
        for schemaId in range(schemaCount, 0, -1):
            try:
                foundSchema = postthread_contract.functions.getSchema(schemaId).call()
            except Exception as e:
                print(e)
                continue
            if foundSchema == schema:
                return schemaId

    if create:
        tx_hash = postthread_contract.functions.registerSchema(schema).transact({'from': delegate.address})
        if wait_for_inclusion or wait_for_finalization:
            try:
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            except Exception as e:
                print(e)
                return -1
            return postthread_contract.functions.getSchemaCount().call()

def get_msa_id(wallet, create=False, wait_for_inclusion=True, wait_for_finalization=False):
    try:
        msa_id = postthread_contract.functions.getMsaId(wallet.address).call()
    except Exception as e:
        # print(e)
        msa_id = None
    
    if not create:
        if msa_id is None:
            return None
        else:
            return msa_id

    if msa_id is None:
        try:
            tx_hash = postthread_contract.functions.createMsaId(wallet.address).transact({'from': delegate.address})
        except Exception as e:
            print(e)
            return -1
        
        if wait_for_inclusion or wait_for_finalization:
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            return postthread_contract.functions.getMsaId(wallet.address).call()

    return msa_id

delegate_msa_id = get_msa_id(delegate)

def create_msa_with_delegator(delegator_wallet, wait_for_inclusion=True, wait_for_finalization=False):
    msa_id = get_msa_id(delegator_wallet, create=False)
    if msa_id is not None:
        return msa_id

    private_key = delegator_wallet.privateKey.hex()
    hash = keccak(encode_abi_packed(['uint256'],[delegate_msa_id]))
    message = encode_defunct(hexstr=hash.hex())
    signed_message =  w3.eth.account.sign_message(message, private_key=private_key)

    try:
        tx_hash = postthread_contract.functions.createSponsoredAccountWithDelegation(
            delegator_wallet.address, delegate.address, signed_message.signature.hex()
        ).transact({'from': delegate.address})
    except Exception as e:
        # print(e)
        return -1
    
    if wait_for_inclusion or wait_for_finalization:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        msa_id = postthread_contract.functions.getMsaId(delegator_wallet.address).call()
            
        return msa_id
    else:
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

    try:
        tx_hash = postthread_contract.functions.addMessage(delegate_msa_id, user_msa_id, schemaId, f"{message}").transact({'from': delegate.address})
    except Exception as e:
        print(e)
        return message, -1
    
    if wait_for_inclusion or wait_for_finalization:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return message, receipt

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