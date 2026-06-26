import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Render asigna un puerto dinámico en la variable de entorno PORT
    puerto = int(os.environ.get("PORT", 5000))
    # Escucha en 0.0.0.0 para recibir peticiones externas
    app.run(host='0.0.0.0', port=puerto)