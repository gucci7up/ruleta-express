import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function ConfigPage() {
  const qc = useQueryClient();
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings').then((r) => r.data),
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts'],
    queryFn: () => api.get('/api/payouts').then((r) => r.data),
  });

  const { data: colorMap = [] } = useQuery({
    queryKey: ['color-map'],
    queryFn: () => api.get('/api/colors/numbers').then((r) => r.data),
  });

  useEffect(() => {
    const obj: Record<string, string> = {};
    settings.forEach((s: any) => { obj[s.key] = s.value; });
    setSettingsForm(obj);
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: () =>
      api.put('/api/settings', {
        settings: Object.entries(settingsForm).map(([key, value]) => ({ key, value })),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const updatePayout = useMutation({
    mutationFn: ({ id, multiplier }: { id: number; multiplier: number }) =>
      api.patch(`/api/payouts/${id}`, { multiplier }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payouts'] }),
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Tiempos de ronda, pagos y colores — todo parametrizado</p>
      </div>

      {/* Settings */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-white">⏱ Tiempos de ronda</h2>
        {settings.map((s: any) => (
          <div key={s.key} className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-white">{s.description ?? s.key}</p>
              <p className="text-xs text-gray-600 font-mono">{s.key}</p>
            </div>
            <input
              type="text"
              className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono text-center focus:outline-none focus:border-yellow-500"
              value={settingsForm[s.key] ?? s.value}
              onChange={(e) => setSettingsForm((f) => ({ ...f, [s.key]: e.target.value }))}
            />
          </div>
        ))}
        <button
          onClick={() => saveSettings.mutate()}
          disabled={saveSettings.isPending}
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold px-6 py-2 rounded-xl text-sm transition-all active:scale-95"
        >
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </section>

      {/* Payouts */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
        <h2 className="font-bold text-white">💰 Tabla de pagos (multiplicadores)</h2>
        <div className="grid grid-cols-2 gap-3">
          {payouts.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm text-white font-medium">
                  {p.type === 'NUMBER' ? `Número ${p.reference}` : `Color ${p.reference}`}
                </p>
                <p className="text-xs text-gray-500">{p.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">×</span>
                <input
                  type="number"
                  className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-yellow-400 font-bold font-mono text-center text-sm focus:outline-none"
                  defaultValue={Number(p.multiplier)}
                  onBlur={(e) => updatePayout.mutate({ id: p.id, multiplier: Number(e.target.value) })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Color map */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">🎨 Mapping número → color (0-18)</h2>
        <div className="grid grid-cols-5 gap-2">
          {colorMap.map((entry: any) => (
            <div
              key={entry.number}
              className="flex flex-col items-center justify-center h-14 rounded-xl text-white font-bold text-lg"
              style={{ backgroundColor: entry.hex + '30', border: `1.5px solid ${entry.hex}60`, color: entry.hex }}
            >
              <span>{entry.number}</span>
              <span className="text-[9px] opacity-60 uppercase">{entry.color.slice(0,1)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">Para modificar colores usa el endpoint PATCH /api/colors/numbers/:number</p>
      </section>
    </div>
  );
}
