import os
from flask import Flask
from app.models import db
from app.config import config_map


def create_app():
    app = Flask(__name__)

    # Selecciona el entorno según la variable de entorno FLASK_ENV
    # Si no está definida, usa 'development' por defecto
    entorno = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config_map.get(entorno, config_map['default']))

    # Inicializar la extensión de base de datos con la app
    db.init_app(app)

    # 🛠️ CORREGIDO: Importamos 'main' (que es el nombre que le dimos en routes.py)
    from app.routes import main as main_bp
    app.register_blueprint(main_bp)

    # Crear todas las tablas si no existen (útil en desarrollo)
    with app.app_context():
        db.create_all()

    return app
