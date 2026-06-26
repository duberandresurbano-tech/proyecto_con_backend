from flask_admin.contrib.sqla import ModelView
from flask import redirect, url_for, flash
from flask_login import current_user

from flask_admin.form import DatePickerWidget
from wtforms.fields import DateField

# Correo del superusuario oculto — nadie más puede verlo ni editarlo
SUPERADMIN_EMAIL = 'admin@planclub.com'


def _es_admin():
    """El usuario está logueado y tiene rol Administrador (R3)."""
    return (
        current_user.is_authenticated
        and current_user.id_rol == 'R3'
    )


def _es_superadmin():
    return (
        current_user.is_authenticated
        and current_user.correo == SUPERADMIN_EMAIL
    )


class VistaProtegidaAdmin(ModelView):
    """
    Cualquier Administrador (R3) puede entrar al panel.
    """

    def is_accessible(self):
        return _es_admin()

    def inaccessible_callback(self, name, **kwargs):
        flash("Acceso denegado. Necesitas permisos de Administrador.", "danger")
        return redirect(url_for('main.login'))


class UsuarioAdminView(VistaProtegidaAdmin):
    """
    Vista de Usuarios con filtro activo:
    - El superadmin (admin@planclub.com) ve a TODOS.
    - Cualquier otro admin ve a todos EXCEPTO al superadmin.
    - Nadie puede editar ni eliminar al superadmin (excepto él mismo).
    """

    form_columns = [
        'nombre',
        'apellido',
        'correo',
        'celular',
        'fecha_nacimiento',
        'contrasena',
        'estado',
        'rol'
    ]

    form_overrides = {
        'fecha_nacimiento': DateField
    }

    form_args = {
        'fecha_nacimiento': {
            'widget': DatePickerWidget(),
            'format': '%Y-%m-%d'
        },
        'estado': {
            'default': 'Activa'
        }
    }

    def get_query(self):
        """Oculta al superadmin de la lista si quien consulta no es él."""
        query = super().get_query()
        if not _es_superadmin():
            query = query.filter(
                self.model.correo != SUPERADMIN_EMAIL
            )
        return query

    def get_count_query(self):
        """Ajusta el conteo para que coincida con el filtro."""
        query = super().get_count_query()
        if not _es_superadmin():
            query = query.filter(
                self.model.correo != SUPERADMIN_EMAIL
            )
        return query

    def can_edit_model(self, model):
        """Bloquea edición del superadmin a otros admins."""
        if model.correo == SUPERADMIN_EMAIL and not _es_superadmin():
            return False
        return True

    def can_delete_model(self, model):
        """Nadie puede eliminar al superadmin."""
        if model.correo == SUPERADMIN_EMAIL:
            return False
        return True

    def on_model_change(self, form, model, is_created):
        if is_created and not model.estado:
            model.estado = 'Activa'

        if form.rol.data:
            model.id_rol = form.rol.data.id_rol
        else:
            if is_created:
                model.id_rol = 'R1'
# 🌟 SOLO AGREGAMOS ESTA CLASE AL FINAL DEL ARCHIVO PARA LA TABLA USUARIOS:
class UsuarioAdminView(VistaProtegidaAdmin):
    """
    Hereda todo lo que ya programaste arriba, pero le da superpoderes 
    al formulario de usuarios para mapear el Rol y ocultar al Supremo.
    """
    form_columns = ['nombre', 'apellido', 'correo', 'celular', 'fecha_nacimiento', 'contrasena', 'estado', 'rol']

    def get_query(self):
        # 🛡️ Oculta al admin supremo de la lista para que nadie lo toque
        query = super(UsuarioAdminView, self).get_query()
        
        if current_user.is_authenticated and current_user.correo != 'admin@planclub.com':
            return query.filter(self.model.correo != 'admin@planclub.com')

    def on_model_change(self, form, model, is_created):
        if is_created and not model.estado:
            model.estado = 'Activa'
        if hasattr(form, 'rol') and form.rol.data:
            model.id_rol = form.rol.data.id_rol