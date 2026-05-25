from app import create_app

app = create_app()

if __name__ == '__main__':
    # Arranca el servidor de desarrollo en el puerto 5000
    app.run(debug=True, port=5000)