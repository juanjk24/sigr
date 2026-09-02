import React, { useState } from 'react';
import Modal from '../../components//ui/Modal';
import ModalFooter from '../../components/layout/ModalFooter';
import ModalButton from '../../components/layout/ModalButton';


interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
}

interface NewOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (order: NewOrderData) => void;
}

interface NewOrderData {
    customer: string;
    email: string;
    phone: string;
    items: OrderItem[];
    notes: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [customer, setCustomer] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<NewOrderData['status']>('pending');
    const [items, setItems] = useState<OrderItem[]>([
        { id: '1', name: '', quantity: 1, price: 0 }
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), name: '', quantity: 1, price: 0 }
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!customer.trim()) {
            newErrors.customer = 'El nombre del cliente es requerido';
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Email inválido';
        }

        items.forEach((item, index) => {
            if (!item.name.trim()) {
                newErrors[`item_${index}`] = 'Nombre del producto requerido';
            }
            if (item.quantity < 1) {
                newErrors[`item_${index}_qty`] = 'Cantidad mínima es 1';
            }
            if (item.price < 0) {
                newErrors[`item_${index}_price`] = 'Precio inválido';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit({
                customer,
                email,
                phone,
                items,
                notes,
                status
            });
            handleClose();
        }
    };




    const handleClose = () => {
        setCustomer('');
        setEmail('');
        setPhone('');
        setNotes('');
        setStatus('pending');
        setItems([{ id: '1', name: '', quantity: 1, price: 0 }]);
        setErrors({});
        onClose();
    };


    const footer = (
        <ModalFooter>
            <ModalButton onClick={handleClose}>
                Cancelar
            </ModalButton>
            <ModalButton type="submit" variant="primary">
                Crear Orden
            </ModalButton>
        </ModalFooter>
    );



    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Nueva Orden"
            subtitle="Completa la información para crear una nueva orden"
            footer={footer}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                    {/* Información del Cliente */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Información del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Cliente *
                                </label>
                                <input
                                    type="text"
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.customer ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Juan Pérez"
                                />
                                {errors.customer && (
                                    <p className="mt-1 text-xs text-red-600">{errors.customer}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="juan@example.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="+57 300 123 4567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items de la Orden */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Productos</h3>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            placeholder="Nombre del producto"
                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`item_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors[`item_${index}`] && (
                                            <p className="mt-1 text-xs text-red-600">{errors[`item_${index}`]}</p>
                                        )}
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            min="1"
                                            placeholder="Cant."
                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`item_${index}_qty`] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors[`item_${index}_qty`] && (
                                            <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_qty`]}</p>
                                        )}
                                    </div>
                                    <div className="w-28">
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            placeholder="Precio"
                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors[`item_${index}_price`] && (
                                            <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_price`]}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        disabled={items.length === 1}
                                        className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addItem}
                            className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar producto
                        </button>
                    </div>

                    {/* Estado y Notas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="processing">En proceso</option>
                                <option value="completed">Completado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
                                ${calculateTotal().toFixed(2)}
                            </div>
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
                </div>
            </form>
        </Modal>
    );
};

export default NewOrderModal;