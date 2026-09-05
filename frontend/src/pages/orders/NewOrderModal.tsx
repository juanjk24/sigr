import React, { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import ModalFooter from '../../components/layout/ModalFooter';
import ModalButton from '../../components/layout/ModalButton';
import { listDishes } from '../../services/menu.service';
import type { Dish } from '../../services/menu.service';
import { formatCurrency } from '../../utils/formatter';
import type { CreateOrderPayload, OrderType } from '../../services/orders.service';

interface NewOrderLine {
  key: string;
  dishId: string;
  quantity: number;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: CreateOrderPayload) => Promise<void> | void;
}

const TYPE_LABELS: Record<OrderType, string> = {
  domicilio: 'Domicilio',
  para_llevar: 'Para llevar',
  para_aqui: 'Para aquí (mesa)',
};

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [type, setType] = useState<OrderType>('para_aqui');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<NewOrderLine[]>([{ key: '1', dishId: '', quantity: 1 }]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    listDishes()
      .then((d) => {
        if (!cancelled) {
          setDishes(d.filter((dish) => dish.active));
          setLoadingDishes(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los productos del menú.');
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const dishById = (id: string) => dishes.find((d) => d.id === id);

  const addLine = () => {
    setLines([...lines, { key: Date.now().toString(), dishId: '', quantity: 1 }]);
  };

  const removeLine = (key: string) => {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line.key !== key));
    }
  };

  const updateLine = (key: string, patch: Partial<NewOrderLine>) => {
    setLines(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const calculateTotal = () => {
    return lines.reduce((sum, line) => {
      const dish = dishById(line.dishId);
      const unitPrice = dish ? parseFloat(dish.price) : 0;
      return sum + unitPrice * line.quantity;
    }, 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (type === 'domicilio' || type === 'para_llevar') {
      if (!customerName.trim()) newErrors.customerName = 'El nombre es requerido';
      if (!customerPhone.trim()) newErrors.customerPhone = 'El teléfono es requerido';
      if (type === 'domicilio' && !customerAddress.trim()) {
        newErrors.customerAddress = 'La dirección es requerida';
      }
    }

    if (type === 'para_aqui' && !tableNumber.trim()) {
      newErrors.tableNumber = 'El número de mesa es requerido';
    }

    lines.forEach((line, index) => {
      if (!line.dishId) {
        newErrors[`line_${index}`] = 'Selecciona un producto';
      }
      if (line.quantity < 1) {
        newErrors[`line_${index}_qty`] = 'La cantidad mínima es 1';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || saving) return;

    setSaving(true);
    setError('');
    try {
      const payload: CreateOrderPayload = {
        type,
        items: lines
          .filter((line) => line.dishId)
          .map((line) => ({ dishId: line.dishId, quantity: line.quantity })),
      };
      if (customerName.trim()) payload.customerName = customerName.trim();
      if (customerPhone.trim()) payload.customerPhone = customerPhone.trim();
      if (customerAddress.trim()) payload.customerAddress = customerAddress.trim();
      if (tableNumber.trim()) payload.tableNumber = tableNumber.trim();
      if (notes.trim()) payload.notes = notes.trim();

      await onSubmit(payload);
      handleClose();
    } catch {
      setError('No se pudo crear el pedido. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setType('para_aqui');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setTableNumber('');
    setNotes('');
    setLines([{ key: '1', dishId: '', quantity: 1 }]);
    setErrors({});
    setError('');
    onClose();
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  const footer = (
    <ModalFooter>
      <ModalButton onClick={handleClose}>Cancelar</ModalButton>
      <ModalButton type="submit" variant="primary" form="new-order-form" loading={saving}>
        Crear Pedido
      </ModalButton>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Pedido"
      subtitle="Completa la información para crear un nuevo pedido"
      footer={footer}
      size="xl"
    >
      <form id="new-order-form" onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Tipo de pedido */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Tipo de pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(TYPE_LABELS) as OrderType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-3 border rounded-lg text-sm font-medium text-left transition-colors ${
                  type === t
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Datos según tipo */}
        {(type === 'domicilio' || type === 'para_llevar') && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Datos del cliente {type === 'domicilio' ? '· Domicilio' : '· Para llevar'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputClass(!!errors.customerName)}
                  placeholder="Juan Pérez"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={inputClass(!!errors.customerPhone)}
                  placeholder="+57 300 123 4567"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.customerPhone}</p>
                )}
              </div>
              {type === 'domicilio' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className={inputClass(!!errors.customerAddress)}
                    placeholder="Calle, número, barrio, ciudad"
                  />
                  {errors.customerAddress && (
                    <p className="mt-1 text-xs text-red-600">{errors.customerAddress}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {type === 'para_aqui' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Mesa</h3>
            <div className="md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de mesa *
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className={inputClass(!!errors.tableNumber)}
                placeholder="Ej. 12"
              />
              {errors.tableNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.tableNumber}</p>
              )}
            </div>
          </div>
        )}

        {/* Productos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Productos</h3>
          {loadingDishes ? (
            <p className="text-sm text-gray-500">Cargando productos...</p>
          ) : dishes.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay productos disponibles. Agrega platos al menú primero.
            </p>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => {
                const dish = dishById(line.dishId);
                return (
                  <div key={line.key} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <select
                        value={line.dishId}
                        onChange={(e) => updateLine(line.key, { dishId: e.target.value })}
                        className={inputClass(!!errors[`line_${index}`])}
                      >
                        <option value="">Selecciona un producto</option>
                        {dishes.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} · {formatCurrency(parseFloat(d.price))}
                          </option>
                        ))}
                      </select>
                      {errors[`line_${index}`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`line_${index}`]}</p>
                      )}
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(line.key, { quantity: parseInt(e.target.value) || 0 })
                        }
                        min="1"
                        placeholder="Cant."
                        className={inputClass(!!errors[`line_${index}_qty`])}
                      />
                      {errors[`line_${index}_qty`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`line_${index}_qty`]}</p>
                      )}
                    </div>
                    <div className="w-32">
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 w-full">
                        {dish ? formatCurrency(parseFloat(dish.price)) : '$0'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                      className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={addLine}
            className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar producto
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Total del pedido</label>
          <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-lg font-bold text-gray-900">
            {formatCurrency(calculateTotal())}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas adicionales
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Instrucciones especiales, comentarios, etc."
          />
        </div>
      </form>
    </Modal>
  );
};

export default NewOrderModal;