import os

# Directorio base del proyecto (carpeta 'app')
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Carpeta 'instance' donde vive la base de datos SQLite
INSTANCE_DIR = os.path.normpath(os.path.join(BASE_DIR, '..', 'instance'))

def obtener_database_uri():
    """Obtiene y limpia la URL de la base de datos para producción o local."""
    url = os.environ.get('DATABASE_URL')
    
    if url:
        # FIX CRÍTICO PARA RENDER: SQLAlchemy requiere 'postgresql://' en lugar de 'postgres://'
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url
        
    # Si no hay variable de entorno, usa SQLite local
    return f"sqlite:///{os.path.join(INSTANCE_DIR, 'planclub.db')}"


class Config:
    """Configuración base compartida por todos los entornos."""
    
    # Clave secreta base para desarrollo local
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_key_solo_para_local_cambiar_en_prod')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = obtener_database_uri()


class DevelopmentConfig(Config):
    """Entorno de desarrollo: debug activado."""
    DEBUG = True


class ProductionConfig(Config):
    """Entorno de producción: debug desactivado, exige variables de entorno reales."""
    DEBUG = False

    # En producción, si no existe SECRET_KEY, levantará un error o fallará rápido
    # para evitar despliegues inseguros.
    SECRET_KEY = os.environ.get('SECRET_KEY')


# Mapa para seleccionar el entorno fácilmente desde __init__.py
config_map = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'default':     DevelopmentConfig
}