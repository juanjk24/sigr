import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  listDishes,
  createDish,
  updateDish,
  deleteDish,
  listCategories,
} from '../../services/menu.service';
import type { Category, Dish } from '../../services/menu.service';
import { formatCurrency } from '../../utils/formatter';

const MenuPage: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [d, c] = await Promise.all([listDishes(), listCategories()]);
      setDishes(d);
      setCategories(c);
    } catch {
      setError('No se pudieron cargar los platos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([listDishes(), listCategories()])
      .then(([d, c]) => {
        setDishes(d);
        setCategories(c);
      })
      .catch(() => setError('No se pudieron cargar los platos.'))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', categoryId: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const price = parseFloat(form.price);
      if (editing) {
        await updateDish(editing.id, { ...form, price });
      } else {
        await createDish({ ...form, price });
      }
      resetForm();
      await load();
    } catch {
      setError('No se pudo guardar el plato.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (dish: Dish) => {
    setEditing(dish);
    setForm({
      name: dish.name,
      description: dish.description ?? '',
      price: dish.price,
      categoryId: dish.categoryId,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este plato?')) return;
    try {
      await deleteDish(id);
      await load();
    } catch {
      setError('No se pudo eliminar el plato.');
    }
  };

  return (
    <AppLayout>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Menú</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-4 font-semibold text-gray-800">
            {editing ? 'Editar plato' : 'Nuevo plato'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Ensalada César"
              required
            />
            <Input
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Opcional"
            />
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Categoría</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button label={saving ? 'Guardando...' : 'Guardar'} type="submit" disabled={saving} />
              {editing && <Button label="Cancelar" variant="secondary" onClick={resetForm} />}
            </div>
          </form>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex flex-col gap-2">
              {dishes.length === 0 && !loading && (
                <p className="text-sm text-gray-500">No hay platos todavía.</p>
              )}
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{dish.name}</p>
                    <p className="text-sm text-gray-500">
                      {dish.category?.name} · {formatCurrency(parseFloat(dish.price))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button label="Editar" variant="secondary" onClick={() => startEdit(dish)} />
                    <Button label="Eliminar" variant="danger" onClick={() => handleDelete(dish.id)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default MenuPage;
