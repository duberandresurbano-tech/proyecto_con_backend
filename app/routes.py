from flask import Blueprint, jsonify, request, render_template
from app.models import db, Usuario, Rol
from datetime import datetime

# 🛠️ CORREGIDO: Cambiamos 'bp' por 'main' para que coincida con tus url_for del HTML
main = Blueprint('main', __name__)

# 1. RUTA RAÍZ
@main.route('/')
def index():
    return render_template('html/index.html')

# 2. RUTAS DE NAVEGACIÓN (URLs limpias con @main.route)
@main.route('/inicio')
def inicio():
    return render_template('html/inicio.html')

@main.route('/catalogo')
def catalogo():
    return render_template('html/catalogo.html')

@main.route('/login')
def login_page():
    return render_template('html/login.html')

@main.route('/chat')
def chat():
    return render_template('html/chat.html')

@main.route('/perfil')
def perfil():
    return render_template('html/perfil.html')

@main.route('/reserva')
def reserva():
    return render_template('html/reserva.html')


# 3. RUTA DE PRUEBA: Crear rol primero
@main.route('/crear-rol-prueba', methods=['GET'])
def crear_rol():
    try:
        nuevo_rol = Rol(
            id_rol="ROL001",
            nombre="Cliente"
        )
        db.session.add(nuevo_rol)
        db.session.commit()
        return jsonify({"mensaje": "¡Rol creado con éxito en SQLite!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. RUTA DE PRUEBA: Mantenemos intacta tu ruta para meter el usuario a la DB
@main.route('/crear-usuario-prueba', methods=['GET'])
def crear_usuario():
    try:
        nuevo_usuario = Usuario(
            id_usuario="101010",
            nombre="Juan",
            apellido="Perez",
            correo="juan@planclub.com",
            celular="1234567890",
            fecha_nacimiento="1990-01-01",
            contrasena="clave123",
            estado="Activa",
            id_rol="ROL001"
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({"mensaje": "¡Primer usuario guardado con éxito en SQLite!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. RUTA DE REGISTRO REAL - Guarda en base de datos SQLite
@main.route('/api/registro', methods=['POST'])
def registro():
    try:
        data = request.get_json()
        
        # Verificar si el rol "Cliente" existe, si no, crearlo
        rol_cliente = Rol.query.filter_by(id_rol="ROL001").first()
        if not rol_cliente:
            rol_cliente = Rol(id_rol="ROL001", nombre="Cliente")
            db.session.add(rol_cliente)
            db.session.commit()
        
        # Generar ID único basado en el nombre de usuario
        import random
        id_usuario = f"U{random.randint(1000, 9999)}"
        
        # Convertir fecha de string a objeto date
        fecha_nacimiento = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
        
        nuevo_usuario = Usuario(
            id_usuario=id_usuario,
            nombre=data['nombre'],
            apellido=data['apellido'],
            correo=data['correo'],
            celular=data['celular'],
            fecha_nacimiento=fecha_nacimiento,
            contrasena=data['contrasena'],
            estado="Activa",
            id_rol="ROL001"  # Por defecto rol de cliente
        )
        
        db.session.add(nuevo_usuario)
        db.session.commit()
        
        return jsonify({
            "mensaje": "¡Registro exitoso! Bienvenido a PlanClub.",
            "id_usuario": id_usuario
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 6. RUTA DE LOGIN REAL - Verifica contra base de datos
@main.route('/api/login', methods=['POST'])
def login_api():
    try:
        data = request.get_json()
        
        usuario = Usuario.query.filter_by(correo=data['correo']).first()
        
        if usuario and usuario.contrasena == data['contrasena']:
            return jsonify({
                "mensaje": "Login exitoso",
                "usuario": usuario.nombre,
                "id_usuario": usuario.id_usuario
            }), 200
        else:
            return jsonify({"error": "Credenciales incorrectas"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
