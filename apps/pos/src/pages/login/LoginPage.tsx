import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [tab, setTab] = useState<'email' | 'pin'>('pin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const loginMut = useMutation({
    mutationFn: async () => {
      const payload = tab === 'email'
        ? api.post('/api/auth/login', { email, password })
        : api.post('/api/auth/login/pin', { userId: Number(userId), pin });
      return (await payload).data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/pos');
    },
    onError: () => setError('Credenciales incorrectas'),
  });

  const handlePinKey = (key: string) => {
    if (key === 'DEL') return setPin((p) => p.slice(0, -1));
    if (pin.length < 6) setPin((p) => p + key);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎰</div>
          <h1 className="text-2xl font-black text-white">RULETA EXPRESS</h1>
          <p className="text-gray-500 text-sm mt-1">Punto de Venta</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-800 p-1 mb-6">
            {(['pin', 'email'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'
                }`}
              >
                {t === 'pin' ? 'PIN Rápido' : 'Email'}
              </button>
            ))}
          </div>

          {tab === 'pin' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">ID de Usuario</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mt-1 text-center text-xl font-mono"
                  placeholder="Ej: 2"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  type="number"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">PIN</label>
                <div className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-center font-mono text-3xl tracking-[0.5em] mt-1 min-h-[64px]">
                  {'●'.repeat(pin.length) || <span className="text-gray-700 text-lg tracking-normal">Ingresa tu PIN</span>}
                </div>
              </div>
              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['1','2','3','4','5','6','7','8','9','DEL','0','↵'].map((k) => (
                  <button
                    key={k}
                    onClick={() => k === '↵' ? loginMut.mutate() : handlePinKey(k)}
                    className={`h-14 rounded-xl font-bold text-xl transition-all active:scale-90 ${
                      k === '↵' ? 'bg-yellow-500 text-gray-950 col-span-1' :
                      k === 'DEL' ? 'bg-gray-700 text-red-400' :
                      'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mt-1"
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ruleta.com"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Contraseña</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mt-1"
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" size="lg" onClick={() => loginMut.mutate()} loading={loginMut.isPending}>
                Ingresar
              </Button>
            </div>
          )}

          {error && (
            <p className="mt-3 text-red-400 text-sm text-center bg-red-950/40 py-2 rounded-lg">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
