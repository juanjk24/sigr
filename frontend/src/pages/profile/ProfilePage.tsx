import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import { getProfile } from '../../services/users.service';
import type { UserProfile } from '../../services/users.service';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setError('No se pudo cargar tu perfil.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Mi Perfil</h1>
      <Card className="max-w-lg">
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {profile && (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase text-gray-400">Nombre</p>
              <p className="font-medium text-gray-800">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Email</p>
              <p className="font-medium text-gray-800">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Rol</p>
              <p className="font-medium text-gray-800">{profile.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Miembro desde</p>
              <p className="font-medium text-gray-800">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </Card>
    </AppLayout>
  );
};

export default ProfilePage;
