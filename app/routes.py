from flask import Blueprint, jsonify, request, render_template, redirect, url_for
from app.models import db, Usuario, Rol
from datetime import datetime
from flask_login import login_user, login_required, current_user, logout_user

main = Blueprint('main', __name__)

# ── Páginas ──────────────────────────────────────────────────────────────────

@main.route('/')
def index():
    return render_template('html/index.html')

@main.route('/inicio')
@login_required
def inicio():
    return render_template('html/inicio.html')

@main.route('/catalogo')
@login_required
def catalogo():
    return render_template('html/catalogo.html')

@main.route('/login')
def login_page():
    return render_template('html/login.html')

@main.route('/chat')
@login_required
def chat():
    return render_template('html/chat.html')

@main.route('/perfil')
@login_required
def perfil():
    return render_template('html/perfil.html')

@main.route('/reserva')
@login_required
def reserva():
    return render_template('html/reserva.html')


# ── API Registro ──────────────────────────────────────────────────────────────

@main.route('/api/registro', methods=['POST'])
def registro():
    try:
        data = request.get_json()

        # Verificar que el correo no esté ya registrado
        correo = data['correo'].strip().lower()
        if Usuario.query.filter_by(correo=correo).first():
            return jsonify({"error": "Este correo ya está registrado."}), 409

        # Asegurar que el rol Cliente existe
        if not Rol.query.filter_by(id_rol='R1').first():
            db.session.add(Rol(id_rol='R1', nombre='Cliente'))
            db.session.commit()

        fecha_nacimiento = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()

        nuevo_usuario = Usuario(
            nombre=data['nombre'].strip(),
            apellido=data['apellido'].strip(),
            correo=correo,
            celular=data['celular'].strip(),
            fecha_nacimiento=fecha_nacimiento,
            contrasena=data['contrasena'],   # texto plano (sin hash)
            estado='Activa',
            id_rol='R1'
        )
        # ⚠️ NO pasamos id_usuario — el modelo lo genera solo con generar_id('U')

        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({
            "mensaje": "¡Registro exitoso! Bienvenido a PlanClub.",
            "id_usuario": nuevo_usuario.id_usuario
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ── API Login ─────────────────────────────────────────────────────────────────

@main.route('/api/login', methods=['POST'])
def login_api():
    try:
        data = request.get_json()

        # Normalizar correo igual que en registro
        correo = data['correo'].strip().lower()

        usuario = Usuario.query.filter_by(correo=correo).first()

        if usuario and usuario.contrasena == data['contrasena']:
            login_user(usuario, remember=True)
            return jsonify({
                "mensaje": "Login exitoso",
                "usuario": usuario.nombre,
                "id_usuario": usuario.id_usuario,
                "rol": usuario.id_rol
            }), 200
        else:
            return jsonify({"error": "Credenciales incorrectas"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Logout ────────────────────────────────────────────────────────────────────

@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))


# ── Rutas de prueba (puedes borrarlas en producción) ──────────────────────────

@main.route('/crear-rol-prueba')
def crear_rol():
    try:
        db.session.add(Rol(id_rol='ROL001', nombre='Cliente'))
        db.session.commit()
        return jsonify({"mensaje": "Rol creado"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/crear-usuario-prueba')
def crear_usuario():
    try:
        db.session.add(Usuario(
            nombre='Juan', apellido='Perez',
            correo='juan@planclub.com', celular='1234567890',
            fecha_nacimiento=datetime(1990, 1, 1).date(),
            contrasena='clave123', estado='Activa', id_rol='R1'
        ))
        db.session.commit()
        return jsonify({"mensaje": "Usuario creado"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
