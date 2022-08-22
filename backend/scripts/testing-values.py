
import json
from scripts.web3_helpers import *

# Minting Schemas
ipfs_schema = "ipfs_hash STRING"
ipfs_schemaId = addSchema(ipfs_schema, wait_for_inclusion=True, wait_for_finalization=False)

vote_schema = "post_hash STRING,parent_hash STRING,parent_type STRING,num_votes NUMERIC"
vote_schemaId = addSchema(vote_schema, wait_for_inclusion=True, wait_for_finalization=False)

user_schema = "msa_id NUMERIC,username STRING,profile_pic STRING,wallet_address STRING"
user_schemaId = addSchema(user_schema, wait_for_inclusion=True, wait_for_finalization=False)

follow_schema = "protagonist_msa_id NUMERIC,antagonist_msa_id NUMERIC,event STRING"
follow_schemaId = addSchema(follow_schema, wait_for_inclusion=True, wait_for_finalization=False)

link_schema = "account_type STRING,account_value STRING"
link_schemaId = addSchema(link_schema, wait_for_inclusion=True, wait_for_finalization=False)

payout_schema = "payout_amount NUMERIC"
payout_schemaId = addSchema(payout_schema, wait_for_inclusion=True, wait_for_finalization=False)

schemas = {
    "post": ipfs_schemaId, "comment": ipfs_schemaId, 
    "vote": vote_schemaId, "user": user_schemaId, "follow": follow_schemaId, 
    "link": link_schemaId, "payout": payout_schemaId,
}
json.dump(schemas, open("schemas.json", "w"))

# Creating Msas
wallets = []
names = ['Alice', 'Charlie', 'Dave', 'Eve', 'Ferdie']
for account in names:
    wallets.append(w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{account}password"]))))

user_msa_ids = create_msas_with_delegator(wallets)

# Minting Users
messages = []
for user_msa_id, wallet in zip(user_msa_ids, wallets):
    print(user_msa_id, wallet.address)
    messages.append(mint_user(user_msa_id, "profile_pic", wallet))  
    
receipt_user = mint_data(messages, user_msa_ids, schemas['user'])

accounts = {}
for name, wallet in zip(names, wallets):
    get_msa_id(wallet)
    accounts[name] = user_msa_id

json.dump(accounts, open("accounts.json", "w"))

# Following
messages = []
messages_ids = []
for name1, k1 in accounts.items():
    for name2, k2 in accounts.items():
        if k1 != k2:
            print(name1, name2)
            messages.append(follow_user(k1, k2, True))
            messages_ids.append(k1)

messages.append(follow_user(accounts['Dave'], accounts['Eve'], False))
messages.append(follow_user(accounts['Eve'], accounts['Dave'], False))
messages.append(follow_user(accounts['Dave'], accounts['Eve'], True))
messages_ids.extend([accounts['Dave'], accounts['Eve'], accounts['Dave']])

receipt_follow = mint_data(messages, messages_ids, schemas['follow'])

# Posting messages
# post_data = {}

# username = 'Charlie'
# password = 'password'

# user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{username}password"])))
# user_msa_id = get_msa_id(user_wallet)

# receipt_post = mint_data(post_data, user_msa_id, schemas['post'])

# example_post = pd.read_sql_query(f"SELECT ipfs_hash FROM post WHERE msa_id_from_query = {accounts['Charlie']} LIMIT 1", con)['ipfs_hash'].iloc[0]
# example_post

# comment_data = {
#     "post_hash": example_post,
#     "parent_hash": example_post,
#     "depth": 0,
#     "body": "example comment 2",
# }
# username = 'Charlie'
# password = 'password'

# user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{username}password"])))
# user_msa_id = get_msa_id(user_wallet)

# comment_data_hash, receipt_comment = mint_data(comment_data, user_msa_id, schemas['comment'], path+'comments/', 
#                                                wait_for_inclusion=True, wait_for_finalization=False)


# account_type = "gmail"
# account_value = "example@gmail.com"
# link_data = '{' + f'"account_type": "{account_type}","account_value": "{account_value}"' + '}'

# username = 'Charlie'
# password = 'password'

# user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{username}password"])))
# user_msa_id = get_msa_id(user_wallet)

# link_data_hash, receipt_link = mint_data(link_data, user_msa_id, schemas['link'], 
#                                                wait_for_inclusion=True, wait_for_finalization=False)

# data = '{' + f'"post_hash": "{example_post}","parent_hash": "{example_post}","parent_type": "post","num_votes": 1' + '}'
# _, receipt = mint_data(data, user_msa_id, schemas['vote'], 
#                     wait_for_inclusion=True, wait_for_finalization=False)


# payout_amount = 1000
# data = '{' + f'"payout_amount": {payout_amount}' + '}'
# mint_data(data, user_msa_id, schemas['payout'], wait_for_inclusion=True, wait_for_finalization=False)


