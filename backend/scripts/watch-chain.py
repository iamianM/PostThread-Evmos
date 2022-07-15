
import json
import time

from scripts.database_queries import update_db
import sqlite3
from scripts.web3_helpers import *

con = sqlite3.connect('postthreadV1_write.db')
cur = con.cursor()


# update_db(backfill=True, schemaToUpdate=None)

minted_time = 0
last_block = 0
while True:    
    current_block = w3.eth.get_block_number()
    if current_block != last_block:
        last_block = update_db(
            query_start=True, 
            backfill=False, schemaToUpdate=None
        )
        print("Block: ", current_block)
    
    time.sleep(1)
