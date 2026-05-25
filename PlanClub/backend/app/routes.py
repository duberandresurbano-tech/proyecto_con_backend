from flask import Blueprint, jsonify, request
from app.models import db, Usuario

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return jsonify({"mensaje": "Servidor de PlanClub corriendo perfectamente"}), 200

# RUTA DE PRUEBA: Para meter el primer usuario a la base de datos
@bp.route('/crear-usuario-prueba', methods=['GET'])
def crear_usuario():
    try:
        # Creamos un registro con la estructura de tu modelo
        nuevo_usuario = Usuario(
            id_usuario="101010",
            nombre="Juan",
            apellido="Perez",
            correo="juan@planclub.com",
            contrasena="clave123",
            estado="activo",
            verificacion="completada"
        )
        
        # Le decimos a la base de datos que guarde el registro
        db.session.add(nuevo_usuario)
        db.session.commit()
        
        return jsonify({"mensaje": "¡Primer usuario guardado con éxito en SQLite!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500