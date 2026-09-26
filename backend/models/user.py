from datetime import datetime

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
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

    preference = db.relationship(
        "UserPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    search_history = db.relationship(
        "SearchHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class UserPreference(db.Model):
    __tablename__ = "user_preferences"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    preferred_category = db.Column(
        db.String(100)
    )

    preferred_budget_min = db.Column(
        db.Numeric(12, 2)
    )

    preferred_budget_max = db.Column(
        db.Numeric(12, 2)
    )

    priorities = db.Column(
        db.Text
    )

    user = db.relationship(
        "User",
        back_populates="preference"
    )


class SearchHistory(db.Model):
    __tablename__ = "search_history"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    query = db.Column(
        db.String(500),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user = db.relationship(
        "User",
        back_populates="search_history"
    )