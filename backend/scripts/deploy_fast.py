from cgi import test
from brownie import accounts, chain
from scripts.helpers import *
from web3.auto import w3
from eth_account.messages import encode_defunct
from eth_abi.packed import encode_abi_packed
from eth_utils import keccak
import time


is_testnet = network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS
postthread, thread, account = deploy_contracts(accounts, use_previous=True, publish=False, testnet=is_testnet)

# mint msa ids
try:
    msa_id = postthread.getMsaId(account.address, {"from": account})
except:
    tx = postthread.createMsaId(account.address, {"from": account})
    time.sleep(10)
    msa_id = postthread.getMsaId(account.address, {"from": account})
    print(msa_id, account.address, tx.events)
    print("Msa_id match", postthread.getMsaId(account.address) == msa_id, {"from": account})

private_key = "0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09"
local = accounts.add(private_key=private_key)
hash = keccak(encode_abi_packed(['uint256'],[msa_id]))
message = encode_defunct(hexstr=hash.hex())
signed_message =  w3.eth.account.sign_message(message, private_key=private_key)

# tx = postthread.isValidUser(msa_id, str(signed_message.signature.hex()), local.address, {"from": account})

try:
    tx = postthread.createSponsoredAccountsWithDelegation([local.address], [signed_message.signature.hex()], {"from": account})
    time.sleep(10)
except:
    pass
delegate_msa_id = postthread.getMsaId(local.address, {"from": account})
print("Msas", msa_id, delegate_msa_id)

# mint schemas
post_schema = "category STRING,title STRING,body STRING,url STRING,is_nsfw NUMERIC"
tx = postthread.registerSchema(post_schema, {"from": account})
time.sleep(10)
post_schemaId = postthread.getSchemaCount({"from": account})
print("schemas match", postthread.getSchema(post_schemaId, {"from": account}) == post_schema)

if is_testnet:
    # mint message
    payload = 'Qdfpve3tf34fi03mv3f3pvsv'
    tx = postthread.addMessagesByOwner([delegate_msa_id] * 10, post_schemaId, [payload] * 10, {"from": account})
    tx = postthread.addMessagesByProvider([delegate_msa_id] * 10, post_schemaId, [payload] * 10, {"from": account})
    tx = postthread.addMessagesByUser(post_schemaId, [payload] * 10, {"from": account})

    tx = postthread.getMessages(post_schemaId, 0, {"from": account})
    print(tx)
    tx = postthread.getMessages(post_schemaId, 1, {"from": account})
    print(tx)
    tx = postthread.getMessages(post_schemaId, 2, {"from": account})
    print(tx)
    tx = postthread.getMessages(post_schemaId, 3, {"from": account})
    print(tx)
    tx = postthread.getMessages(post_schemaId, 4, {"from": account})
    print(tx)
    # print(tx.error())
    # print(tx.return_value)

    # account.transfer(to=local.address, amount=100)
    tx = postthread.getDelegatedMsaId(account, {"from": account})
    print(tx)
    tx = postthread.revokeMsaDelegationByProvider(local.address, {"from": account})
    tx = postthread.getDelegatedMsaId(account, {"from": account})
    print(tx)

    tx = postthread.getMsaId(account, {"from": account})
    hash = keccak(encode_abi_packed(['uint256'],[tx]))
    message = encode_defunct(hexstr=hash.hex())
    private_key = config["wallets"]["from_key"][3] if not is_testnet else "980dc5383d458f17e4414b7d60613374554028ae4096d04e795424ffc1843961"
    signed_message =  w3.eth.account.sign_message(message, private_key=private_key)
    tx = postthread.addProviderToMsa(account, signed_message.signature.hex(), {"from": local})
    tx = postthread.getDelegatedMsaId(account, {"from": account})
    print(tx)
    tx = postthread.revokeMsaDelegationByDelegator(account, {"from": local})
    tx = postthread.getDelegatedMsaId(account, {"from": account})
    print(tx)

    # mint and transfer thread tokens
    print(thread.balanceOf(account, {"from": account}))
    print(thread.mint(account, 1000, {"from": account}))
    print(thread.balanceOf(account, {"from": account}))
    print(thread.multiMint([account]*5, [5]*5, {"from": account}))
    print(thread.balanceOf(account, {"from": account}))

def main():
    pass
