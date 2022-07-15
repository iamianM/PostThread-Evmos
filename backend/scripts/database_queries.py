import datetime
import ipfshttpclient
import time
import json
import pandas as pd
import sqlite3
from scripts.web3_helpers import *

schemas = json.load(open("schemas.json", "r"))

client = ipfshttpclient.connect()
    
extrinsics = {}

con = sqlite3.connect('postthreadV1_write.db')
cur = con.cursor()

def get_posts():
    return pd.read_sql_query("SELECT * FROM post", con)

def update_db(start_block=0, backfill=True, schemaToUpdate=None, query_start=False):        
    current_block = w3.eth.get_block_number()
    date_format = "%Y-%m-%d %H:%M:%S"

    for schemaName, schemaId in schemas.items():
        if query_start:
            query = f"""SELECT block_number FROM {schemaName} ORDER BY date_minted DESC LIMIT 1"""
            temp = pd.read_sql_query(query, con)['block_number']
            if temp.size == 0:
                start_block = 0
            else:
                start_block = int(temp.iloc[0]) + 1
            
        if schemaToUpdate is not None and schemaName != schemaToUpdate:
            print(f"Skipping {schemaName}")
            continue
        
        schemaValue = postthread_contract.getSchema(schemaId, from_dict1)

        extraValues = "block_number INTEGER,msa_id_from_query INTEGER,provider_key STRING,date_minted DATE"
        is_ipfs_hash = schemaName in ["post", "comment"]
        if is_ipfs_hash:
            extraValues += ",ipfs_hash STRING"

        if backfill:
            # Delete table if exists and then create it
            cur.execute(f"DROP TABLE IF EXISTS {schemaName}")
            
            names = ','.join([v.split(' ')[0] for v in schemaValue.split(',') + extraValues.split(',')])
            create_table = f"CREATE TABLE {schemaName} ({schemaValue}, {extraValues}, UNIQUE({names}))"
            cur.execute(create_table)

        offset = 0
        contents = list(postthread_contract.getMessages(schemaId, offset, from_dict1) )

        while contents[-1][0] != 0:
            offset += 1
            print(offset, len(contents), contents)
            contents.extend(list(postthread_contract.getMessages(schemaId, offset, from_dict1)))

        table_values = []
        count = 0
        for content in contents:
            if content[3] < start_block:
                continue

            count += 1
            timestamp = content[4]
            date_time = datetime.datetime.fromtimestamp(timestamp)
            date_str = date_time.strftime(date_format)

            row_raw = content[2]
            ipfs_hash = None
            if is_ipfs_hash:
                ipfs_hash = row_raw.strip("'")
                try:
                    print(ipfs_hash)
                    row_raw = client.cat(ipfs_hash).decode()
                except:
                    print("Failed to get ipfs hash ", ipfs_hash)
                    continue

            if type(row_raw) != dict:
                try:
                    row_raw = row_raw.replace("'", '"')
                    row = json.loads(row_raw)
                except:
                    print("Failed to parse json", row_raw)
                    continue

            row_values = []
            for scheme in schemaValue.split(','):
                scheme_list = scheme.split(' ')
                data = row.get(scheme_list[0], None)
                if data is None or data == 'None':
                    print('Failed to get data from row ', row)
                    row_values = []
                    break
                data_type = scheme_list[1]
                if 'string' in data_type.lower():
                    data = data.replace("'", "❜")
                if type(data) == bool:
                    data = int(data)
                    
                row_values.append(data)

            if len(row_values) == 0:
                continue
                
            row_values.extend([content[3], content[0], f"{content[5]}", date_str])
            if is_ipfs_hash:
                row_values.append(ipfs_hash)
                
            table_values.append(tuple(row_values))

        if count > 0:
            print(schemaName, count)
            
        if len(table_values) == 0:
            continue
        value_holders = ','.join(['?' for _ in table_values[0]])
        cur.executemany(f"INSERT OR IGNORE INTO {schemaName} VALUES ({value_holders})", table_values)
        
    con.commit()
    return current_block