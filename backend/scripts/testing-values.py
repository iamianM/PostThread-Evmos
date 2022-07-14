
import json
import sqlite3
import pandas as pd
from scripts.web3_helpers import *

path = 'C:/tmp/'
bob = delegate
bob_msa_id = get_msa_id(delegate)

w3.eth.getBalance(bob.address)

con = sqlite3.connect('postthreadV1_write.db')
cur = con.cursor()

post_schema = "category STRING,title STRING,body STRING,url STRING,is_nsfw NUMERIC"
post_schemaId = addSchema(post_schema, wait_for_inclusion=True, wait_for_finalization=False)

comment_schema = "post_hash STRING,parent_hash STRING,depth NUMERIC,body STRING"
comment_schemaId = addSchema(comment_schema, wait_for_inclusion=True, wait_for_finalization=False)

vote_schema = "post_hash STRING,parent_hash STRING,parent_type STRING,num_votes NUMERIC"
vote_schemaId = addSchema(vote_schema, wait_for_inclusion=True, wait_for_finalization=False)

user_schema = "msa_id NUMERIC,username STRING,password STRING,profile_pic STRING,wallet_address STRING"
user_schemaId = addSchema(user_schema, wait_for_inclusion=True, wait_for_finalization=False)

follow_schema = "protagonist_msa_id NUMERIC,antagonist_msa_id NUMERIC,event STRING"
follow_schemaId = addSchema(follow_schema, wait_for_inclusion=True, wait_for_finalization=False)

link_schema = "account_type STRING,account_value STRING"
link_schemaId = addSchema(link_schema, wait_for_inclusion=True, wait_for_finalization=False)

payout_schema = "payout_amount NUMERIC"
payout_schemaId = addSchema(payout_schema, wait_for_inclusion=True, wait_for_finalization=False)

schemas = {
    "post": post_schemaId, "comment": comment_schemaId, 
    "vote": vote_schemaId, "user": user_schemaId, "follow": follow_schemaId, 
    "link": link_schemaId, "payout": payout_schemaId,
}
json.dump(schemas, open("schemas.json", "w"))

accounts = {}
for account in ['Alice', 'Charlie', 'Dave', 'Eve', 'Ferdie']:
    wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{account}password"])))
    user_msa_id = create_msa_with_delegator(wallet)
    print(user_msa_id, wallet.address)
    receipt_user = mint_user(user_msa_id, account, "password", "profile_pic", wallet, wait_for_inclusion=True)
    accounts[account] = user_msa_id

json.dump(accounts, open("accounts.json", "w"))


for name1, k1 in accounts.items():
    for name2, k2 in accounts.items():
        if k1 != k2:
            print(name1, name2)
            receipt = follow_user(k1, k2, True, wait_for_inclusion=True, wait_for_finalization=False)

receipt = follow_user(accounts['Dave'], accounts['Eve'], False, wait_for_inclusion=False, wait_for_finalization=False)
receipt = follow_user(accounts['Eve'], accounts['Dave'], False, wait_for_inclusion=False, wait_for_finalization=False)
receipt = follow_user(accounts['Dave'], accounts['Eve'], True, wait_for_inclusion=False, wait_for_finalization=False)

post_data = {
    "category": "test",
    "title": "test title",
    "body": "test post",
    "url": "",
    "is_nsfw": False
}

username = 'Charlie'
password = 'password'

user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{username}password"])))
user_msa_id = get_msa_id(user_wallet)

post_data_hash, receipt_post = mint_data(post_data, user_msa_id, schemas['post'], path+'posts/', 
                                         wait_for_inclusion=True, wait_for_finalization=False)

example_post = pd.read_sql_query(f"SELECT ipfs_hash FROM post WHERE msa_id_from_query = {accounts['Charlie']} LIMIT 1", con)['ipfs_hash'].iloc[0]
example_post

comment_data = {
    "post_hash": example_post,
    "parent_hash": example_post,
    "depth": 0,
    "body": "example comment 2",
}
username = 'Charlie'
password = 'password'

user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{username}password"])))
user_msa_id = get_msa_id(user_wallet)

comment_data_hash, receipt_comment = mint_data(comment_data, user_msa_id, schemas['comment'], path+'comments/', 
                                               wait_for_inclusion=True, wait_for_finalization=False)


account_type = "gmail"
account_value = "example@gmail.com"
link_data = '{' + f'"account_type": "{account_type}","account_value": "{account_value}"' + '}'

username = 'Charlie'
password = 'password'

user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{username}password"])))
user_msa_id = get_msa_id(user_wallet)

link_data_hash, receipt_link = mint_data(link_data, user_msa_id, schemas['link'], 
                                               wait_for_inclusion=True, wait_for_finalization=False)

data = '{' + f'"post_hash": "{example_post}","parent_hash": "{example_post}","parent_type": "post","num_votes": 1' + '}'
_, receipt = mint_data(data, user_msa_id, schemas['vote'], 
                    wait_for_inclusion=True, wait_for_finalization=False)


payout_amount = 1000
data = '{' + f'"payout_amount": {payout_amount}' + '}'
mint_data(data, user_msa_id, schemas['payout'], wait_for_inclusion=True, wait_for_finalization=False)


