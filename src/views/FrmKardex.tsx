import React, { useState, useEffect } from 'react';
import { Insumo } from '../types';
import { apiService } from '../services/api';
import { Package, AlertTriangle, PlusCircle, Search, CheckCircle } from 'lucide-react';

export const FrmKardex: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filtro, setFiltro] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
  const [cantidadEntrada, setCantidadEntrada] = useState<number>(10);
  const [observacion, setObservacion] = useState('');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    const data = await apiService.getInsumos();
    setInsumos(data);
  };

  const insumosFiltrados = insumos.filter(i =>
    i.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    i.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoSeleccionado) return;
    setCargando(true);
    try {
      await apiService.registrarMovimiento({
        insumo_id: insumoSeleccionado.id,
        tipo_movimiento: 'ENTRADA',
        motivo: 'COMPRA',
        cantidad: Number(cantidadEntrada),
        observaciones: observacion || 'Compra registrada desde FrmKardex'
      });
      setMensajeExito(`Se agregaron ${cantidadEntrada} ${insumoSeleccionado.unidad_medida} a '${insumoSeleccionado.nombre}' exitosamente.`);
      setModalAbierto(false);
      setObservacion('');
      await cargarInsumos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al registrar entrada en kardex');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Package className="w-5 h-5 text-brand-400" />
            </div>
            Kardex de Inventario (CU06 / CU07)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control de insumos base, recetas y alertas de stock mínimo para R&M Personaliza.
          </p>
        </div>
      </div>

      {/* Alerta de éxito */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar insumo por nombre o código..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
        />
      </div>

      {/* Lista Mobile (Tarjetas) */}
      <div className="grid grid-cols-1 md:hidden gap-3">
        {insumosFiltrados.map(i => {
          const esCritico = i.estado_alerta === 'CRITICO_ROJO' || i.estado_alerta === 'CRITICO_AGOTADO';
          const esAlerta = i.estado_alerta === 'ALERTA_AMARILLO';

          return (
            <div
              key={i.id}
              className={`p-4 rounded-xl border bg-white shadow-sm transition-all ${
                esCritico
                  ? 'border-red-300 bg-red-50/20'
                  : esAlerta
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {i.codigo}
                  </span>
                  <h3 className="font-semibold text-slate-900 mt-1">{i.nombre}</h3>
                  <p className="text-xs text-slate-500">{i.descripcion || 'Sin descripción'}</p>
                </div>
                {i.esta_en_alerta && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    esCritico ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {esCritico ? 'Crítico' : 'Mínimo'}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Saldo Actual: </span>
                  <span className={`font-bold text-sm ${esCritico ? 'text-red-600' : esAlerta ? 'text-amber-600' : 'text-slate-900'}`}>
                    {i.stock_actual} {i.unidad_medida}
                  </span>
                  <span className="text-slate-400 text-xs ml-1">(Mín: {i.stock_minimo})</span>
                </div>
                <button
                  onClick={() => { setInsumoSeleccionado(i); setModalAbierto(true); }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-brand-500 text-amber-900 hover:text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1 border border-amber-200/60"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Entrada
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Código</th>
              <th className="px-5 py-3.5">Insumo</th>
              <th className="px-5 py-3.5 text-center">U.M.</th>
              <th className="px-5 py-3.5 text-right">Saldo Actual</th>
              <th className="px-5 py-3.5 text-right">Stock Mínimo</th>
              <th className="px-5 py-3.5 text-center">Estado Semáforo</th>
              <th className="px-5 py-3.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {insumosFiltrados.map(i => {
              const esCritico = i.estado_alerta === 'CRITICO_ROJO' || i.estado_alerta === 'CRITICO_AGOTADO';
              const esAlerta = i.estado_alerta === 'ALERTA_AMARILLO';

              return (
                <tr
                  key={i.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    esCritico ? 'bg-red-50/30' : esAlerta ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{i.codigo}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{i.nombre}</td>
                  <td className="px-5 py-3.5 text-center font-mono text-xs text-slate-500">{i.unidad_medida}</td>
                  <td className="px-5 py-3.5 text-right font-bold">
                    <span className={esCritico ? 'text-red-600' : esAlerta ? 'text-amber-600' : 'text-slate-800'}>
                      {i.stock_actual.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-500">{i.stock_minimo.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-center">
                    {esCritico ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Crítico
                      </span>
                    ) : esAlerta ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Mínimo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => { setInsumoSeleccionado(i); setModalAbierto(true); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-brand-500 text-slate-700 hover:text-slate-950 font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1 border border-slate-200 hover:border-brand-500"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Registrar Entrada
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Entrada / Compra (CU06) */}
      {modalAbierto && insumoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registrar Entrada de Insumo</h3>
                <p className="text-xs text-slate-500 mt-0.5">{insumoSeleccionado.nombre} ({insumoSeleccionado.codigo})</p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegistrarEntrada} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cantidad a Ingresar ({insumoSeleccionado.unidad_medida})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={cantidadEntrada}
                  onChange={e => setCantidadEntrada(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Observación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Factura Proveedor N° 001-4521"
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-4 py-2 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {cargando ? 'Guardando...' : 'Confirmar Ingreso al Kardex'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
