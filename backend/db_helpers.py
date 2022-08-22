import json
import time
from supabase import create_client
import praw
import networkx as nx
import pandas as pd
import hmac
import hashlib
import base64
from web3 import Web3
from eth_abi.packed import encode_abi_packed
from eth_utils import keccak

w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com/'))

creds = json.load(open(".db-creds.json"))
schemas = json.load(open("schemas.json"))
pw = json.load(open(".wallets-creds.json"))

url = creds["SUPABASE_URL"]
key = creds["SUPABASE_KEY"]
supabase = create_client(url, key)

reddit_creds = json.load(open(".reddit_creds.json", "r"))
reddit = praw.Reddit(
    client_id=reddit_creds["client_id"],
    client_secret=reddit_creds["client_secret"],
    password=reddit_creds["password"],
    user_agent=reddit_creds["user_agent"],
    username=reddit_creds["username"],
)

daily_token_rewards = 100000
rewards = {"posts": 100, "comments": 10, "votes": 1, "follows": 5, "links": 400}

def exp_for_level():
    lvl = 1
    exp = 0
    exp_4_next_lvl = 83
    result = {lvl: 0}
    while lvl < 99:
        exp += exp_4_next_lvl
        exp_4_next_lvl += exp_4_next_lvl * 0.10407
        lvl += 1
        result[lvl] = exp
    return result

lvl_to_exp = exp_for_level()

def insert_to_db(table_name, data, max_count=5):
    inserted = False
    count = 0
    while not inserted and count < max_count:
        count += 1
        try:
            posts_result = supabase.table(table_name).insert(data).execute().data
            inserted = True
        except Exception as e:
            print("failed to insert", e)
            time.sleep(10)
    if count >= max_count:
        print('failure')
        posts_result = supabase.table(table_name).insert(data).execute().data
        
    return posts_result

def mint_vote(num_votes, parent_hash, post_data_hash, parent_type):
    message = '{' + f'"post_hash": "{post_data_hash}", "parent_hash": "{parent_hash}","parent_type": "{parent_type}","num_votes": {num_votes}' + '}'
    return message

def mint_user(user_msa_id, profile_pic, wallet_address): 
    message = '{' + f'"msa_id": "{user_msa_id}", "profile_pic": "{profile_pic}","wallet_address": "{wallet_address}"' + '}'
    return message    

def follow_user(protagonist_msa_id, antagonist_msa_id, is_follow=True):
    follow = "follow" if is_follow else "unfollow"
    message = '{' + f'"protagonist_msa_id": {protagonist_msa_id},"antagonist_msa_id": "{antagonist_msa_id}","event": "{follow}"' + '}'
    return message

def get_centralities(follows_data):    
    G = nx.Graph()
    G.add_edges_from(pd.DataFrame(follows_data)[['follower_id', 'following_id']].values.tolist())
    degree_scores = nx.degree_centrality(G)
    closeness_scores = nx.closeness_centrality(G)
    betweeness_scores = nx.betweenness_centrality(G, k=1)
    
    return [degree_scores, closeness_scores, betweeness_scores], G

def get_user_weighted_social_score(centralities, user_id):
    user_centralities = []
    for centrality in centralities:
        if user_id not in centrality.keys():
            user_centralities.append(0)
        else:
            centrality_max = max(centrality.values())
            user_centralities.append(0 if centrality_max == 0 else centrality[user_id] / centrality_max)
    
    user_centralities.sort(reverse=True)
    weighted_avg = 0
    for i, score in enumerate(user_centralities):
        weighted_avg += score * i
        
    return weighted_avg / 6

def get_user_exp(all_data, user_id):
    posts = all_data['posts'][all_data['posts']['user_id'] == user_id]
    posts_upvotes = all_data['votes'][all_data['votes']['post_id'].isin(posts['id'])]['up'].sum()
    
    exp = 0
    exp += posts.size * rewards['posts']
    exp += all_data['comments'][all_data['comments']['user_id'] == user_id].size * rewards['comments']
    exp += all_data['votes'][all_data['votes']['user_id'] == user_id].size * rewards['votes']
    exp += posts['reddit_upvotes'].sum() * rewards['votes']
    exp += all_data['follows'][all_data['follows']['follower_id'] == user_id].size * rewards['follows']
    exp += all_data['follows'][all_data['follows']['following_id'] == user_id].size * rewards['follows'] * 2
    
    user = all_data['users'][all_data['users']['id'] == user_id].iloc[0]
    if user['reddit_username'] is not None:
        exp += rewards['links']
    if user['github_username'] is not None:
        exp += rewards['links']
    if user['discord_username'] is not None:
        exp += rewards['links']
    if user['email'] is not None:
        exp += rewards['links']
        
    return exp

def update_scores(all_data, df):
    df['id']
    centralities, G = get_centralities(all_data['follows'][all_data['follows']['follower_id'].isin(df['id']) | all_data['follows']['following_id'].isin(df['id'])])
    
    social_score = []
    level = []
    overall_score = []
    exp = []
    exp_to_next_level = []
    
    for index, row in df.iterrows():
        user_id = row['id']
        
        user_exp = get_user_exp(all_data, user_id)
        user_level = row['level']
        while lvl_to_exp[user_level] < user_exp:
            user_level += 1
        
        ss = get_user_weighted_social_score(centralities, user_id) * 1000
        social_score.append(max(ss, 1))
        level.append(user_level)
        overall_score.append(user_level * social_score[-1])
        exp.append(user_exp)
        exp_to_next_level.append(lvl_to_exp[user_level + 1] - lvl_to_exp[user_level])
    
    df['social_score'] = social_score
    df['level'] = level
    df['overall_score'] = overall_score
    df['overall_score'] /= max(overall_score)
    df['exp'] = exp
    df['exp_to_next_level'] = exp_to_next_level
    df['daily_payout_value'] = daily_token_rewards * df['overall_score']
    df[df['daily_payout_value'] < 100] = 100
    
    return df

def get_wallet_from_username(username):
    dig = hmac.new(pw.encode(), msg=username.encode(), digestmod=hashlib.sha256).digest()
    pw_hash = base64.b64encode(dig).decode()
    wallet = w3.eth.account.from_key(keccak(encode_abi_packed(['string'],[pw_hash])))
    return wallet

def get_data(table_name, select, initial_len=0):
    i = initial_len
    prev_len = -1
    data = []
    while (len(data) - initial_len) % 1000 == 0 and prev_len != len(data):
        prev_len = len(data)
        data.extend(supabase.table(table_name).select(select).range(i, i+1000).execute().data)
        i += 1000
    return data