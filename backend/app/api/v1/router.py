from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    companies,
    users,
    tickets,
    comments,
    categories,
    dashboard
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
api_router.include_router(companies.router, prefix="/companies", tags=["Empresas"])
api_router.include_router(users.router, prefix="/users", tags=["Usuários"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categorias"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Chamados"])
api_router.include_router(comments.router, prefix="", tags=["Comentários"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
