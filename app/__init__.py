import os
from flask import Flask
from datetime import date

from app.models import db, Usuario, Rol, Permisos, Producto, Mesa
from flask_admin import Admin
from flask_login import LoginManager

from app.admin_views import VistaProtegidaAdmin, UsuarioAdminView

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(user_id)


def create_app():
    app = Flask(__name__)

    entorno = os.environ.get('FLASK_ENV', 'development')
    from app.config import config_map
    app.config.from_object(config_map.get(entorno, config_map['default']))

    db.init_app(app)

    login_manager.init_app(app)
    login_manager.login_view = 'main.login'

    # ── Panel de administración ──────────────────────────────────────────────
    admin = Admin(app, name='PLANCLUB ADMIN', url='/admin')

    admin.add_view(UsuarioAdminView(Usuario,  db.session, name="Usuarios"))
    admin.add_view(VistaProtegidaAdmin(Rol,      db.session, name="Roles"))
    admin.add_view(VistaProtegidaAdmin(Permisos, db.session, name="Permisos"))
    admin.add_view(VistaProtegidaAdmin(Producto, db.session, name="Catálogo"))
    admin.add_view(VistaProtegidaAdmin(Mesa,     db.session, name="Mesas"))

    # ── Blueprints ───────────────────────────────────────────────────────────
    from app.routes import main as main_bp
    app.register_blueprint(main_bp)

    # ── Seed inicial ─────────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()

        if Rol.query.count() == 0:
            db.session.add_all([
                Rol(id_rol='R1', nombre='Cliente'),
                Rol(id_rol='R2', nombre='Vendedor'),
                Rol(id_rol='R3', nombre='Administrador'),
            ])
            db.session.commit()

        # Si no hay ningún usuario, el primero será el admin maestro
        if Usuario.query.count() == 0:
            admin_inicial = Usuario(
                id_usuario='U001',
                nombre='Admin',
                apellido='PlanClub',
                correo='admin@planclub.com',
                celular='3001234567',
                fecha_nacimiento=date(2000, 1, 1),
                contrasena='admin123',
                id_rol='R3',
                estado='Activa'
            )
            db.session.add(admin_inicial)
            db.session.commit()
            print("👑 Admin creado: admin@planclub.com / admin123")

    return app
