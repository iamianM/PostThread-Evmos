import re
import json
import substrateinterface
from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException
import ipfshttpclient

substrate = None
delegate = None
client = ipfshttpclient.connect()

post_schemaId, comment_schemaId, vote_schemaId, user_schemaId = 155, 156, 159, 160

def set_substrate(_substrate):
    global substrate
    substrate = _substrate

def set_delegate(_delegate):
    global delegate
    delegate = _delegate

def make_call(call_module, call_function, call_params, keypair, wait_for_inclusion=True, wait_for_finalization=False):
    call = substrate.compose_call(
        call_module=call_module,  
        call_function=call_function,
        call_params=call_params
    )

    extrinsic = substrate.create_signed_extrinsic(call=call, keypair=keypair)

    try:
        receipt = substrate.submit_extrinsic(extrinsic, wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
        print("Extrinsic '{}' sent and included in block '{}'".format(receipt.extrinsic_hash, receipt.block_hash))

    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))
    return receipt

def addSchema(schema, check=True, create=True, wait_for_inclusion=True, wait_for_finalization=False):
    schemaId = None
    if check:
        schema_count = substrate.query(
            module='Schemas',
            storage_function='SchemaCount',
            params=[]
        ).value

        for i in range(1, schema_count+1):
            schemaTemp = substrate.query(
                module='Schemas',
                storage_function='Schemas',
                params=[i]
            )
            if schemaTemp == schema:
                schemaId = i
                return schemaId

    if schemaId is None and create:
        receipt = make_call("Schemas", "register_schema", {"schema": schema}, delegate, 
                            wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
        
    if wait_for_inclusion or wait_for_finalization:
        for event in receipt.triggered_events:
            event = event.decode()
            if event['event']['module_id'] == 'SchemaRegistered':
                schemaId = event['event']['attributes'][1]
                return schemaId
       
        # didn't find msa in events so call function to check for msa
        while (schemaId is None):
            schemaId = addSchema(schema, check=True, create=False)
            
    return schemaId

def get_msa_id(wallet, create=True, wait_for_inclusion=True, wait_for_finalization=False):
    msa_key = substrate.query(
        module='Msa',
        storage_function='KeyInfoOf',
        params=[wallet.ss58_address]
    )
    
    if not create:
        return None

    if msa_key == None:
        make_call("Msa", "create", {}, wallet, wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
        msa_key = substrate.query(
            module='Msa',
            storage_function='KeyInfoOf',
            params=[wallet.ss58_address]
        )

    msa_id = msa_key['msa_id'].decode()
    return msa_id

def get_signature(payload, signer):
    # encode payload using SCALE
    # I found scale_info from "substrate.metadata_decoder"
    payload_encoded = substrate.encode_scale(type_string='scale_info::8', value=payload['authorized_msa_id']) + \
                            substrate.encode_scale(type_string='scale_info::2', value=payload['permission'])

    # Payload must be wrapped in theses Bytes objects
    payload_encoded = "<Bytes>".encode() + payload_encoded.data + "</Bytes>".encode()

    # The provider address signs the payload, so in this case alice
    return signer.sign(payload_encoded)

def create_msa_with_delegator(provider_wallet, delegator_wallet):    
    provider_msa_id = get_msa_id(provider_wallet)

    payload_raw = { "authorized_msa_id": provider_msa_id, "permission": 0 }

    signature = get_signature(payload_raw, delegator_wallet)

    call_params = {
        "delegator_key": delegator_wallet.ss58_address,
        "proof": {"Sr25519": "0x" + signature.hex()},
        "add_provider_payload": payload_raw
    }

    # provider signs this
    receipt = make_call("Msa", "create_sponsored_account_with_delegation", call_params, provider_wallet)
    for event in receipt.triggered_events:
        event = event.decode()
        if event['event']['module_id'] == 'Msa':
            msa_id = event['event']['attributes'][0]
            return msa_id

def mint_votes(user_msa_id, num_votes, parent_hash, post_data_hash, parent_type):
    message = '{' + f'"post_hash": "{post_data_hash}", "parent_hash": "{parent_hash}","parent_type": "{parent_type}","num_votes": {num_votes}' + '}'
    call_params = {
        "on_behalf_of": user_msa_id,
        "schema_id": vote_schemaId,
        "message": message,
        "payload": message
    }
    receipt = make_call("Messages", "add", call_params, delegate, wait_for_inclusion=False, wait_for_finalization=False)

    return receipt

def get_schemas_from_pattern(pattern):
    schema_count = substrate.query(
        module='Schemas',
        storage_function='SchemaCount',
        params=[]
    ).value

    schemas = {}
    for i in range(1, schema_count+1):
        schemaTemp = substrate.query(
            module='Schemas',
            storage_function='Schemas',
            params=[i]
        )
        if pattern.match(schemaTemp.value):
            schemas[schemaTemp.value] = i
    
    return schemas

def get_content_from_schemas(schemas, starting_block=None, num_blocks=None):
    current_block = substrate.get_block()['header']['number']

    if num_blocks is None and starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - 10000, 0)
    if num_blocks is None:
        end_block = min(starting_block + 10000, current_block + 1)
    if starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - num_blocks,0)

    content_jsons = {}
    for schema, schemaId in schemas.items():
        params = [
            schemaId,
            {
                "page_size": 10000,
                "from_block": starting_block,
                "to_block": end_block,
                "from_index": 0,
            }
        ]

        content = substrate.rpc_request(
            method='messages_getBySchema',
            params=params,
        )
        if len(content['result']['content']) > 0:
            content_jsons[schema] = content['result']['content']
    return content_jsons

def mint_user(username, password, profile_pic, user_wallet):      
    user_msa_id = create_msa_with_delegator(delegate, user_wallet)
    user_data = '{' + f'"msa_id": {user_msa_id},"username": "{username}","password": "{password}","profile_pic": "{profile_pic}","wallet_ss58_address": "{user_wallet.ss58_address}"' + '}'
    
    call_params = {
        "on_behalf_of": user_msa_id,
        "schema_id": user_schemaId,
        "message": user_data,
        "payload": user_data
    }
    receipt_user = make_call("Messages", "add", call_params, delegate, wait_for_inclusion=False, wait_for_finalization=False)
    return user_msa_id, receipt_user

def get_user(username=None, user_msa_id=None):
    user_pattern = re.compile(f"username,password,profile_pic")
    user_schemas = get_schemas_from_pattern(user_pattern)
    content_jsons = get_content_from_schemas(user_schemas)

    for schema, contents in content_jsons.items():
        keys = schema.split(',')
        for content in contents:
            data = bytes.fromhex(content['data'][2:]).decode().split(',')
            if username == data[0] or user_msa_id == content['msa_id']:
                result = {s: d for s, d in zip(keys, data)}
                result['user_msa_id'] = content['msa_id']
                return result

    return {"Error": "username or user_msa_id does not exist"}

def make_post(data, user_msa_id, wait_for_inclusion=True, wait_for_finalization=False):
        # write to temp file first to get hash from ipfs
        json.dump(data, open(f"temp.json", "w"))
        post_data_hash = client.add('temp.json', only_hash=True)["Hash"]

        json.dump(data, open(f"/home/chia/polkadot_projects/PostThread-Polkadot/reddit-reposter/posts/{post_data_hash}.json", "w"))
        res_post = client.add(f"/home/chia/polkadot_projects/PostThread-Polkadot/reddit-reposter/posts/{post_data_hash}.json")
        post_data_hash = res_post["Hash"]

        call_params = {
            "on_behalf_of": user_msa_id,
            "schema_id": post_schemaId,
            "message": f"{post_data_hash}",
            "payload": f"{post_data_hash}",
        }
        receipt_post = make_call("Messages", "add", call_params, delegate, 
                            wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)

        return receipt_post