import json
from supabase import create_client
from realtime.connection import Socket

creds = json.load(open(".db-creds.json"))

SUPABASE_URL = creds["SUPABASE_URL"]
SUPABASE_KEY = creds["SUPABASE_KEY"]
SUPABASE_ID = creds["SUPABASE_ID"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def update(payload):
    is_post = payload["table"] == "posts" and (payload['record']['ipfs_hash'] is not None and payload['record']['transaction_hash'] is None) 
    
    if is_post:
        with open("new_announcements.txt", "a") as f:
            f.write(json.dumps(payload)+'\n') 
            print("Updated: ", payload)

def insert(payload):
    is_post = payload["table"] == "posts" and payload['record']['reddit_id'] is None
    is_comment = payload["table"] == "comments" and payload['record']['reddit_id'] is None
    is_user = payload["table"] == "users" and payload['record']['username'] is not None
    is_category = payload["table"] == "categories"
    is_follow = payload["table"] == "follows" and supabase.table("users").select("username").eq("id", payload['record']['follower_id']).execute()[0]['username'] is not None
    is_payout = payload["table"] == "payouts"
    is_vote = payload["table"] == "votes" and supabase.table("posts").select("reddit_id").eq("id", payload['record']['post_id']).execute()[0]['reddit_id'] is not None
    
    if is_post or is_comment or is_user or is_category or is_follow or is_payout or is_vote:
        with open("new_announcements.txt", "a") as f:
            f.write(json.dumps(payload)+'\n') 
        print("Inserted: ", payload)

def delete(payload):
    print("Deleted: ", payload)

if __name__ == "__main__":
    URL = f"wss://{SUPABASE_ID}.supabase.co/realtime/v1/websocket?apikey={SUPABASE_KEY}&vsn=1.0.0"
    s = Socket(URL)
    s.connect()

    channel_1 = s.set_channel("realtime:*")
    channel_1.join().on("UPDATE", update)
    channel_1.join().on("INSERT", insert)
    channel_1.join().on("DELETE", delete)
    s.listen()