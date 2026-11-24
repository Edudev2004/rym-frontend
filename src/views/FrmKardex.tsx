import { useState, useEffect } from 'react';
import { Insumo, CrearInsumoDTO } from '../types';
import { apiService } from '../services/api';
import { GoldSpinner } from '../components/GoldSpinner';
import {
  Package,
  PlusCircle,
  Plus,
  Search,
  CheckCircle,
  Trash2,
  AlertOctagon,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  onInsumoActualizado?: () => void;
}

export const FrmKardex: React.FC<Props> = ({ onInsumoActualizado }) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filtro, setFiltro] = useState('');
  const [cargandoLista, setCargandoLista] = useState(true);

  // Modales
  const [modalEntradaAbierto, setModalEntradaAbierto] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  // Insumo seleccionado para entrada o eliminación
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
  const [insumoAEliminar, setInsumoAEliminar] = useState<Insumo | null>(null);

  // Formulario Entrada
  const [cantidadEntrada, setCantidadEntrada] = useState<number>(10);
  const [observacion, setObservacion] = useState('');

  // Formulario Crear Insumo
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoUnidad, setNuevoUnidad] = useState('UND');
  const [nuevoStockInicial, setNuevoStockInicial] = useState<number>(10);
  const [nuevoStockMinimo, setNuevoStockMinimo] = useState<number>(5);
  const [nuevoCosto, setNuevoCosto] = useState<number>(5.0);
  const [nuevoDescripcion, setNuevoDescripcion] = useState('');

  // Estados UI
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    setCargandoLista(true);
    try {
      const data = await apiService.getInsumos();
      setInsumos(data.filter(i => i.activo !== false));
    } finally {
      setCargandoLista(false);
    }
  };

  const insumosFiltrados = insumos.filter(i =>
    i.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    i.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  // Cálculo en vivo del código autogenerado para el modal de creación
  const calcularCodigoAutogenerado = (nombre: string): string => {
    if (!nombre.trim()) return 'INS-GEN-01';
    const palabras = nombre
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toUpperCase()
      .split(/\s+/)
      .filter(w => w.length >= 3);
    const prefix = palabras.length > 0 ? palabras[0].substring(0, 3) : 'GEN';
    const existentes = insumos.filter(i => i.codigo.startsWith(`INS-${prefix}-`));
    const nextNum = existentes.length + 1;
    return `INS-${prefix}-${String(nextNum).padStart(2, '0')}`;
  };

  const codigoPreview = calcularCodigoAutogenerado(nuevoNombre);

  // Registrar compra / entrada al kardex
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
      setModalEntradaAbierto(false);
      setObservacion('');
      await cargarInsumos();
      if (onInsumoActualizado) onInsumoActualizado();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al registrar entrada en kardex');
    } finally {
      setCargando(false);
    }
  };

  // Crear nuevo insumo con código autogenerado
  const handleCrearInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setCargando(true);
    try {
      const nuevoDto: CrearInsumoDTO = {
        nombre: nuevoNombre.trim(),
        unidad_medida: nuevoUnidad,
        stock_inicial: Number(nuevoStockInicial),
        stock_minimo: Number(nuevoStockMinimo),
        costo_unitario: Number(nuevoCosto),
        descripcion: nuevoDescripcion.trim() || undefined
      };
      const creado = await apiService.crearInsumo(nuevoDto);
      setMensajeExito(`Insumo '${creado.nombre}' creado exitosamente con código '${creado.codigo}'.`);
      setModalCrearAbierto(false);
      // Limpiar formulario
      setNuevoNombre('');
      setNuevoDescripcion('');
      setNuevoStockInicial(10);
      setNuevoStockMinimo(5);
      setNuevoCosto(5.0);
      await cargarInsumos();
      if (onInsumoActualizado) onInsumoActualizado();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al crear insumo');
    } finally {
      setCargando(false);
    }
  };

  // Confirmar eliminación / baja lógica
  const handleConfirmarEliminar = async () => {
    if (!insumoAEliminar) return;
    setCargando(true);
    try {
      await apiService.eliminarInsumo(insumoAEliminar.id);
      setMensajeExito(`El insumo '${insumoAEliminar.nombre}' (${insumoAEliminar.codigo}) fue dado de baja correctamente.`);
      setModalEliminarAbierto(false);
      setInsumoAEliminar(null);
      await cargarInsumos();
      if (onInsumoActualizado) onInsumoActualizado();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar insumo');
    } finally {
      setCargando(false);
    }
  };

  // Render del Semáforo de Alertas: Rojo, Amarillo y Verde
  const renderSemaforo = (insumo: Insumo) => {
    const { stock_actual, stock_minimo, estado_alerta } = insumo;
    const esRojo = estado_alerta === 'CRITICO_ROJO' || estado_alerta === 'CRITICO_AGOTADO' || stock_actual <= (stock_minimo / 2);
    const esAmarillo = !esRojo && (insumo.esta_en_alerta || estado_alerta === 'ALERTA_AMARILLO' || stock_actual <= stock_minimo);

    if (esRojo) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          {stock_actual === 0 ? 'Agotado (0)' : 'Crítico / Urgente'}
        </span>
      );
    }

    if (esAmarillo) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Alerta Reposición
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Conforme (Óptimo)
      </span>
    );
  };

  const getRowClass = (insumo: Insumo) => {
    const { stock_actual, stock_minimo, estado_alerta } = insumo;
    const esRojo = estado_alerta === 'CRITICO_ROJO' || estado_alerta === 'CRITICO_AGOTADO' || stock_actual <= (stock_minimo / 2);
    const esAmarillo = !esRojo && (insumo.esta_en_alerta || estado_alerta === 'ALERTA_AMARILLO' || stock_actual <= stock_minimo);

    if (esRojo) return 'bg-rose-50/60 hover:bg-rose-100/60';
    if (esAmarillo) return 'bg-amber-50/40 hover:bg-amber-100/60';
    return 'hover:bg-slate-50/80';
  };

  const getSaldoClass = (insumo: Insumo) => {
    const { stock_actual, stock_minimo, estado_alerta } = insumo;
    const esRojo = estado_alerta === 'CRITICO_ROJO' || estado_alerta === 'CRITICO_AGOTADO' || stock_actual <= (stock_minimo / 2);
    const esAmarillo = !esRojo && (insumo.esta_en_alerta || estado_alerta === 'ALERTA_AMARILLO' || stock_actual <= stock_minimo);

    if (esRojo) return 'text-rose-600 font-black';
    if (esAmarillo) return 'text-amber-700 font-black';
    return 'text-emerald-700 font-black';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-slate-800">
      {/* Encabezado con Botón Añadir Insumo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/50 shadow-sm">
              <Package className="w-5 h-5 text-[#D4AF37]" />
            </div>
            Kardex de Inventario (CU06 / CU07)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control de insumos base, recetas y semáforo de stock (Rojo, Amarillo y Verde).
          </p>
        </div>

        {/* Botón Principal para Añadir Insumo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalCrearAbierto(true)}
            className="px-4 py-2.5 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Añadir Nuevo Insumo
          </button>
        </div>
      </div>

      {/* Alerta de éxito */}
      {mensajeExito && (
        <div className="bg-white border-2 border-[#D4AF37] text-slate-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md animate-scale-in">
          <CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-semibold">{mensajeExito}</span>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
        <input
          type="text"
          placeholder="Buscar insumo por nombre o código autogenerado..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] shadow-sm transition-all"
        />
      </div>

      {/* Lista Mobile (Tarjetas Blancas con Semáforo y Acciones) */}
      <div className="grid grid-cols-1 md:hidden gap-3">
        {cargandoLista ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-200 flex justify-center shadow-sm">
            <GoldSpinner size="md" texto="Cargando inventario de insumos..." />
          </div>
        ) : insumosFiltrados.length === 0 ? (
          <div className="py-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No se encontraron insumos que coincidan con la búsqueda.
          </div>
        ) : (
          insumosFiltrados.map(i => {
            return (
              <div
                key={i.id}
                className={`p-4 rounded-2xl border transition-all bg-white shadow-sm ${getRowClass(i)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold">
                      {i.codigo}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-1.5">{i.nombre}</h3>
                    <p className="text-xs text-slate-500">{i.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div>{renderSemaforo(i)}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Saldo: </span>
                    <span className={`text-sm ${getSaldoClass(i)}`}>
                      {i.stock_actual} {i.unidad_medida}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">(Mín: {i.stock_minimo})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setInsumoSeleccionado(i); setModalEntradaAbierto(true); }}
                      className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Entrada
                    </button>
                    <button
                      onClick={() => { setInsumoAEliminar(i); setModalEliminarAbierto(true); }}
                      title="Eliminar Insumo"
                      className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabla Desktop (Contenedor Blanco con Encabezado Negro y Dorado) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-black border-b border-black text-xs font-black uppercase text-[#D4AF37] tracking-wider">
            <tr>
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Insumo</th>
              <th className="px-5 py-4 text-center">U.M.</th>
              <th className="px-5 py-4 text-right">Saldo Actual</th>
              <th className="px-5 py-4 text-right">Stock Mínimo</th>
              <th className="px-5 py-4 text-center">Estado Semáforo</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargandoLista ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <GoldSpinner size="md" texto="Cargando inventario de insumos..." />
                  </div>
                </td>
              </tr>
            ) : insumosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-400">
                  No se encontraron insumos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              insumosFiltrados.map(i => {
                return (
                  <tr
                    key={i.id}
                    className={`transition-colors ${getRowClass(i)}`}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-[#997A15] font-bold">{i.codigo}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{i.nombre}</td>
                    <td className="px-5 py-4 text-center font-mono text-xs text-slate-500">{i.unidad_medida}</td>
                    <td className="px-5 py-4 text-right font-black">
                      <span className={`text-base ${getSaldoClass(i)}`}>
                        {i.stock_actual.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-500">{i.stock_minimo.toFixed(2)}</td>
                    <td className="px-5 py-4 text-center">
                      {renderSemaforo(i)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setInsumoSeleccionado(i); setModalEntradaAbierto(true); }}
                          className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Entrada
                        </button>
                        <button
                          onClick={() => { setInsumoAEliminar(i); setModalEliminarAbierto(true); }}
                          title="Eliminar Insumo"
                          className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Añadir Nuevo Insumo (Código Autogenerado) */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-slate-900 animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D4AF37]" />
                  Añadir Nuevo Insumo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  El código correlativo es autogenerado por el sistema según la categoría.
                </p>
              </div>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-slate-400 hover:text-slate-800 text-2xl leading-none p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Banner de Código Autogenerado en Tiempo Real */}
            <div className="bg-slate-50 border border-[#D4AF37] rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Código de Insumo:</p>
                  <p className="font-mono text-sm font-black text-[#997A15]">{codigoPreview}</p>
                </div>
              </div>
              <span className="text-[10px] bg-[#D4AF37]/15 text-[#997A15] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-bold">
                Autogenerado
              </span>
            </div>

            <form onSubmit={handleCrearInsumo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Taza Mágica Plateada 11oz, Polo Cuello V Negro"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Unidad de Medida
                  </label>
                  <select
                    value={nuevoUnidad}
                    onChange={e => setNuevoUnidad(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  >
                    <option value="UND">UND (Unidades)</option>
                    <option value="METRO">METRO (Metros)</option>
                    <option value="LITRO">LITRO (Litros)</option>
                    <option value="KG">KG (Kilos)</option>
                    <option value="ROLLO">ROLLO (Rollos)</option>
                    <option value="PACK">PACK (Paquetes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Costo Unitario (S/)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={nuevoCosto}
                    onChange={e => setNuevoCosto(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={nuevoStockInicial}
                    onChange={e => setNuevoStockInicial(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={nuevoStockMinimo}
                    onChange={e => setNuevoStockMinimo(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Descripción / Detalles (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Material sensible al calor para grabado láser"
                  value={nuevoDescripcion}
                  onChange={e => setNuevoDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-5 py-2.5 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {cargando ? (
                    <span className="inline-flex items-center gap-2">
                      <GoldSpinner size="xs" /> Guardando Insumo...
                    </span>
                  ) : (
                    'Guardar y Dar de Alta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Registrar Entrada / Compra (CU06) */}
      {modalEntradaAbierto && insumoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-slate-900 animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900">Registrar Entrada de Insumo</h3>
                <p className="text-xs text-[#997A15] mt-0.5 font-bold">{insumoSeleccionado.nombre} ({insumoSeleccionado.codigo})</p>
              </div>
              <button
                onClick={() => setModalEntradaAbierto(false)}
                className="text-slate-400 hover:text-slate-800 text-2xl leading-none p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegistrarEntrada} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cantidad a Ingresar ({insumoSeleccionado.unidad_medida})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={cantidadEntrada}
                  onChange={e => setCantidadEntrada(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Motivo / Observación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Compra factura 001-4521"
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalEntradaAbierto(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs shadow-md shadow-[#D4AF37]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {cargando ? (
                    <span className="inline-flex items-center gap-2">
                      <GoldSpinner size="xs" /> Procesando Entrada...
                    </span>
                  ) : (
                    'Confirmar Ingreso al Kardex'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Confirmación de Eliminación / Baja Lógica */}
      {modalEliminarAbierto && insumoAEliminar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-200 space-y-5 text-slate-900 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">¿Dar de baja este insumo?</h3>
                <p className="text-xs text-rose-600 font-bold mt-0.5 font-mono">{insumoAEliminar.codigo}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Estás a punto de eliminar el insumo <strong className="text-slate-900">"{insumoAEliminar.nombre}"</strong>.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Esta acción desactivará el insumo en el kardex y ya no estará disponible para recetas ni órdenes de producción.</span>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalEliminarAbierto(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={handleConfirmarEliminar}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {cargando ? (
                  <span className="inline-flex items-center gap-2">
                    <GoldSpinner size="xs" /> Eliminando...
                  </span>
                ) : (
                  'Sí, Dar de Baja'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
