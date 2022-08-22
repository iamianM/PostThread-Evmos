import json
import time
from random import sample
import os
import shutil
from scripts.web3_helpers import *
from db_helpers import *
import math

new_announcement_time = 0
mints = {}
wallets = []
while True:
    if new_announcement_time != os.stat("new_announcements.txt").st_mtime:
        shutil.copyfile("new_announcements.txt", "new_announcements_copy.txt")
        with open("new_announcements.txt", "w") as f:
            pass

        with open("new_announcements_copy.txt", "r") as f:
            lines = f.readlines()
            for l in lines:
                l = json.loads(l)
                print(l)
                if l['type'] == "new_user":
                    wallets.append(accounts.add(l["private_key"]))
                elif l['type'] == "mint_data":
                    mints[l['schemaId']].append((l['message'], l['user_msa_id']))
                elif l['type'] == "mint_tokens":
                    thread_contract.mint(l["wallet"], l['amount'], from_dict1)

    if len(wallets) > 10:
        for i in range(math.floor(len(v) / 10)):
            wallets_sub = wallets[i * 10:(i + 1) * 10]
            tx_hash = create_msas_with_delegator(wallets_sub)
            insert_to_db("users", {"transaction_hash": tx_hash})
            supabase.table("users").update({"transaction_hash": tx_hash, "msa_id": tx_hash.return_value}).eq("id", ids).execute()
            
        wallets = wallets[(i+1)*10:]
        
    for k, v in mints.items():
        if len(v) > 10:
            for i in range(math.floor(len(v) / 10)):
                vv = v[i * 10:(i + 1) * 10]
                messages = [t[0] for t in vv]
                user_msa_ids = [t[1] for t in vv]
                tx_hash = mint_data(messages, user_msa_ids, k)
                insert_to_db("users", user_db_data)
                
            mints[k] = v[(i+1)*10:]

    time.sleep(600)
