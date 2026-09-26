from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from models.user import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name:
        return jsonify({
            "status": "error",
            "message": "Name is required"
        }), 400

    if not email:
        return jsonify({
            "status": "error",
            "message": "Email is required"
        }), 400

    if not password:
        return jsonify({
            "status": "error",
            "message": "Password is required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "status": "error",
            "message": "Password must contain at least 8 characters"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "status": "error",
            "message": "An account with this email already exists"
        }), 409

    password_hash = generate_password_hash(password)

    user = User(
        name=name,
        email=email,
        password_hash=password_hash
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash,
        password
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid email or password"
        }), 401

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200