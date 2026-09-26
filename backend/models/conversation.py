from datetime import datetime

from extensions import db


class AIConversation(db.Model):
    __tablename__ = "ai_conversations"

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

    messages = db.relationship(
        "AIMessage",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )


class AIMessage(db.Model):
    __tablename__ = "ai_messages"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    conversation_id = db.Column(
        db.Integer,
        db.ForeignKey("ai_conversations.id"),
        nullable=False
    )

    role = db.Column(
        db.String(30),
        nullable=False
    )

    content = db.Column(
        db.Text,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    conversation = db.relationship(
        "AIConversation",
        back_populates="messages"
    )