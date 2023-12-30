from flask import Blueprint, request, jsonify, make_response
from google.cloud import datastore
from functions import arr_eq, get_specific, get_with_pagination, edit_entity
from functions import unsupported_method, remove, authorize_user
import constants

from auth0 import verify_jwt

client = datastore.Client()

bp = Blueprint('boat', __name__, url_prefix='/boats')

@bp.route('', methods=['POST','GET'])
def boats_post_get():
    if request.method == 'POST':
        payload = verify_jwt(request)
        content = request.get_json()
        new_boat = datastore.entity.Entity(key=client.key(constants.boats))
        if arr_eq(constants.boats_attributes, content):
            new_boat.update({"name": content["name"], "type": content["type"],
                            "length": content["length"], "loads": [], "owner": payload['sub']})
            client.put(new_boat)
            new_boat['id'] = new_boat.key.id
            new_boat['self'] = request.base_url + '/' + str(new_boat.key.id)
            return jsonify(new_boat), 201
        else:
            return (constants.boats_CUP_error, 400) 
    elif request.method == 'GET':
        payload = verify_jwt(request)
        return get_with_pagination(request, constants.boats, 5, constants.loads, payload=payload)
    else:
        return unsupported_method('', 'POST, GET')


@bp.route('/<id>', methods=['GET', 'PUT', 'PATCH', 'DELETE'])
def boat_get_delete(id):
    if request.method == 'GET':
        payload = verify_jwt(request)
        return get_specific(request, int(id), constants.boats, 
                            constants.boats_get_error, 'loads', payload=payload)
    elif request.method == 'PUT':
        # User protected entity so authorize before editing
        authorized = authorize_user(request, constants.boats, int(id), 'edited')
        if authorized is not None:
            return authorized
        
        return edit_entity(request, constants.boats, int(id), 
                           constants.boats_attributes, constants.boats_get_error)
    elif request.method == 'PATCH':
        # User protected entity so authorize before editing
        authorized = authorize_user(request, constants.boats, int(id), 'edited')
        if authorized is not None:
            return authorized
        
        return edit_entity(request, constants.boats, int(id), 
                           constants.boats_attributes, 
                           constants.boats_get_error, put=False)
    elif request.method == 'DELETE':
        # User protected entity so authorize before deleting
        authorized = authorize_user(request, constants.boats, int(id), 'deleted')
        if authorized is not None:
            return authorized
        
        return remove(constants.boats, int(id), constants.loads,  
                      target_link_name=constants.load_boat_link,
                      err_msg=constants.boats_get_error)
    else:
        return unsupported_method('', 'GET, PUT, PATCH, DELETE')

# Linker to loads
@bp.route('/<bid>/loads/<lid>', methods=['PUT','DELETE'])
def boat_dock_load(bid, lid):
    if request.method == 'PUT':
        # Get the boat
        boat_key = client.key(constants.boats, int(bid))
        boat = client.get(key=boat_key)
        if boat is None:
            return jsonify(constants.load_or_boat_get_error), 404
        
        # Get the load
        load_key = client.key(constants.loads, int(lid))
        load = client.get(key=load_key)
        if load is None:
            return jsonify(constants.load_or_boat_get_error), 404

        if ('carrier', None) in load.items():
            load['carrier'] = {"id": boat.key.id}
        else:
            return jsonify({"Error": "The load is already loaded on another boat"}), 403
        
        # Only keeping reference by id links
        if 'loads' in boat.keys():
            boat['loads'].append({"id": load.key.id})
        else:
            boat['loads'] = [{"id": load.key.id}]
        
        client.put_multi([load, boat])
        return jsonify({}), 204
    elif request.method == "DELETE":
        # Get the boat
        boat_key = client.key(constants.boats, int(bid))
        boat = client.get(key=boat_key)
        if boat is None:
            return jsonify(constants.undock_error), 404
        
        # Get the load
        load_key = client.key(constants.loads, int(lid))
        load = client.get(key=load_key)
        if load is None:
            return jsonify(constants.undock_error), 404

        if ('carrier', {'id': boat.key.id}) in load.items():
            load['carrier'] = None
        else:
            return jsonify(constants.undock_error), 404
        
        # Find load that matches id to remove!
        if 'loads' in boat.keys():
            for e in boat['loads']:
                if e['id'] == load.key.id:
                    boat['loads'].remove(e)
                    break
        else:
            boat['loads'] = []
        
        client.put_multi([load, boat])
        return jsonify({}), 204

    else:
        return unsupported_method('', 'PUT, DELETE')