import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import NewOrderModal from './NewOrderModal';
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  createOrder,
} from '../../services/orders.service';
import type { Order, OrderStatus, CreateOrderPayload, OrderType } from '../../services/orders.service';
import { formatCurrency, formatDate } from '../../utils/formatter';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const typeBadges: Record<OrderType, string> = {
  domicilio: 'bg-indigo-100 text-indigo-800',
  para_llevar: 'bg-purple-100 text-purple-800',
  para_aqui: 'bg-emerald-100 text-emerald-800',
};

const typeLabels: Record<OrderType, string> = {
  domicilio: 'Domicilio',
  para_llevar: 'Para llevar',
  para_aqui: 'Mesa',
};

const orderIdentity = (order: Order) => {
  if (order.type === 'para_aqui') {
    return { title: `Mesa ${order.tableNumber ?? '-'}`, subtitle: order.user?.name ?? '' };
  }
  return {
    title: order.customerName ?? 'Cliente',
    subtitle: order.customerPhone ?? order.user?.name ?? '',
  };
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
      setError('');
    } catch {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los pedidos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const identity = orderIdentity(order);
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(query) ||
      identity.title.toLowerCase().includes(query) ||
      (order.customerPhone ?? '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async (data: CreateOrderPayload) => {
    await createOrder(data);
    await load();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const current = orders.find((o) => o.id === orderId);
    if (!current || current.status === newStatus) return;
    try {
      await updateOrderStatus(orderId, newStatus);
      await load();
    } catch {
      setError('No se pudo actualizar el estado del pedido.');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('¿Eliminar este pedido y sus pagos asociados?')) return;
    try {
      await deleteOrder(orderId);
      await load();
    } catch {
      setError('No se pudo eliminar el pedido.');
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona y realiza seguimiento de todos los pedidos
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Pedido
          </button>
        </div>

        <NewOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrder}
        />

        <div className="mt-6">
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Total Pedidos</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Pendientes</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">En Proceso</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Completados</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por cliente, mesa o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="processing">En proceso</option>
                  <option value="completed">Completados</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">Cargando pedidos...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Mesa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const identity = orderIdentity(order);
                        const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>{identity.title}</div>
                              {identity.subtitle && (
                                <div className="text-xs text-gray-500">{identity.subtitle}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadges[order.type]}`}>
                                {typeLabels[order.type]}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {itemCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(parseFloat(order.total))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                {statusLabels[order.status]}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="inline-flex items-center gap-1">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
                                    <option key={s} value={s}>{statusLabels[s]}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleDelete(order.id)}
                                  className="text-red-600 hover:text-red-900 ml-1"
                                  title="Eliminar pedido"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <p className="mt-2">No se encontraron pedidos</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OrdersPage;