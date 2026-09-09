from datetime import datetime
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.company import Company
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.models.comment import TicketComment

def seed_database():
    print("Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Verificar se já existe Super Admin
        super_admin = db.query(User).filter(User.email == "superadmin@chamados.com").first()
        if super_admin:
            print("Banco de dados já contém dados semeados.")
            return

        print("Semeando empresas...")
        company1 = Company(
            name="Tech Solutions Brasil",
            cnpj="11.222.333/0001-44",
            email="contato@techsolutions.com.br",
            phone="(11) 3456-7890",
            is_active=True
        )
        company2 = Company(
            name="Acme Logística & Transportes",
            cnpj="22.333.444/0001-55",
            email="operacoes@acmelog.com.br",
            phone="(19) 3123-4567",
            is_active=True
        )
        company3 = Company(
            name="Global Varejo & Distribuição",
            cnpj="33.444.555/0001-66",
            email="suporte@globalvarejo.com",
            phone="(21) 2987-6543",
            is_active=True
        )
        db.add_all([company1, company2, company3])
        db.commit()
        db.refresh(company1)
        db.refresh(company2)
        db.refresh(company3)

        print("Semeando usuários...")
        # 1. Super Admin Geral (Acesso a todas as empresas)
        superadmin = User(
            full_name="Super Administrador Geral",
            email="superadmin@chamados.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.SUPER_ADMIN,
            phone="(11) 99999-0000",
            department="Diretoria / Master",
            is_active=True
        )

        # 2. Tech Solutions Brasil (Empresa 1)
        admin_tech = User(
            company_id=company1.id,
            full_name="Lucas Andrade (Admin Tech)",
            email="admin.tech@empresa1.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.COMPANY_ADMIN,
            phone="(11) 98888-1111",
            department="Gestão de TI",
            is_active=True
        )
        user_tech1 = User(
            company_id=company1.id,
            full_name="João Silva (Técnico N2)",
            email="joao.silva@empresa1.com",
            hashed_password=get_password_hash("user123"),
            role=UserRole.COMPANY_USER,
            phone="(11) 97777-2222",
            department="Suporte Técnico",
            is_active=True
        )
        user_tech2 = User(
            company_id=company1.id,
            full_name="Mariana Santos (Solicitante)",
            email="mariana.vendas@empresa1.com",
            hashed_password=get_password_hash("user123"),
            role=UserRole.COMPANY_USER,
            phone="(11) 96666-3333",
            department="Comercial",
            is_active=True
        )

        # 3. Acme Logística (Empresa 2)
        admin_acme = User(
            company_id=company2.id,
            full_name="Renata Oliveira (Admin Acme)",
            email="admin.acme@empresa2.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.COMPANY_ADMIN,
            phone="(19) 98888-4444",
            department="Administração",
            is_active=True
        )
        user_acme1 = User(
            company_id=company2.id,
            full_name="Carlos Eduardo (Operações)",
            email="carlos.operacoes@empresa2.com",
            hashed_password=get_password_hash("user123"),
            role=UserRole.COMPANY_USER,
            phone="(19) 95555-5555",
            department="Frota e Logística",
            is_active=True
        )

        db.add_all([superadmin, admin_tech, user_tech1, user_tech2, admin_acme, user_acme1])
        db.commit()
        db.refresh(superadmin)
        db.refresh(admin_tech)
        db.refresh(user_tech1)
        db.refresh(user_tech2)
        db.refresh(admin_acme)
        db.refresh(user_acme1)

        print("Semeando categorias...")
        cat1 = Category(name="Suporte de TI & Hardware", description="Computadores, monitores, periféricos", color="#3B82F6", company_id=None)
        cat2 = Category(name="Sistemas & ERP", description="Dúvidas de software, erros e acessos a módulos", color="#8B5CF6", company_id=None)
        cat3 = Category(name="Rede & Internet", description="Wi-Fi, VPN, cabeamento e conexão", color="#10B981", company_id=None)
        cat4 = Category(name="Manutenção Predial", description="Ar condicionado, elétrica e instalações", color="#F59E0B", company_id=None)
        db.add_all([cat1, cat2, cat3, cat4])
        db.commit()
        db.refresh(cat1)
        db.refresh(cat2)
        db.refresh(cat3)
        db.refresh(cat4)

        print("Semeando chamados...")
        tkt1 = Ticket(
            code="TKT-2026-0001",
            company_id=company1.id,
            category_id=cat1.id,
            creator_id=user_tech2.id,
            assigned_to_id=user_tech1.id,
            title="Notebook não liga após atualização de drivers",
            description="O computador travou na reinicialização e apresenta tela preta intermitente. Trabalho parado na área de vendas.",
            priority=TicketPriority.URGENT,
            status=TicketStatus.IN_PROGRESS
        )
        tkt2 = Ticket(
            code="TKT-2026-0002",
            company_id=company1.id,
            category_id=cat2.id,
            creator_id=user_tech2.id,
            assigned_to_id=None,
            title="Liberar acesso ao módulo de emissão de NF-e",
            description="Preciso da liberação de perfil faturista no ERP para cobrir férias da colega.",
            priority=TicketPriority.MEDIUM,
            status=TicketStatus.OPEN
        )
        tkt3 = Ticket(
            code="TKT-2026-0003",
            company_id=company2.id,
            category_id=cat3.id,
            creator_id=user_acme1.id,
            assigned_to_id=admin_acme.id,
            title="Lentidão severa na VPN do galpão de cargas",
            description="Leitores de código de barras não sincronizam com o servidor principal.",
            priority=TicketPriority.HIGH,
            status=TicketStatus.RESOLVED,
            resolved_at=datetime.utcnow()
        )
        db.add_all([tkt1, tkt2, tkt3])
        db.commit()
        db.refresh(tkt1)
        db.refresh(tkt2)
        db.refresh(tkt3)

        print("Semeando timeline de comentários...")
        c1 = TicketComment(
            ticket_id=tkt1.id,
            user_id=user_tech2.id,
            message="Chamado aberto com prioridade Urgente.",
            is_internal=False
        )
        c2 = TicketComment(
            ticket_id=tkt1.id,
            user_id=user_tech1.id,
            message="Estou indo à sua mesa recolher o equipamento para teste de bancada na TI.",
            is_internal=False
        )
        c3 = TicketComment(
            ticket_id=tkt3.id,
            user_id=admin_acme.id,
            message="Reiniciado o switch do galpão 2 e ajustado o DNS da VPN. Conexão restabelecida.",
            is_internal=False
        )
        db.add_all([c1, c2, c3])
        db.commit()

        print("\n=== BANCO DE DADOS POPULADO COM SUCESSO! ===")
        print("Usuários para teste:")
        print("1. Super Admin Geral: superadmin@chamados.com | Senha: admin123")
        print("2. Admin Tech (Empresa 1): admin.tech@empresa1.com | Senha: admin123")
        print("3. Solicitante Tech (Empresa 1): mariana.vendas@empresa1.com | Senha: user123")
        print("4. Admin Acme (Empresa 2): admin.acme@empresa2.com | Senha: admin123")
        print("5. Operador Acme (Empresa 2): carlos.operacoes@empresa2.com | Senha: user123")
    except Exception as e:
        db.rollback()
        print(f"Erro ao semear banco: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
