import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Bell, CheckCircle, Calendar, Trash2, BookMarked as MarkAsRead } from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';
import { getNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas, eliminarNotificacion } from '../../api/api.js';

interface NotificacionesProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}

interface Notification {
  _id: string;
  tipo: 'NUEVA_CITA' | 'RECORDATORIO' | 'CANCELACION' | 'CONFIRMACION' | 'GENERAL';
  titulo: string;
  mensaje: string;
  fechaAlta: string;
  leida: boolean;
  fechaLeida: string | null;
  reserva?: string;
}

const tipoDestinatarioMap: Record<string, string> = {
  'cliente': 'Cliente',
  'veterinaria': 'Veterinaria',
  'paseador': 'Paseador',
  'cuidador': 'Cuidador',
};

const Notificaciones: React.FC<NotificacionesProps> = ({ userType, onBack }) => {
  const { usuario } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'NUEVA_CITA' | 'RECORDATORIO' | 'CANCELACION'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const tipoDestinatario = userType ? tipoDestinatarioMap[userType] : null;

  const fetchNotificaciones = useCallback(async () => {
    if (!usuario?.id || !tipoDestinatario) return;
    setLoading(true);
    try {
      const data = await getNotificaciones(tipoDestinatario, usuario.id, page, 20);
      setNotifications(data.notificaciones || []);
      setTotalPages(data.totalPages || 1);
      setUnreadCount(data.noLeidas || 0);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [usuario?.id, tipoDestinatario, page]);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.leida;
    return notification.tipo === filter;
  });

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'NUEVA_CITA':
        return { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'RECORDATORIO':
        return { icon: Bell, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'CANCELACION':
        return { icon: Bell, color: 'text-red-600', bg: 'bg-red-100' };
      case 'CONFIRMACION':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getPriorityFromType = (tipo: string) => {
    switch (tipo) {
      case 'CANCELACION': return 'border-l-red-500';
      case 'NUEVA_CITA': return 'border-l-blue-500';
      case 'RECORDATORIO': return 'border-l-yellow-500';
      case 'CONFIRMACION': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'NUEVA_CITA': return 'Nueva cita';
      case 'RECORDATORIO': return 'Recordatorio';
      case 'CANCELACION': return 'Cancelación';
      case 'CONFIRMACION': return 'Confirmación';
      default: return 'General';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await marcarNotificacionLeida(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, leida: true, fechaLeida: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!usuario?.id || !tipoDestinatario) return;
    try {
      await marcarTodasNotificacionesLeidas(tipoDestinatario, usuario.id);
      setNotifications(prev => prev.map(n => ({ ...n, leida: true, fechaLeida: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarNotificacion(id);
      const wasUnread = notifications.find(n => n._id === id && !n.leida);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const getTitle = () => {
    switch (userType) {
      case 'cliente': return 'Centro de Notificaciones';
      case 'veterinaria': return 'Notificaciones de Clínica';
      case 'paseador': return 'Notificaciones de Paseos';
      case 'cuidador': return 'Notificaciones de Cuidado';
      default: return 'Notificaciones';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full relative">
                  <Bell className="h-8 w-8 text-blue-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                  <p className="text-gray-600">
                    {unreadCount > 0
                      ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                      : 'Todas las notificaciones están al día'
                    }
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MarkAsRead className="h-4 w-4" />
                  <span>Marcar todas como leídas</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'No leídas' },
              { key: 'NUEVA_CITA', label: 'Nuevas citas' },
              { key: 'RECORDATORIO', label: 'Recordatorios' },
              { key: 'CANCELACION', label: 'Cancelaciones' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
                {key === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'No tienes notificaciones sin leer'
                : 'No hay notificaciones para mostrar'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const iconConfig = getNotificationIcon(notification.tipo);
              const Icon = iconConfig.icon;

              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${getPriorityFromType(notification.tipo)} ${
                    !notification.leida ? 'ring-2 ring-blue-100' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`${iconConfig.bg} p-3 rounded-full flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${iconConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${!notification.leida ? 'text-gray-900' : 'text-gray-700'} mb-1`}>
                              {notification.titulo}
                              {!notification.leida && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </h3>
                            <p className="text-gray-600 mb-3 leading-relaxed">
                              {notification.mensaje}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatDate(notification.fechaAlta)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                notification.tipo === 'CANCELACION' ? 'bg-red-100 text-red-700' :
                                notification.tipo === 'NUEVA_CITA' ? 'bg-blue-100 text-blue-700' :
                                notification.tipo === 'CONFIRMACION' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {getTipoLabel(notification.tipo)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.leida && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Marcar como leída"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar notificación"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;
