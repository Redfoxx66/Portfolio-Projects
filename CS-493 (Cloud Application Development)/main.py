# -*- coding: utf-8 -*-

"""main.py handles the main routing for the api along with handling Auth0

    Date: 12/9/2023
"""

__author__ = "Matthew Walker"
__maintainer__ = "Matthew Walker"
# __email__ = "matscottwalk@email.com"
__version__ = "1.0.0"
__status__ = "Prototype"

# from flask import Flask, request
import boat
import load
import user


from google.cloud import datastore
from flask import Flask, request, jsonify, make_response #, _request_ctx_stack
from flask import redirect, render_template, session, url_for

# Import Auth0 Classes
from auth0 import AuthError
# Import constants related to Auth0
from auth0 import APP_KEY, CLIENT_ID, CLIENT_SECRET, DOMAIN 
# Import functions related to Auth0

from functools import wraps

from functions import add_user

from urllib.parse import quote_plus, urlencode

from authlib.integrations.flask_client import OAuth



app = Flask(__name__)
app.secret_key = APP_KEY

app.register_blueprint(boat.bp)
app.register_blueprint(load.bp)
app.register_blueprint(user.bp)

client = datastore.Client()

oauth = OAuth(app)

oauth.register(
    'auth0',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    api_base_url="https://" + DOMAIN,
    access_token_url="https://" + DOMAIN + "/oauth/token",
    authorize_url="https://" + DOMAIN + "/authorize",
    client_kwargs={
        'scope': 'openid profile email',
    },
    server_metadata_url=f'https://{DOMAIN}/.well-known/openid-configuration',
)


@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


# Below code is my personal implementation without much given code
@app.route('/')
def home():
    if session.get("user", None):
        return redirect(url_for("user_page")) # not an external 

    # No current user in session so render login/home page
    return render_template("home.html")

@app.route("/user-info")
def user_page():
    unique_id = session.get("user").get("userinfo").get("sub")
    jwt = session.get("user").get("id_token")
    return render_template(
        "user.html",
        session=session.get("user"),
        id = unique_id,
        jwt = jwt,
        # pretty=json.dumps(jwt, indent=4),
    )


@app.route("/callback", methods=["GET", "POST"])
def callback():
    token = oauth.auth0.authorize_access_token()
    add_user(token)
    session["user"] = token
    return redirect("/")

@app.route("/login")
def login():
    return oauth.auth0.authorize_redirect(
        redirect_uri=url_for("callback", _external=True)
    )

@app.route("/logout")
def logout():
    session.clear()
    return redirect(
        "https://"
        + DOMAIN
        + "/v2/logout?"
        + urlencode(
            {
                "returnTo": url_for("home", _external=True),
                "client_id": CLIENT_ID,
            },
            quote_via=quote_plus,
        )
    )


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True) 
    # Gcloud uses gunicorn to host server, safe not to remove above line