import os

# Directorio base del proyecto (carpeta 'app')
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Carpeta 'instance' donde vive la base de datos SQLite
INSTANCE_DIR = os.path.join(BASE_DIR, '..', 'instance')


class Config:
    """Configuración base compartida por todos los entornos."""

    # Clave secreta: la lee desde variable de entorno o usa un valor de respaldo
    # para desarrollo. NUNCA dejar el fallback en producción.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_key_solo_para_local_cambiar_en_prod')

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Ruta absoluta a la base de datos SQLite dentro de /instance
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(INSTANCE_DIR, 'planclub.db')}"
    )


class DevelopmentConfig(Config):
    """Entorno de desarrollo: debug activado."""
    DEBUG = True


class ProductionConfig(Config):
    """Entorno de producción: debug desactivado, exige variables de entorno reales."""
    DEBUG = False

    # En producción, SECRET_KEY DEBE venir de una variable de entorno real
    SECRET_KEY = os.environ.get('SECRET_KEY')

    # En producción puedes cambiar a PostgreSQL/MySQL simplemente
    # seteando la variable de entorno DATABASE_URL:
    # DATABASE_URL=postgresql://user:pass@host/dbname


# Mapa para seleccionar el entorno fácilmente desde __init__.py
config_map = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'default':     DevelopmentConfig
}
