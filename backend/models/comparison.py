from datetime import datetime

from extensions import db


class Comparison(db.Model):
    __tablename__ = "comparisons"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    title = db.Column(
        db.String(200)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    items = db.relationship(
        "ComparisonItem",
        back_populates="comparison",
        cascade="all, delete-orphan"
    )


class ComparisonItem(db.Model):
    __tablename__ = "comparison_items"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    comparison_id = db.Column(
        db.Integer,
        db.ForeignKey("comparisons.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    comparison = db.relationship(
        "Comparison",
        back_populates="items"
    )