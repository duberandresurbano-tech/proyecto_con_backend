from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# ==========================================
# 1. TABLA: ROL
# ==========================================
class Rol(db.Model):
    __tablename__ = 'rol'
    
    id_rol = db.Column(db.String(20), primary_key=True)
    nombre = db.Column(db.String(20), nullable=False)

    # Relación POO con la tabla intermedia usuario_rol
    usuarios_asociados = db.relationship('UsuarioRol', backref='rol_perfil', lazy=True, cascade="all, delete-orphan")


# ==========================================
# 2. TABLA: PERMISOS
# ==========================================
class Permisos(db.Model):
    __tablename__ = 'permisos'
    
    id_permiso = db.Column(db.String(20), primary_key=True)
    accion = db.Column(db.String(100), nullable=False)


# ==========================================
# 3. TABLA INTERMEDIA: PERMISOS_ROL
# ==========================================
class PermisosRol(db.Model):
    __tablename__ = 'permisos_rol'
    
    id_permiso = db.Column(db.String(20), db.ForeignKey('permisos.id_permiso', onupdate='CASCADE', ondelete='CASCADE'), primary_key=True)
    id_rol = db.Column(db.String(20), db.ForeignKey('rol.id_rol', onupdate='CASCADE', ondelete='CASCADE'), primary_key=True)


# ==========================================
# 4. TABLA: USUARIO
# ==========================================
class Usuario(db.Model):
    __tablename__ = 'usuario'
    
    id_usuario = db.Column(db.String(20), primary_key=True)
    nombre = db.Column(db.String(20), nullable=False)
    apellido = db.Column(db.String(20), nullable=False)
    correo = db.Column(db.String(100), nullable=False, unique=True)
    contrasena = db.Column(db.String(255), nullable=False) # Se mapea CONTRASEÑA sin la Ñ para evitar problemas de encoding
    estado = db.Column(db.String(20), nullable=False)
    verificacion = db.Column(db.String(20), nullable=False)

    # Relaciones POO para acceder fácil a sus datos asociados
    telefonos = db.relationship('Telefono', backref='dueno', lazy=True, cascade="all, delete-orphan")
    roles_asociados = db.relationship('UsuarioRol', backref='usuario_perfil', lazy=True, cascade="all, delete-orphan")
    reservas = db.relationship('Reserva', backref='cliente', lazy=True)
    pedidos = db.relationship('Pedido', backref='usuario_solicitante', lazy=True)
    ventas = db.relationship('Venta', backref='vendedor', lazy=True)
    incidencias = db.relationship('Incidencia', backref='usuario_reporta', lazy=True)
    reseñas = db.relationship('Resena', backref='autor', lazy=True)


# ==========================================
# 5. TABLA INTERMEDIA: USUARIO_ROL
# ==========================================
class UsuarioRol(db.Model):
    __tablename__ = 'usuario_rol'
    
    id_usuario = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), primary_key=True)
    id_rol = db.Column(db.String(20), db.ForeignKey('rol.id_rol', onupdate='CASCADE', ondelete='CASCADE'), primary_key=True)


# ==========================================
# 6. TABLA: TELEFONO
# ==========================================
class Telefono(db.Model):
    __tablename__ = 'telefono'
    
    id_telefono = db.Column(db.String(20), primary_key=True)
    id_usuario = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    numero = db.Column(db.BigInteger, nullable=False)


# ==========================================
# 7. TABLA: MESA
# ==========================================
class Mesa(db.Model):
    __tablename__ = 'mesa'
    
    id_mesa = db.Column(db.String(20), primary_key=True)
    numero = db.Column(db.Integer, nullable=False, unique=True)
    capacidad = db.Column(db.Integer, nullable=False)
    zona = db.Column(db.String(20), nullable=False)
    estado = db.Column(db.String(20), nullable=False)

    # Relaciones
    reservas = db.relationship('Reserva', backref='mesa_reservada', lazy=True)
    pedidos = db.relationship('Pedido', backref='mesa_ocupada', lazy=True)


# ==========================================
# 8. TABLA: RESERVA
# ==========================================
class Reserva(db.Model):
    __tablename__ = 'reserva'
    
    id_reserva = db.Column(db.String(20), primary_key=True)
    id_usuario = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    id_mesa = db.Column(db.String(20), db.ForeignKey('mesa.id_mesa', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(20), nullable=False)
    cantidad_personas = db.Column(db.Integer, nullable=False)


# ==========================================
# 9. TABLA: PRODUCTO
# ==========================================
class Producto(db.Model):
    __tablename__ = 'producto'
    
    id_producto = db.Column(db.String(20), primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    precio = db.Column(db.Integer, nullable=False)
    categoria = db.Column(db.String(20), nullable=False)
    cantidad_actual = db.Column(db.Integer, nullable=False) # Mapeado sin errores de ortografía del SQL
    punto_reorden = db.Column(db.Integer, nullable=False)


# ==========================================
# 10. TABLA: PEDIDO
# ==========================================
class Pedido(db.Model):
    __tablename__ = 'pedido'
    
    id_pedido = db.Column(db.String(20), primary_key=True)
    id_usuario = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    id_mesa = db.Column(db.String(20), db.ForeignKey('mesa.id_mesa', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(20), nullable=False)
    metodo_pago = db.Column(db.String(20), nullable=False)
    observaciones = db.Column(db.Text, nullable=True)

    # Relaciones hacia los detalles y pagos
    detalles = db.relationship('DetallePedido', backref='pedido_padre', lazy=True, cascade="all, delete-orphan")
    pagos = db.relationship('Pago', backref='pedido_asociado', lazy=True, cascade="all, delete-orphan")


# ==========================================
# 11. TABLA: DETALLE_PEDIDO
# ==========================================
class DetallePedido(db.Model):
    __tablename__ = 'detalle_pedido'
    
    id_detalle_pedido = db.Column(db.String(20), primary_key=True)
    id_pedido = db.Column(db.String(20), db.ForeignKey('pedido.id_pedido', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    id_producto = db.Column(db.String(20), db.ForeignKey('producto.id_producto', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Integer, nullable=False)
    precio = db.Column(db.Integer, nullable=False)


# ==========================================
# 12. TABLA: INSUMO
# ==========================================
class Insumo(db.Model):
    __tablename__ = 'insumo'
    
    id_insumo = db.Column(db.String(20), primary_key=True)
    nombre = db.Column(db.String(20), nullable=False)
    unidad = db.Column(db.String(20), nullable=False)
    costo_envase = db.Column(db.Integer, nullable=False)
    costo_unitario = db.Column(db.Integer, nullable=False)


# ==========================================
# 13. TABLA: RECETAS
# ==========================================
class Recetas(db.Model):
    __tablename__ = 'recetas'
    
    id_receta = db.Column(db.String(20), primary_key=True)
    id_producto = db.Column(db.String(20), db.ForeignKey('producto.id_producto', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    nombre = db.Column(db.String(20), nullable=False)

    detalles_receta = db.relationship('DetalleReceta', backref='receta_padre', lazy=True, cascade="all, delete-orphan")


# ==========================================
# 14. TABLA: DETALLE_RECETA
# ==========================================
class DetalleReceta(db.Model):
    __tablename__ = 'detalle_receta'
    
    id_detalle_receta = db.Column(db.String(20), primary_key=True)
    id_receta = db.Column(db.String(20), db.ForeignKey('recetas.id_receta', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    id_insumo = db.Column(db.String(20), db.ForeignKey('insumo.id_insumo', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)


# ==========================================
# 15. TABLA: VENTA
# ==========================================
class Venta(db.Model):
    __tablename__ = 'venta'
    
    id_venta = db.Column(db.String(20), primary_key=True)
    id_usuario = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    metodo_pago = db.Column(db.String(20), nullable=False)
    estado = db.Column(db.String(20), nullable=False)

    detalles_venta = db.relationship('DetalleVenta', backref='venta_padre', lazy=True, cascade="all, delete-orphan")


# ==========================================
# 16. TABLA: DETALLE_VENTA
# ==========================================
class DetalleVenta(db.Model):
    __tablename__ = 'detalle_venta'
    
    id_detalle_venta = db.Column(db.String(20), primary_key=True)
    id_venta = db.Column(db.String(20), db.ForeignKey('venta.id_venta', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    id_producto = db.Column(db.String(20), db.ForeignKey('producto.id_producto', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    precio_unitario = db.Column(db.Integer, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)


# ==========================================
# 17. TABLA: PAGO
# ==========================================
class Pago(db.Model):
    __tablename__ = 'pago'
    
    id_pago = db.Column(db.String(20), primary_key=True)
    id_pedido = db.Column(db.String(20), db.ForeignKey('pedido.id_pedido', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    metodo = db.Column(db.String(20), nullable=False)
    monto = db.Column(db.Integer, nullable=False)


# ==========================================
# 18. TABLA: INCIDENCIA
# ==========================================
class Incidencia(db.Model):
    __tablename__ = 'incidencia'
    
    id_incidencia = db.Column(db.String(20), primary_key=True)
    id_usuario = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    descripcion = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(20), nullable=False)
    prioridad = db.Column(db.String(100), nullable=False)
    observaciones = db.Column(db.Text, nullable=True)


# ==========================================
# 19. TABLA: MENSAJES
# ==========================================
class Mensajes(db.Model):
    __tablename__ = 'mensajes'
    
    id_mensaje = db.Column(db.String(20), primary_key=True)
    id_pedido = db.Column(db.String(20), db.ForeignKey('pedido.id_pedido', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    id_emisor = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    id_receptor = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    contenido = db.Column(db.Text, nullable=False)


# ==========================================
# 20. TABLA: RESEÑA
# ==========================================
class Resena(db.Model):
    __tablename__ = 'reseña'  # Mantiene el nombre de la tabla de MySQL
    
    id_resena = db.Column(db.String(20), primary_key=True)
    id_usuario = db.Column(db.String(20), db.ForeignKey('usuario.id_usuario', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    comentario = db.Column(db.Text, nullable=False)
    puntuacion = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)