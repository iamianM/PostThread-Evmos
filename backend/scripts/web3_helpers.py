import re
import json
import ipfshttpclient
from os import listdir
from os.path import isfile, join
from web3 import Web3
from eth_account.messages import encode_defunct
from eth_abi.packed import encode_abi_packed
from eth_utils import keccak


w3 = Web3(Web3.HTTPProvider('HTTP://127.0.0.1:8545'))

PRIVATE = json.load(open('.PRIVATE.json'))
delegate = w3.eth.account.from_key(PRIVATE['KEY'])

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
        tx_hash = postthread_contract.functions.registerSchema(schema).transact()
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
        print('that', e)
        msa_id = None
    
    if not create:
        if msa_id is None:
            return None
        else:
            return msa_id

    if msa_id is None:
        try:
            tx_hash = postthread_contract.functions.createMsaId(wallet.address).transact()
        except Exception as e:
            print('this', e)
            return -1
        
        if wait_for_inclusion or wait_for_finalization:
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            return postthread_contract.functions.getMsaId(wallet.address).call()

    return msa_id

delegate_msa_id = get_msa_id(delegate)

def create_msas_with_delegator(delegator_wallets, wait_for_inclusion=True, wait_for_finalization=False):
    msa_ids = [None] * len(delegator_wallets)
    sigs = []
    addresses = []
    for i, delegator_wallet in enumerate(delegator_wallets):
        msa_id = get_msa_id(delegator_wallet, create=False)
        if msa_id is not None:
            msa_ids[i] =  msa_id
            continue

        private_key = delegator_wallet.privateKey.hex()
        hash = keccak(encode_abi_packed(['uint256'],[delegate_msa_id]))
        message = encode_defunct(hexstr=hash.hex())
        sigs =  w3.eth.account.sign_message(message, private_key=private_key).signature.hex()
        addresses.append(delegator_wallet.address)

    tx_hash = postthread_contract.functions.createSponsoredAccountsWithDelegation(addresses, delegate.address, sigs).transact()
    
    if wait_for_inclusion or wait_for_finalization:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        for i, delegator_wallet in enumerate(addresses):
            while msa_ids[i] is not None:
                i += 1

            msa_ids[i] = postthread_contract.functions.getMsaId(addresses).call()
            
    return msa_ids

def mint_data(datas, user_msa_ids, schemaId, path=None, wait_for_inclusion=True, wait_for_finalization=False):
    messages = []
    if path is not None:
        for data in datas:
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
            messages.append(str(res_post["Hash"]))
    else:
        for data in datas:
            messages.append(str(data))

    tx_hash = postthread_contract.functions.addMessages(int(delegate_msa_id), user_msa_ids, int(schemaId), messages).transact()
    
    if wait_for_inclusion or wait_for_finalization:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt

    return None

def mint_votes(user_msa_id, num_votes, parent_hash, post_data_hash, parent_type, wait_for_inclusion=False, wait_for_finalization=False):
    message = '{' + f'"post_hash": "{post_data_hash}", "parent_hash": "{parent_hash}","parent_type": "{parent_type}","num_votes": {num_votes}' + '}'
    receipt = mint_data(message, user_msa_id, schemas['vote'], path=None, 
                           wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)

    return receipt

def mint_user(user_msa_id, user_data, wait_for_inclusion=False, wait_for_finalization=False): 
    receipt_user = mint_data(user_data, user_msa_id, schemas['user'],
                                             wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return receipt_user    

def follow_user(protagonist_msa_id, antagonist_msa_id, is_follow=True, wait_for_inclusion=False, wait_for_finalization=False):
    follow = "follow" if is_follow else "unfollow"
    message = '{' + f'"protagonist_msa_id": {protagonist_msa_id},"antagonist_msa_id": "{antagonist_msa_id}","event": "{follow}"' + '}'
    receipt_follow = mint_data(message, protagonist_msa_id, schemas['follow'], path=None, wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return receipt_follow