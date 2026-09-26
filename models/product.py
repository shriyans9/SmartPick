from datetime import datetime

from extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(500),
        nullable=False,
        index=True
    )

    brand = db.Column(
        db.String(150),
        index=True
    )

    category = db.Column(
        db.String(150),
        index=True
    )

    description = db.Column(
        db.Text
    )

    image_url = db.Column(
        db.Text
    )

    model_number = db.Column(
        db.String(200),
        index=True
    )

    specifications = db.Column(
        db.JSON
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    sources = db.relationship(
        "ProductSource",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    offers = db.relationship(
        "ProductOffer",
        back_populates="product",
        cascade="all, delete-orphan"
    )


class ProductSource(db.Model):
    __tablename__ = "product_sources"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    source_name = db.Column(
        db.String(150),
        nullable=False
    )

    source_product_id = db.Column(
        db.String(300)
    )

    source_url = db.Column(
        db.Text
    )

    last_checked_at = db.Column(
        db.DateTime
    )

    product = db.relationship(
        "Product",
        back_populates="sources"
    )


class ProductOffer(db.Model):
    __tablename__ = "product_offers"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    source_name = db.Column(
        db.String(150),
        nullable=False
    )

    product_url = db.Column(
        db.Text
    )

    price = db.Column(
        db.Numeric(12, 2)
    )

    currency = db.Column(
        db.String(10),
        default="INR"
    )

    availability = db.Column(
        db.String(100)
    )

    shipping_cost = db.Column(
        db.Numeric(12, 2)
    )

    rating = db.Column(
        db.Numeric(3, 2)
    )

    review_count = db.Column(
        db.Integer
    )

    last_checked_at = db.Column(
        db.DateTime
    )

    product = db.relationship(
        "Product",
        back_populates="offers"
    )