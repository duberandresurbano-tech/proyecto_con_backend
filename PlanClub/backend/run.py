from app import create_app

app = create_app()

if __name__ == '__main__':
    # host='0.0.0.0' hace que el servidor escuche en toda tu red local
    # port=5000 es el puerto estándar
    app.run(host='0.0.0.0', port=5000, debug=True)