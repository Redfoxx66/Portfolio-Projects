from flask import jsonify, make_response
from google.cloud import datastore
from google.cloud.datastore.query import PropertyFilter
import json
import constants

from auth0 import verify_jwt

client = datastore.Client()

def m_response(body, status_code:int, **kwargs):
    res = make_response(body)
    res.status_code = status_code
    res.mimetype = 'application/json'
    for key, value in kwargs.items():
        res.key = value

    return res

# Possibly make content not dict and just any
def arr_eq(required_attributes: list, content: dict,) -> bool:
    # Need to get attribute values from content to check against required attributes
    found_attributes = []

    # Get all top level attributes (doesn't currently work for nested attributes)
    for attribute in content:
        found_attributes.append(attribute)

    # The number of attributes should be the same in order for both arrays to be the same 
    if (len(required_attributes) != len(found_attributes)):
        return False
    
    # Sort the lists (arrays) so they are in order for comparison
    required_attributes.sort()
    found_attributes.sort()

    for i in range(0, len(found_attributes)):
        if (required_attributes[i] != found_attributes[i]):
            return False # Attribute doesn't match so an attribute is missing or incorrect
    return True

# Helper function
def check_payload(payload: dict, obj, err_msg: str):
    # Check if this is a user protected entity
    if payload is not None:
        # Make sure that this entity belongs to owner of jwt
        if obj['owner'] != payload['sub']:
            res = make_response(json.dumps({"error": err_msg}))
            res.status_code = 403
            res.mimetype = 'application/json'
            res.headers.set('Content-type', 'application/json')
            return res
    return None

def authorize_user(request, kind: str, id: int, op: str = 'accessed'):
    payload = verify_jwt(request)
    key = client.key(kind, id)
    # Make sure user has access to this user-protected resource
    obj = client.get(key=key)
    if obj is not None:
        # Return None (authorized) or error
        return check_payload(payload, obj, 
                            f'This entity ({kind})' +
                            ' belongs to someone else and can ' +
                            f'only be {op} by that owner')

# Cleaned up better than the previous version
def create(request, kind: str, attributes: list, additonal_body: dict={}, error_msg: dict = {"Error": "The request object is missing at least one of the required attributes"}, status_code=201):

    # To access common headers see property of request similar to request.content_type
    if 'application/json' not in request.accept_mimetypes:
        # The response isn't a supported media type
        return m_response('', 406)
    
    content = request.get_json()
    new_obj = datastore.entity.Entity(key=client.key(kind))
    if arr_eq(attributes, content):
        content.update(additonal_body)
        new_obj.update(content)
        client.put(new_obj)
        new_obj["id"] = new_obj.key.id
        new_obj["self"] = request.base_url + '/' + str(new_obj.key.id)
        return jsonify(new_obj), status_code
    else:
        return jsonify(error_msg), 400

def get_with_pagination(request, kind: str, limit_per_page: int, 
                        linked_kind: str = None, link_kind_name: str = None,
                        payload = None) -> dict[str,list]:
    
    # To access common headers see property of request similar to request.content_type
    if 'application/json' not in request.accept_mimetypes:
        # The response isn't a supported media type
        return m_response('', 406)
    
    if linked_kind != None and link_kind_name == None:
        link_kind_name = linked_kind

    # Filters for if paylod provided (Try having this None if payload None instead to save code reuse)
    filters = []
    
    # This is a projected resorce so need to find associated entities
    if payload is not None:
        filters = [PropertyFilter('owner', '=', payload["sub"])]

    query = client.query(kind=kind, filters=filters)
    c_query = client.query(kind=kind, filters=filters)
    
    # Determine the number of total elements for query
    c_query.keys_only() 
    total_count = len(list(c_query.fetch())) 

    # The name to display for total count of entities specified by kind
    total_str = "total_" + kind

    # Code taken from class example python code (guests.py)    
    q_limit = int(request.args.get('limit', str(limit_per_page)))
    q_offset = int(request.args.get('offset', '0'))
    g_iterator = query.fetch(limit= q_limit, offset=q_offset)
    pages = g_iterator.pages
    results = list(next(pages))
    if g_iterator.next_page_token:
        next_offset = q_offset + q_limit
        next_url = request.base_url + "?limit=" + str(q_limit) + "&offset=" + str(next_offset)
    else:
        next_url = None
    for e in results:
        e["id"] = e.key.id
        e["self"] = request.base_url + '/' + str(e.key.id)

        # Now add self links to linked objects if linked object is provided
        if (link_kind_name is not None) and (link_kind_name in e.keys()):
            # if link_kind_name in e.keys():
            # It is possible that the object has been removed and is null so check for that first
            if e[link_kind_name] is not None:
                 # Object can have many relationship with list   
                if isinstance(e[link_kind_name], list):
                    for v in e[link_kind_name]:
                        v['self'] = constants.root_url + '/' + linked_kind + '/' + str(v['id'])
                # Or can have one relationship with single link
                else:
                    e[link_kind_name]['self'] = constants.root_url + '/' + linked_kind + '/' + str(e[link_kind_name]['id'])

    output = {kind: results}
    output[total_str] = total_count
    if next_url:
        output["next"] = next_url
    return jsonify(output)

def get_specific(request, id:int, this_kind: str, error_msg: dict, 
                 linked_obj: str, linked_kind: str = None, payload = None):
    
    if ((linked_kind == None) and (linked_obj != None)):
        linked_kind = linked_obj

    # To access common headers see property of request similar to request.content_type
    if 'application/json' not in request.accept_mimetypes:
        # The response isn't a supported media type
        return m_response('', 406)
    
    obj_key = client.key(this_kind, id)
    obj = client.get(key=obj_key)

    # check that the desired object is present
    if obj is not None:
        # Might be better to have try catch methodoligy later on
        possession = check_payload(payload, obj, f'This entity ({this_kind}) '+
                        'belongs to someone else and can only be retrieved ' +
                        'by that owner')
        
        if possession is not None:
            return possession
        
        obj['id'] = obj.key.id
        obj['self'] = request.base_url
        if linked_obj in obj.keys():
            # It is possible that the object has been removed and is null so check for that first
            if obj[linked_obj] is not None: 
                 # Object can have many relationship with list   
                if isinstance(obj[linked_obj], list):
                    for e in obj[linked_obj]:
                        e['self'] = constants.root_url + '/' + linked_kind + '/' + str(e['id'])

                # Or can have one relationship with single link
                else:
                    obj[linked_obj]['self'] = constants.root_url + '/' + linked_kind + '/' + str(obj[linked_obj]['id'])
        
        res = make_response(json.dumps(obj))
        res.status_code = 200
        # return jsonify(obj), 200
    else:
        res = make_response(json.dumps(error_msg))
        res.status_code = 404
        # return (error_msg, 404)

    res.mimetype = 'application/json'
    res.headers.set('Content-type', 'application/json') # Accept header?
    return res
        # return res

def edit_entity(request, kind: str, id: int, req_attr: list, err_msg, put: bool = True):
    
    content = request.get_json()
    self_url = request.base_url 

    key = client.key(kind, id)
    obj = client.get(key=key)

    # To access common headers see property of request similar to request.content_type
    if 'application/json' not in request.accept_mimetypes:
        # The response isn't a supported media type
        return m_response('', 406)
    
    # Make sure obj is valid
    if obj is None:
        res = make_response(json.dumps(err_msg))
        res.mimetype = 'application/json'
        res.status_code = 404
        return res
    
    # Need to find what value/values to update then update
    valid_update_attr = {}
    for key, value in content.items():
        # Make sure user not sneaking improper values in body
        if key in req_attr:
            valid_update_attr[key] = value

    # If method is PUT need all required_attributes
    if put:
        # Validate that body is good
        if not arr_eq(req_attr, content):
            return jsonify({"error": constants.put_error}), 400
        
        if len(valid_update_attr) != len(req_attr):
            return jsonify({"error": constants.put_error}), 400
        
    # The object will be updated with valid update values 
    # determined dynamically above
    obj.update(valid_update_attr)
    client.put(obj)

    obj['id'] = obj.key.id
    obj['self'] = self_url

    res = make_response(json.dumps(obj))
    res.mimetype = 'application/json'
    res.headers.set('Content-Location', self_url)

    if put:
        res.status_code = 201
    else: 
        res.status_code = 200
    return res        

def add_user(token):
    kind = 'user'
    # First check if user exists
    key = token.get("userinfo").get("sub")

    obj_key = client.key(kind, key)
    obj = client.get(key=obj_key)

    if obj is None:
        # The user doesn't exist so make one
        new_obj = datastore.entity.Entity(client.key(kind, key))
        new_obj.update({"email": token.get("userinfo").get("email")})
        client.put(new_obj)
        new_obj["id"] = new_obj.key.name
        return

def unsupported_method(body: str, methods: str):
    res = make_response(body)
    res.headers.set('Allow', methods)
    res.status_code = 405
    return res

def unlink(target_kind: str, target_id: int, child_kind: str, 
           child_id: int, target_link_name:str = None, child_link_name: str = None) -> None:
    """Function to gracefully (silently) unlink target and child entities
    if they both exist and are linked. (Will not error if they are already
    unlinked or any provided id is incorrect)

    :param target_kind: The kind of the target entity to unlink children from
    :type target_kind: str
    :param target_id: The id for the target to search for and unlink
    :type target_id: int
    :param child_kind: The kind of child entity to unlink from the target entity
    :type child_kind: str
    :param child_id: The id for the child enity to search for and unlink
    :type child_id: int
    :param target_link_name: The name of the attribute inside the child the target is linked under
    :type target_link_name: str
    :param child_link_name: The name of attribute inside target that child is linked under
    :type child_link_name: str

    :rtype: None
    """

    if child_link_name is None:
        child_link_name = child_kind

    if target_link_name is None:
        target_link_name = target_kind
    
    # Get the target entity
    target_key = client.key(target_kind, target_id)
    target = client.get(key=target_key)
    if target is None:
        return
    
    # Get the child entity
    child_key = client.key(child_kind, child_id)
    child = client.get(key=child_key)
    if child is None:
        return

    # If given correct link name should always be false
    if child_link_name not in target.keys():
        return
    
    # Check that there is something to remove from the object
    if target.get(child_link_name) is None:
        return
    
    # If the linked object is a list need to handle unlinking all objects (many-to-one)
    if isinstance(target[child_link_name], list):
        if child_link_name not in target.keys():
            target[child_link_name] = []
        else:
            # Find child entity that matches id in target
            for each_child in target[child_link_name]:
                if each_child.get('id') == child_id:
                    target[child_link_name].remove(each_child)
                    break # only removing this entity no need to loop more
        
        # Now remove target entity from child
        # Check for Many-to-Many relationship
        if isinstance(child[target_link_name], list):

            if target_link_name not in child.keys():
                child[target_link_name] = []
            else:
                # Find child entity that matches id in target
                for each_child in child[target_link_name]:
                    if each_child.get('id') == target_id:
                        child[target_link_name].remove(each_child)
                        break # only removing this entity no need to loop more
        else: # Many to One relationship
            child[target_link_name] = None

    else: # Target not list of objects
        # Target holds single relationship with child so remove
        target[child_link_name] = None
        
        # Now time to unlink children
        # Figure out target_link name for child
        # If given correct link name should always be false
        if target_link_name not in child.keys():
            return
        
        if isinstance(child[target_link_name], list):
            if target_link_name not in child.keys():
                child[target_link_name] = []
            else:
                # Find child entity that matches id in target
                for each_child in child[target_link_name]:
                    if each_child.get('id') == target_id:
                        child[target_link_name].remove(each_child)
                        break # only removing this entity no need to loop more
        else: # Single to Single relationship
            child[target_link_name] = None

    client.put_multi([child, target])
    return jsonify({}), 204

# So far works with many to one direction. Not great at error checking
def remove(target_kind: str, target_id: int, child_kind: str, 
           target_link_name: str = None, child_link_name: str = None, err_msg = None):
    """Function to remove an entity that may have dependencies gracefully

    :param target_kind: The kind of the target entity to remove and unlink children from
    :type target_kind: str
    :param target_id: The id for the target entity to remove
    :type target_id: int
    :param child_kind: The kind of child entity to unlink from the target entity
    :type child_kind: str
    :param child_id: The id of the child entity to unlink from the target entity
    :type child_id: int
    :param target_link_name: The name of the attribute inside the child the target is linked under
    :type target_link_name: str
    :param child_link_name: The name of attribute inside target that child is linked under
    :type child_link_name: str
    
    :returns: Message on status of removal (error) or proper removal
    :rtype: (tuple[Any, Literal[404]] | tuple[Any, Literal[204]])
    """

    if target_link_name is None:
        target_link_name = target_kind

    if child_link_name is None:
        child_link_name = child_kind
    
    target_key = client.key(target_kind, target_id)
    target_obj = client.get(target_key)

    # Make sure that there is a target entity that exists that can be deleted
    if target_obj is None:
        if err_msg is None:
            return jsonify(constants.load_or_boat_get_error), 404
        else:
            return jsonify(err_msg), 404
    
    # If there is a child entity present in target_obj need to handle unlinking before removal
    if child_link_name in target_obj.keys():
        # Check that there is something to remove from the object
        if target_obj[child_link_name] is not None:
            # If the linked object is a list need to handle unlinking all objects (many-to-one)
            if isinstance(target_obj[child_link_name], list):
                for child in target_obj[child_link_name]:
                    unlink(target_kind, target_id, child_kind, child.get('id'), 
                           target_link_name=target_link_name, 
                           child_link_name=child_link_name)
            else: # Target has one-to-many relationship
                unlink(target_kind, target_id, child_kind, 
                       target_obj[child_link_name].get('id'),
                       target_link_name=target_link_name, 
                       child_link_name=child_link_name)

    # Regardless of linked object it is now time to delete target 
    client.delete(target_key)
    return jsonify({}), 204