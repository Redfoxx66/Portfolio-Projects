from flask import Blueprint, request, make_response, jsonify
from google.cloud import datastore
from functions import unsupported_method, m_response

client = datastore.Client()

bp = Blueprint('user', __name__, url_prefix='/users')

@bp.route('', methods=['GET'])
def get_users():
    if request.method == 'GET':
            # To access common headers see property of request similar to request.content_type
        if 'application/json' not in request.accept_mimetypes:
            # The response isn't a supported media type
            return m_response('', 406)
        
        query = client.query(kind='user')
        results = list(query.fetch())
        for e in results:
            e["id"] = e.key.name

        return jsonify(results), 200
    else:
        return unsupported_method('', 'GET')
    