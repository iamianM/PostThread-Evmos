import os, json
from supabase import create_client, Client
from realtime.connection import Socket

creds = json.load(open(".db-creds.json"))

SUPABASE_URL = creds["SUPABASE_URL"]
SUPABASE_KEY = creds["SUPABASE_KEY"]
SUPABASE_ID = creds["SUPABASE_ID"]

def callback1(payload):
    with open("new_announcements.txt", "a") as f:
        f.write(json.dumps(payload)+'\n') 
    print("Callback 1: ", payload)

if __name__ == "__main__":
    URL = f"wss://{SUPABASE_ID}.supabase.co/realtime/v1/websocket?apikey={SUPABASE_KEY}&vsn=1.0.0"
    s = Socket(URL)
    s.connect()

    channel_1 = s.set_channel("realtime:*")
    channel_1.join().on("UPDATE", callback1)
    channel_1.join().on("INSERT", callback1)
    channel_1.join().on("DELETE", callback1)
    s.listen()