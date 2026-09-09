from datetime import datetime
from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False, nullable=False) # Notas internas para atendentes/admins
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    ticket = relationship("Ticket", back_populates="comments")
    user = relationship("User", back_populates="comments")
