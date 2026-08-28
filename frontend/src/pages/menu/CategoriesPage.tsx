import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/menu.service';
import type { Category } from '../../services/menu.service';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setCategories(await listCategories());
    } catch {
      setError('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data))
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, { name, description });
      } else {
        await createCategory({ name, description });
      }
      resetForm();
      await load();
    } catch {
      setError('No se pudo guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? '');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await deleteCategory(id);
      await load();
    } catch {
      setError('No se pudo eliminar la categoría.');
    }
  };

  return (
    <AppLayout>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Categorías</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-4 font-semibold text-gray-800">
            {editing ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Entradas"
              required
            />
            <Input
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
            <div className="flex gap-2">
              <Button label={saving ? 'Guardando...' : 'Guardar'} type="submit" disabled={saving} />
              {editing && (
                <Button label="Cancelar" variant="secondary" onClick={resetForm} />
              )}
            </div>
          </form>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex flex-col gap-2">
              {categories.length === 0 && !loading && (
                <p className="text-sm text-gray-500">No hay categorías todavía.</p>
              )}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{cat.name}</p>
                    {cat.description && (
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button label="Editar" variant="secondary" onClick={() => startEdit(cat)} />
                    <Button label="Eliminar" variant="danger" onClick={() => handleDelete(cat.id)} />
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

export default CategoriesPage;
