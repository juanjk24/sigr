import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import ModalFooter from '../../components/layout/ModalFooter';
import ModalButton from '../../components/layout/ModalButton';
import {
  getBillingOrders,
  getBillingSummary,
  createPayment,
  updatePaymentStatus,
} from '../../services/billing.service';
import type {
  BillingOrder,
  BillingSummary,
  Payment,
  PaymentMethod,
} from '../../services/billing.service';
import type { OrderType } from '../../services/orders.service';
import { formatCurrency, formatDate } from '../../utils/formatter';

const typeLabels: Record<OrderType, string> = {
  domicilio: 'Domicilio',
  para_llevar: 'Para llevar',
  para_aqui: 'Mesa',
};

const methodLabels: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  otro: 'Otro',
};

const orderIdentity = (order: BillingOrder) => {
  if (order.type === 'para_aqui') {
    return `Mesa ${order.tableNumber ?? '-'}`;
  }
  return order.customerName ?? 'Cliente';
};

const BillingPage: React.FC = () => {
  const [orders, setOrders] = useState<BillingOrder[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'pending' | 'paid'>('pending');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [payingOrder, setPayingOrder] = useState<BillingOrder | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [o, s] = await Promise.all([getBillingOrders(), getBillingSummary()]);
      setOrders(o);
      setSummary(s);
      setError('');
    } catch {
      setError('No se pudieron cargar los datos de facturación.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBillingOrders(), getBillingSummary()])
      .then(([o, s]) => {
        if (!cancelled) {
          setOrders(o);
          setSummary(s);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los datos de facturación.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const openPaymentModal = (order: BillingOrder) => {
    setPayingOrder(order);
    setAmount(parseFloat(order.outstanding).toFixed(2));
    setMethod('efectivo');
    setError('');
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingOrder || saving) return;
    setSaving(true);
    setError('');
    try {
      const value = parseFloat(amount);
      if (!value || value <= 0) {
        setError('Ingresa un monto válido.');
        setSaving(false);
        return;
      }
      await createPayment({ orderId: payingOrder.id, amount: value, method });
      setPayingOrder(null);
      await load();
    } catch (err) {
      const responseError = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(responseError ?? 'No se pudo registrar el pago.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async (payment: Payment) => {
    if (!window.confirm('¿Anular/reembolsar este pago?')) return;
    try {
      await updatePaymentStatus(payment.id, 'refunded');
      await load();
    } catch {
      setError('No se pudo anular el pago.');
    }
  };

  const visibleOrders = orders.filter((o) =>
    tab === 'paid' ? o.billingStatus === 'paid' : o.billingStatus === 'pending',
  );

  const statCards = summary
    ? [
        { label: 'Total facturado', value: formatCurrency(parseFloat(summary.totalSales)), color: 'text-gray-900' },
        { label: 'Total cobrado', value: formatCurrency(parseFloat(summary.totalPaid)), color: 'text-green-600' },
        { label: 'Pendiente de cobro', value: formatCurrency(parseFloat(summary.totalPending)), color: 'text-red-600' },
        { label: 'Pedidos pagados', value: `${summary.paidOrders} / ${summary.totalOrders}`, color: 'text-blue-600' },
      ]
    : [];

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consulta qué pedidos faltan por pagar y los pagos registrados
          </p>
        </div>

        <div className="mt-6">
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm font-medium text-gray-500">{card.label}</div>
                <div className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Por pagar
            </button>
            <button
              onClick={() => setTab('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'paid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pagados
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">Cargando facturación...</p>
            ) : visibleOrders.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                {tab === 'pending' ? 'No hay pedidos pendientes de pago.' : 'No hay pedidos pagados.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Mesa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                              <svg
                                className={`w-3 h-3 transition-transform ${expanded[order.id] ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {orderIdentity(order)}
                            <span className="ml-2 text-xs text-gray-400">{typeLabels[order.type]}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(parseFloat(order.total))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(parseFloat(order.paidAmount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            {formatCurrency(parseFloat(order.outstanding))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.billingStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.billingStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {order.billingStatus === 'pending' && (
                              <button
                                onClick={() => openPaymentModal(order)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Registrar pago
                              </button>
                            )}
                          </td>
                        </tr>
                        {expanded[order.id] && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50">
                              <div className="text-sm mb-3 text-gray-500">
                                {formatDate(order.createdAt)} · {order.items.length} producto(s)
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Productos pedidos
                                  </h4>
                                  <ul className="space-y-1">
                                    {order.items.map((item) => (
                                      <li key={item.id} className="flex justify-between text-sm text-gray-700">
                                        <span>
                                          {item.quantity} × {item.dishName}
                                          <span className="text-gray-400 ml-1">
                                            (a {formatCurrency(parseFloat(item.unitPrice))})
                                          </span>
                                        </span>
                                        <span className="font-medium">{formatCurrency(parseFloat(item.lineTotal))}</span>
                                      </li>
                                    ))}
                                    <li className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-200 pt-2">
                                      <span>Total</span>
                                      <span>{formatCurrency(parseFloat(order.total))}</span>
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Pagos
                                  </h4>
                                  {order.payments.length === 0 ? (
                                    <p className="text-sm text-gray-500">Sin pagos registrados.</p>
                                  ) : (
                                    <ul className="space-y-1">
                                      {order.payments.map((payment) => (
                                        <li key={payment.id} className="flex items-center justify-between text-sm text-gray-700">
                                          <span>
                                            {formatCurrency(parseFloat(payment.amount))} · {methodLabels[payment.method]}
                                            <span className="ml-1 text-xs">
                                              {payment.status === 'refunded' ? (
                                                <span className="text-red-600">(anulado)</span>
                                              ) : (
                                                <span className="text-green-600">({formatDate(payment.paidAt)})</span>
                                              )}
                                            </span>
                                          </span>
                                          {payment.status === 'completed' && (
                                            <button
                                              onClick={() => handleRefund(payment)}
                                              className="text-red-600 hover:text-red-900 text-xs ml-2"
                                            >
                                              Anular
                                            </button>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!payingOrder}
        onClose={() => setPayingOrder(null)}
        title="Registrar pago"
        subtitle={payingOrder ? `Pedido #${payingOrder.id.slice(0, 8).toUpperCase()} · ${orderIdentity(payingOrder)}` : ''}
        size="md"
        footer={
          <ModalFooter>
            <ModalButton onClick={() => setPayingOrder(null)}>Cancelar</ModalButton>
            <ModalButton type="submit" variant="primary" form="payment-form" loading={saving}>
              Registrar pago
            </ModalButton>
          </ModalFooter>
        }
      >
        <form id="payment-form" onSubmit={handleRegisterPayment} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {payingOrder && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(parseFloat(payingOrder.total))}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Saldo</div>
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(parseFloat(payingOrder.outstanding))}
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {(Object.keys(methodLabels) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>{methodLabels[m]}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default BillingPage;