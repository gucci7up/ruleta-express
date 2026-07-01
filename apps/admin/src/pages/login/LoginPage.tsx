import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('admin@ruleta.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: () => api.post('/api/auth/login', { email, password }).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    },
    onError: () => setError('Credenciales incorrectas'),
  });

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎰</div>
          <h1 className="text-xl font-black text-white">RULETA EXPRESS</h1>
          <p className="text-gray-500 text-sm mt-1">Panel Administrativo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
            <input
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Contraseña</label>
            <input
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && mut.mutate()}
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
          >
            {mut.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  );
}
