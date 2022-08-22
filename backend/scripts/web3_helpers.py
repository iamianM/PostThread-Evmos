import json
from web3 import Web3
from eth_account.messages import encode_defunct
from eth_abi.packed import encode_abi_packed
from eth_utils import keccak
from web3.middleware import geth_poa_middleware
from brownie import network, config, PostThread, Thread, accounts, history

w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com/'))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# PRIVATE = json.load(open('.PRIVATE.json'))
# delegate = w3.eth.account.from_key(PRIVATE['KEY'])

# build = json.load(open("../backend/build/contracts/PostThread.json"))
prev = json.load(open("../backend/previous.json"))

previous = json.load(open("previous.json"))

from_dict1 = {"from": accounts.add(config["wallets"]["from_key"][3]), 'required_confs':5}
delegate = from_dict1["from"]
from_dict1_dont_wait = from_dict1
from_dict1_dont_wait['required_confs'] = 0

cur_network = network.show_active()
postthread_contract = PostThread.at(previous[cur_network]["postthread"])
thread_contract = Thread.at(previous[cur_network]["thread"])

schemas = json.load(open("schemas.json"))

def addSchema(schema, check=True, create=True, wait_for_inclusion=True, wait_for_finalization=False):
    schemaId = None
    if check:
        schemaCount = postthread_contract.getSchemaCount(from_dict1)
        for schemaId in range(schemaCount, 0, -1):
            try:
                foundSchema = postthread_contract.getSchema(schemaId, from_dict1)
            except Exception as e:
                print(e)
                continue
            if foundSchema == schema:
                return schemaId

    if create:
        if wait_for_inclusion or wait_for_finalization:
            tx_hash = postthread_contract.registerSchema(schema, from_dict1)
            tx_hash.wait(10)
            return postthread_contract.getSchemaCount(from_dict1)
        else:
            tx_hash = postthread_contract.registerSchema(schema, from_dict1_dont_wait)
            return postthread_contract.getSchemaCount(from_dict1)

def get_msa_id(wallet, create=False, wait_for_inclusion=True, wait_for_finalization=False):
    try:
        msa_id = postthread_contract.getMsaId(wallet.address, from_dict1)
    except Exception as e:
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

        private_key = delegator_wallet.private_key
        hash = keccak(encode_abi_packed(['uint256'],[delegate_msa_id]))
        message = encode_defunct(hexstr=hash.hex())
        sigs.append(w3.eth.account.sign_message(message, private_key=private_key).signature.hex())
        addresses.append(delegator_wallet.address)

    if len(addresses) > 0:
        tx_hash = postthread_contract.createSponsoredAccountsWithDelegation(addresses, sigs, from_dict1)
    
        if wait_for_inclusion or wait_for_finalization:
            tx_hash.wait(10)
            for i, address in enumerate(addresses):
                while msa_ids[i] is not None:
                    i += 1

                msa_ids[i] = postthread_contract.getMsaId(address, from_dict1)
            
    return msa_ids

def mint_data(messages, user_msa_ids, schemaId, wait_for_inclusion=True, wait_for_finalization=False):
    if wait_for_inclusion or wait_for_finalization:
        tx_hash = postthread_contract.addMessagesByOwner(user_msa_ids, int(schemaId), messages, from_dict1)
        tx_hash.wait(10)
        return tx_hash
    else:
        tx_hash = postthread_contract.addMessagesByOwner(user_msa_ids, int(schemaId), messages, from_dict1_dont_wait)

    return None