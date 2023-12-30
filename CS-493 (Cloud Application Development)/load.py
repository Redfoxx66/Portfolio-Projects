from flask import Blueprint, request
from google.cloud import datastore
from functions import create, get_with_pagination, edit_entity
from functions import get_specific, unsupported_method, remove
import constants

# How to get today's date for creation date
from datetime import date

today = date.today()

client = datastore.Client()

bp = Blueprint('load', __name__, url_prefix='/loads')

@bp.route('', methods=['POST','GET'])
def loads_get_post():
    if request.method == 'POST':
        return create(request, constants.loads, constants.loads_attributes, 
                      {'carrier': None, 
                       "creation_date": today.strftime("%m/%d/%Y")}, 
                       constants.loads_CUP_error)
    elif request.method == 'GET':
        return get_with_pagination(request, constants.loads, 5, constants.boats, 'carrier')
    else:
        return unsupported_method('', 'POST, GET')

@bp.route('/<id>', methods=['GET', 'PUT', 'PATCH', 'DELETE'])
def load_get_put_delete(id):
    if request.method == 'GET':
        return get_specific(request, int(id), constants.loads, 
                            constants.loads_get_error, 'carrier', 
                            constants.boats)
    elif request.method == 'PUT':
         return edit_entity(request, constants.loads, int(id), 
                           constants.loads_attributes, 
                           constants.loads_get_error)
    elif request.method == 'PATCH':
        return edit_entity(request, constants.loads, int(id), 
                           constants.loads_attributes, 
                           constants.loads_get_error, put=False)
    elif request.method == 'DELETE':
        return remove(constants.loads, int(id), constants.boats, 
                      child_link_name=constants.load_boat_link,
                      err_msg=constants.loads_get_error)
    else:
        return unsupported_method('', 'GET, PUT, PATCH, DELETE')
