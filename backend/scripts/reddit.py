import json
import pandas as pd
import time
from random import sample
import ipfshttpclient
from os import listdir
from os.path import isfile, join
import praw
import os
import shutil

from scripts.web3_helpers import *
from scripts.database_queries import update_db
import sqlite3

accounts = json.load(open("accounts.json", "r"))
schemas = json.load(open("schemas.json", "r"))

bob = delegate
bob_msa_id = get_msa_id(delegate)

reddit_creds = json.load(open("./scripts/.reddit_creds.json", "r"))
reddit = praw.Reddit(
    client_id=reddit_creds["client_id"],
    client_secret=reddit_creds["client_secret"],
    password=reddit_creds["password"],
    user_agent=reddit_creds["user_agent"],
    username=reddit_creds["username"],
)

con = sqlite3.connect('postthreadV1_write.db')
cur = con.cursor()

r_all = reddit.subreddit('all')
client = ipfshttpclient.connect()

path = "C:/tmp/"

def mint_reddit_users_msa_ids(post, delegate, wait_for_inclusion=False, wait_for_finalization=False):
    ## USER ##
    try:
        username = str(post.author.name)
        if username[0:2] == '0x':
            username = username[2:]
        profile_pic = post.author.icon_img
    except:
        username = "removed"
        profile_pic = "removed"

    password = 'password'
    user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{username}{password}"])))
    msa_id = create_msa_with_delegator(user_wallet, 
                                       wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    
    return {"username": username, "password": password, "profile_pic": profile_pic, "user_wallet": user_wallet, "msa_id": msa_id}

def mint_reddit_users_msa_ids_for_posts(posts, delegate):
    users = {}
    posts_and_comments = posts
    for i, (post_name, post) in enumerate(posts.items()):
        if i != len(posts):
            users[post_name] = {post_name: mint_reddit_users_msa_ids(post, delegate)}
        
        top_comments = []
        for comment in post.comments.list()[:2]:
            if comment.parent_id == post.name:
                top_comments.append(comment.name)
                users[post_name][comment.name] = mint_reddit_users_msa_ids(comment, delegate)
    
    # last one wait for finalization
    users[post_name] = {post_name: mint_reddit_users_msa_ids(post, delegate, True, True)}
        
    return users

def mint_comment(post_data_hash, parent_hash, user, comment):  
    user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{user['username']}{user['password']}"])))  
    user_msa_id = get_msa_id(user_wallet)
    if user_msa_id is None:
        return None, None

    comment_data = {
        "post_hash": post_data_hash,
        "parent_hash": parent_hash,
        "depth": comment.depth,
        "body": comment.body,
    }

    comment_data_hash, receipt_comment = mint_data(comment_data, user_msa_id, schemas['comment'], path+'comments/', wait_for_inclusion=False, wait_for_finalization=False)

    ## comment votes ##
    receipt_ups = mint_votes(user_msa_id, comment.ups, comment_data_hash, post_data_hash, 'comment')
    receipt_downs = mint_votes(user_msa_id, comment.downs, comment_data_hash, post_data_hash, 'comment')
    
    return comment_data_hash, user_msa_id

def mint_reddit_posts_and_users(posts, users, user_msa_ids, delegate):
    for i, (post_name, post) in enumerate(posts.items()):        
        try:
            user = users[post.name][post.name]
        except:
            print('Could not find user for post:', post.author)
            continue
        ## POST ##
        post_data = {
            "category": post.subreddit.display_name,
            "title": post.title,
            "body": post.selftext,
            "url": post.url,
            "is_nsfw": post.over_18
        }
        user_wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{user['username']}{user['password']}"])))
        user_msa_id = user['msa_id']
        if user_msa_id is None:
            print('no user_msa_id')
            continue
        
        receipt_user = mint_user(user_msa_id, user['username'], user['password'], user['profile_pic'], user_wallet)

        post_data_hash, receipt_post = mint_data(post_data, user_msa_id, schemas['post'], path+'posts/', 
                                                 wait_for_inclusion=False, wait_for_finalization=False)

        ## post votes ##
        receipt_ups = mint_votes(user_msa_id, post.ups, post_data_hash, post_data_hash, 'post', 
                                                 wait_for_inclusion=False, wait_for_finalization=False)
        receipt_downs = mint_votes(user_msa_id, post.downs, post_data_hash, post_data_hash, 'post', 
                                                 wait_for_inclusion=False, wait_for_finalization=False)
        
        comment_list = post.comments.list()
        top_comments = {}
        for comment in comment_list[:2]:
            if comment.parent_id == post.name:  
                try:
                    user = users[post_name][comment.name] 
                except:
                    print('Could not find user for comment:', comment.author)
                    continue
                comment_data_hash, comment_user_msa_id = mint_comment(post_data_hash, post_data_hash, user, comment)
                top_comments[comment.name] = {"hash": comment_data_hash, "comment_count": 0}
              
        ## FOLLOWS ##
        for other_user_msa_id in sample(user_msa_ids, min(5, len(user_msa_ids))):
            if user_msa_id != other_user_msa_id:
                follow_user(user_msa_id, other_user_msa_id)
        
    return True

post_query = """
SELECT category, title, post.msa_id_from_query, username
FROM post 
JOIN user ON user.msa_id_from_query = post.msa_id_from_query
"""
user_query = """SELECT msa_id_from_query FROM user"""

all_posts = pd.read_sql_query(post_query, con)
user_msa_ids = pd.read_sql_query(user_query, con)['msa_id_from_query'].unique().tolist()

minted_time = 0
last_block = 0
new_announcement_time = 0
while True:
    # Mint reddit posts every hour
    if (time.time() - minted_time) / 60 > 30:
        all_posts = pd.read_sql_query(post_query, con)
        user_msa_ids = pd.read_sql_query(user_query, con)['msa_id_from_query'].unique().tolist()
        
        posts = {p.name: p for i, p in enumerate(r_all.top(time_filter='hour')) if i < 10 and all_posts[(all_posts['username'] == p.author) & (all_posts['title'] == p.title) & (all_posts['category'] == p.subreddit)].size == 0}
        print("# new posts:", len(posts))
        # run twice since first time it waits for finalization
        all_users = mint_reddit_users_msa_ids_for_posts(posts, bob)
        print('msa done posting')
        all_users = mint_reddit_users_msa_ids_for_posts(posts, bob)
        it_worked = mint_reddit_posts_and_users(posts, all_users, user_msa_ids, bob)
        if not it_worked:
            print("Minting Posts failed")

        minted_time = time.time()
        print('Done minting')

    if new_announcement_time != os.stat("new_announcements.txt").st_mtime:
        shutil.copyfile("new_announcements.txt", "new_announcements_copy.txt")
        with open("new_announcements.txt", "w") as f:
            pass

        with open("new_announcements_copy.txt", "r") as f:
            lines = f.readlines()
            for l in lines:
                l = json.loads(l)
                print(l)
                if l['type'] == "follow":
                    follow_user(l["msa_id"], l["msa_id_to_interact_with"], is_follow=l["is_follow"])
                elif l['type'] == "create_msa_and_mint_user":
                    wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{l['username']}{l['password']}"])))
                    create_msa_and_mint_user(wallet, l["username"], l["password"], l["profile_pic"])
                elif l['type'] == "mint_data":
                    if "path" in l:
                        mint_data(json.dumps(l["data"]), l["user_msa_id"], l["schema"], path+l["path"])
                    else:
                        mint_data(json.dumps(l["data"]), l["user_msa_id"], l["schema"])
                elif l['type'] == "transfer":
                    wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[f"{l['username']}{l['password']}"])))
                    bob.transfer(wallet.address, 0)

    
    time.sleep(1)
