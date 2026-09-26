import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from providers.youtube_reviews import create_youtube_search_link

from extensions import db
from services.product_search import search_products
# Import all database models
from models import (
    User,
    UserPreference,
    SearchHistory,
    Product,
    ProductSource,
    ProductOffer,
    Comparison,
    ComparisonItem,
    AIConversation,
    AIMessage
)

# Import authentication routes
from routes.auth import auth_bp


# --------------------------------
# Load Environment Variables
# --------------------------------

load_dotenv()


# --------------------------------
# Create Flask Application
# --------------------------------

app = Flask(__name__)

# Allow React frontend to communicate with Flask
CORS(app)


# --------------------------------
# JWT Configuration
# --------------------------------

jwt_secret = os.getenv("JWT_SECRET_KEY")

if not jwt_secret:
    raise RuntimeError(
        "JWT_SECRET_KEY is not configured in .env"
    )

app.config["JWT_SECRET_KEY"] = jwt_secret

jwt = JWTManager(app)


# --------------------------------
# Database Configuration
# --------------------------------

database_url = os.getenv("DATABASE_URL")

if database_url:
    if database_url.startswith("postgresql+psycopg2://"):
        database_url = database_url.replace(
            "postgresql+psycopg2://",
            "postgresql+psycopg://",
            1
        )
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1
        )
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://",
            "postgresql+psycopg://",
            1
        )

if not database_url:
    raise RuntimeError(
        "DATABASE_URL is not configured in .env"
    )

app.config["SQLALCHEMY_DATABASE_URI"] = database_url

if not database_url:
    raise RuntimeError(
        "DATABASE_URL is not configured in .env"
    )

app.config["SQLALCHEMY_DATABASE_URI"] = database_url

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# --------------------------------
# Initialize Database
# --------------------------------

db.init_app(app)


# --------------------------------
# Register Authentication Routes
# --------------------------------

app.register_blueprint(auth_bp)


# --------------------------------
# Create Database Tables
# --------------------------------

with app.app_context():
    db.create_all()


# --------------------------------
# API Health Check
# --------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():

    return jsonify({
        "status": "success",
        "message": "SmartPick backend is running!",
        "service": "SmartPick API"
    })


# --------------------------------
# Database Health Check
# --------------------------------

@app.route("/api/database-health", methods=["GET"])
def database_health():

    try:

        db.session.execute(
            db.text("SELECT 1")
        )

        return jsonify({
            "status": "success",
            "message": "SmartPick database connection is working!"
        })

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": "Database connection failed",
            "error": str(error)
        }), 500

# ---------------------------------------
# PRODUCT SEARCH API
# ---------------------------------------

@app.route("/api/products/search", methods=["GET"])
def product_search():

    # ---------------------------------------
    # GET SEARCH QUERY
    # ---------------------------------------

    query = request.args.get(
        "q",
        ""
    ).strip()

    # ---------------------------------------
    # GET PAGINATION OFFSET
    # ---------------------------------------

    offset = request.args.get(
        "offset",
        0,
        type=int
    )

    # ---------------------------------------
    # VALIDATE SEARCH QUERY
    # ---------------------------------------

    if not query:

        return jsonify({
            "status": "error",
            "message": "Search query is required"
        }), 400

    try:

        # ---------------------------------------
        # SEARCH PRODUCTS
        # ---------------------------------------

        print(
            f"PRODUCT SEARCH: '{query}' "
            f"(offset={offset})"
        )

        products = search_products(
            query=query,
            location="India",
            ebay_offset=offset
        )

        print(
            f"PRODUCT SEARCH COMPLETED: "
            f"{len(products)} products"
        )

        # ---------------------------------------
        # ADD YOUTUBE SEARCH LINK
        # ---------------------------------------
        #
        # IMPORTANT:
        #
        # We are NOT using the YouTube Data API here.
        #
        # We only create a normal YouTube search URL.
        #
        # This means:
        #
        # Product search
        #       ↓
        # Create YouTube URL
        #       ↓
        # Return product
        #
        # No YouTube API quota is consumed.
        #
        # ---------------------------------------

        for index, product in enumerate(products):

            # ---------------------------------------
            # GET PRODUCT NAME
            # ---------------------------------------

            product_name = (
                product.get("title")
                or product.get("name")
                or ""
            ).strip()

            # ---------------------------------------
            # PRODUCT HAS NO NAME
            # ---------------------------------------

            if not product_name:

                product["youtube_reviews"] = []

                print(
                    f"YOUTUBE LINK: Skipped "
                    f"{index + 1}/{len(products)} "
                    f"(no product title)"
                )

                continue

            # ---------------------------------------
            # CREATE YOUTUBE SEARCH LINK
            # ---------------------------------------

            try:

                youtube_link = create_youtube_search_link(
                    product_name
                )

                               # ---------------------------------------
                # ATTACH LINK TO PRODUCT
                # ---------------------------------------

                product["youtube_reviews"] = [

                    {
                        "title": (
                            f"YouTube reviews for "
                            f"{product_name}"
                        ),

                        "url": youtube_link
                    }

                ]

                print(
                    f"YOUTUBE LINK "
                    f"{index + 1}/{len(products)}: "
                    f"{product_name}"
                )

            except Exception as youtube_error:

                print(
                    f"YOUTUBE LINK ERROR for "
                    f"'{product_name}': "
                    f"{youtube_error}"
                )

                product["youtube_reviews"] = []

        # ---------------------------------------
        # RETURN PRODUCTS
        # ---------------------------------------

        return jsonify({

            "status": "success",

            "query": query,

            "offset": offset,

            "count": len(products),

            # ---------------------------------------
            # LOAD MORE STATUS
            # ---------------------------------------
            #
            # First request:
            # offset = 0
            #
            # We have Google + eBay results,
            # so Load More should remain available.
            #
            # Later requests:
            # offset = 200, 400, 600...
            #
            # If we receive 200 products,
            # there may be another eBay page.
            #
            # ---------------------------------------

            "has_more": (
                len(products) >= 200
                if offset > 0
                else True
            ),

            "products": products

        })

    # ---------------------------------------
    # ERROR HANDLING
    # ---------------------------------------

    except Exception as error:

        print(
            "PRODUCT SEARCH ERROR:",
            str(error)
        )

        return jsonify({

            "status": "error",

            "message": "Product search failed",

            "error": str(error),

            "query": query,

            "offset": offset,

            "count": 0,

            "has_more": False,

            "products": []

        }), 500


# ---------------------------------------
# YOUTUBE REVIEWS API
# ---------------------------------------

@app.route("/api/youtube/reviews", methods=["GET"])
def youtube_reviews():

    # ---------------------------------------
    # GET PRODUCT NAME
    # ---------------------------------------

    product_name = request.args.get(
        "product_name",
        ""
    ).strip()

    # ---------------------------------------
    # VALIDATE PRODUCT NAME
    # ---------------------------------------

    if not product_name:

        return jsonify({

            "status": "error",

            "message": "Product name is required",

            "youtube_reviews": []

        }), 400

    try:

        # ---------------------------------------
        # CREATE YOUTUBE SEARCH LINK
        # ---------------------------------------
        #
        # This does NOT call the YouTube API.
        #
        # It only creates a YouTube search URL.
        #
        # ---------------------------------------

        youtube_link = create_youtube_search_link(
            product_name
        )

        print(
            f"YOUTUBE LINK CREATED: "
            f"{product_name}"
        )

        # ---------------------------------------
        # RETURN YOUTUBE LINK
        # ---------------------------------------

        return jsonify({

            "status": "success",

            "product_name": product_name,

            "youtube_reviews": [

                {
                    "title": (
                        f"{product_name} "
                        f"Review Videos"
                    ),

                    "url": youtube_link
                }

            ]

        })

    except Exception as error:

        print(
            f"YOUTUBE ERROR for "
            f"'{product_name}': "
            f"{error}"
        )

        return jsonify({

            "status": "error",

            "message": "YouTube link creation failed",

            "youtube_reviews": []

        }), 500


# ---------------------------------------
# START FLASK SERVER
# ---------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )