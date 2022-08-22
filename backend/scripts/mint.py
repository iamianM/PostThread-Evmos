import json
import time
from random import sample
import os
import shutil
from scripts.web3_helpers import *
from db_helpers import *
import math

num_items_needed = 10

new_announcement_time = 0
mints = {v: [] for v in schemas.values()}
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
                    wallets.append((accounts.add(l["private_key"]), l['row_id']))
                elif l['type'] == "mint_data":
                    mints[l['schemaId']].append((l['message'], l['user_msa_id'], l['row_id']))
                elif l['type'] == "mint_tokens":
                    thread_contract.mint(l["wallet"], l['amount'], from_dict1)

    if len(wallets) > 1:
        i = 0
        for i in range(math.ceil(len(wallets) / num_items_needed)):
            wallets_sub = wallets[i * num_items_needed:(i + 1) * num_items_needed]
            w = [t[0] for t in wallets_sub]
            row_ids = [t[1] for t in wallets_sub]
            tx_hash = create_msas_with_delegator(w)
            for msa_id, row_id in zip(tx_hash, row_ids):
                supabase.table("users").update({"msa_id": msa_id}).eq("id", row_id).execute()
            
        wallets = wallets[(i+1)*num_items_needed:]
        
    for k, v in mints.items():
        if len(v) > 1:
            print(k)
            table_name = [schema for schema, schemaId in schemas.items() if schemaId == k][0]
            i = 0
            for i in range(math.ceil(len(v) / num_items_needed)):
                vv = v[i * num_items_needed:(i + 1) * num_items_needed]
                messages = [t[0] for t in vv]
                user_msa_ids = [int(t[1]) for t in vv]
                row_ids = [int(t[2]) for t in vv]
                tx_hash = mint_data(messages, user_msa_ids, k)
                for msa_id, row_id in zip(user_msa_ids, row_ids):
                    t = supabase.table(table_name+'s').update({"transaction_hash": history[-1].txid, "msa_id": msa_id}).eq("id", row_id).execute().data
                    if len(t) == 0 and table_name == "post":
                        t = supabase.table('comments').update({"transaction_hash": history[-1].txid, "msa_id": msa_id}).eq("id", row_id).execute().data
                
            mints[k] = v[(i+1)*num_items_needed:]

    time.sleep(600)
