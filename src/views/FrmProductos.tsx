import React, { useState, useEffect } from 'react';
import { Producto, Insumo } from '../types';
import { apiService } from '../services/api';
import { GoldSpinner } from '../components/GoldSpinner';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  Edit3,
  X
} from 'lucide-react';

interface Props {
  onNavigate?: (view: string) => void;
}

export const FrmProductos: React.FC<Props> = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [cargandoLista, setCargandoLista] = useState(true);

  // Acordeón de recetas expandidas
  const [recetaExpandidaId, setRecetaExpandidaId] = useState<string | null>(null);

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Formulario Crear Producto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCategoria, setNuevoCategoria] = useState('SUBLIMADOS');
  const [nuevoPrecio, setNuevoPrecio] = useState<number>(25.0);
  const [nuevoTiempo, setNuevoTiempo] = useState<number>(24);
  const [nuevoDescripcion, setNuevoDescripcion] = useState('');
  const [itemsRecetaTemporal, setItemsRecetaTemporal] = useState<{ insumo_id: string; cantidad: number }[]>([]);

  // Selector temporal para agregar insumos a la receta
  const [insumoIdSeleccionado, setInsumoIdSeleccionado] = useState('');
  const [cantidadInsumoSeleccionado, setCantidadInsumoSeleccionado] = useState<number>(1);

  // Estados UI
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [filtroCategoria]);

  const cargarDatos = async () => {
    setCargandoLista(true);
    try {
      const [prods, ins] = await Promise.all([
        apiService.getProductos(filtroCategoria),
        apiService.getInsumos()
      ]);
      setProductos(prods);
      setInsumosDisponibles(ins);
      if (ins.length > 0 && !insumoIdSeleccionado) {
        setInsumoIdSeleccionado(ins[0].id);
      }
    } finally {
      setCargandoLista(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Autogeneración en vivo de código para preview
  const calcularCodigoAutogenerado = (nombre: string): string => {
    if (!nombre.trim()) return 'PROD-GEN-01';
    const palabras = nombre
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toUpperCase()
      .split(/\s+/)
      .filter(w => w.length >= 3);
    const prefix = palabras.length > 0 ? palabras[0].substring(0, 3) : 'GEN';
    const existentes = productos.filter(p => p.codigo.startsWith(`PROD-${prefix}-`));
    const nextNum = existentes.length + 1;
    return `PROD-${prefix}-${String(nextNum).padStart(2, '0')}`;
  };

  const codigoPreview = calcularCodigoAutogenerado(nuevoNombre);

  // Agregar insumo al constructor de receta en el modal
  const handleAgregarInsumoReceta = () => {
    if (!insumoIdSeleccionado || cantidadInsumoSeleccionado <= 0) return;
    const yaExiste = itemsRecetaTemporal.find(it => it.insumo_id === insumoIdSeleccionado);
    if (yaExiste) {
      setItemsRecetaTemporal(itemsRecetaTemporal.map(it =>
        it.insumo_id === insumoIdSeleccionado
          ? { ...it, cantidad: it.cantidad + Number(cantidadInsumoSeleccionado) }
          : it
      ));
    } else {
      setItemsRecetaTemporal([
        ...itemsRecetaTemporal,
        { insumo_id: insumoIdSeleccionado, cantidad: Number(cantidadInsumoSeleccionado) }
      ]);
    }
    setCantidadInsumoSeleccionado(1);
  };

  const handleQuitarInsumoReceta = (insumoId: string) => {
    setItemsRecetaTemporal(itemsRecetaTemporal.filter(it => it.insumo_id !== insumoId));
  };

  // Crear Producto Completo
  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setCargandoAccion(true);
    try {
      const dto = {
        nombre: nuevoNombre.trim(),
        descripcion: nuevoDescripcion.trim() || undefined,
        categoria: nuevoCategoria,
        precio_base: Number(nuevoPrecio),
        tiempo_estimado_horas: Number(nuevoTiempo),
        receta: itemsRecetaTemporal.map(it => ({
          insumo_id: it.insumo_id,
          cantidad_requerida: it.cantidad
        }))
      };

      const creado = await apiService.crearProducto(dto);
      setMensajeExito(`Producto '${creado.nombre}' creado exitosamente con código '${creado.codigo}'.`);
      setModalCrearAbierto(false);
      // Limpiar formulario
      setNuevoNombre('');
      setNuevoDescripcion('');
      setNuevoPrecio(25.0);
      setNuevoTiempo(24);
      setItemsRecetaTemporal([]);
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al crear producto');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Abrir modal de edición de receta
  const handleAbrirEditarReceta = (prod: Producto) => {
    setProductoSeleccionado(prod);
    setItemsRecetaTemporal(
      prod.receta.map(it => ({
        insumo_id: it.insumo_id,
        cantidad: it.cantidad_requerida
      }))
    );
    setModalRecetaAbierto(true);
  };

  // Guardar receta editada
  const handleGuardarRecetaEditada = async () => {
    if (!productoSeleccionado) return;
    setCargandoAccion(true);
    try {
      const items = itemsRecetaTemporal.map(it => ({
        insumo_id: it.insumo_id,
        cantidad_requerida: it.cantidad
      }));
      await apiService.actualizarRecetaProducto(productoSeleccionado.id, items);
      setMensajeExito(`Receta del producto '${productoSeleccionado.nombre}' actualizada exitosamente.`);
      setModalRecetaAbierto(false);
      setProductoSeleccionado(null);
      setItemsRecetaTemporal([]);
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar receta');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Eliminar producto
  const handleEliminarProducto = async (prod: Producto) => {
    if (!confirm(`¿Confirmas eliminar el producto '${prod.nombre}' (${prod.codigo})?`)) return;
    try {
      await apiService.eliminarProducto(prod.id);
      setMensajeExito(`Producto '${prod.nombre}' eliminado del catálogo.`);
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar producto');
    }
  };

  // Calcular costo temporal de la receta que se está construyendo
  const costoRecetaTemporal = itemsRecetaTemporal.reduce((acc, it) => {
    const ins = insumosDisponibles.find(i => i.id === it.insumo_id);
    return acc + (ins?.costo_unitario || 0) * it.cantidad;
  }, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-slate-800">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/50 shadow-sm">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            Catálogo de Productos & Recetas de Insumos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Definición de artículos personalizables, recetas de consumo y márgenes de ganancia.
          </p>
        </div>

        <button
          onClick={() => {
            setItemsRecetaTemporal([]);
            setModalCrearAbierto(true);
          }}
          className="px-4 py-2.5 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Añadir Nuevo Producto
        </button>
      </div>

      {/* Alerta de éxito */}
      {mensajeExito && (
        <div className="bg-white border-2 border-[#D4AF37] text-slate-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md animate-scale-in">
          <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-sm font-semibold">{mensajeExito}</span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
            />
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['TODOS', 'SUBLIMADOS', 'PRENDAS', 'JOYERIA', 'CORTE_LASER', 'REGALOS'].map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filtroCategoria === cat
                    ? 'bg-black text-[#D4AF37] shadow-sm font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'TODOS' ? 'Todos' : cat.charAt(0) + cat.slice(1).toLowerCase().replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      {cargandoLista ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 flex justify-center shadow-sm">
          <GoldSpinner size="md" texto="Cargando catálogo de productos y recetas..." />
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
          No hay productos registrados en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productosFiltrados.map(prod => {
            const recetaAbierta = recetaExpandidaId === prod.id;

            return (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 hover:border-[#D4AF37]/60 rounded-3xl p-5 shadow-sm space-y-4 transition-all"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#997A15] bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-2 py-0.5 rounded-md">
                        {prod.codigo}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {prod.categoria}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1.5 leading-tight">
                      {prod.nombre}
                    </h3>
                    {prod.descripcion && (
                      <p className="text-xs text-slate-500 mt-0.5">{prod.descripcion}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleEliminarProducto(prod)}
                    title="Eliminar Producto"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Métricas Financieras y Tiempos */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Precio Venta</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      S/ {prod.precio_base.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Costo Insumos</p>
                    <p className="text-sm font-black text-slate-600 mt-0.5">
                      S/ {prod.costo_insumos_total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Margen Bruto</p>
                    <p className="text-sm font-black text-emerald-700 mt-0.5">
                      S/ {prod.margen_estimado.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Sección Desplegable de la Receta */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setRecetaExpandidaId(recetaAbierta ? null : prod.id)}
                      className="text-xs font-bold text-slate-700 hover:text-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Receta de Insumos ({prod.receta.length} materiales)</span>
                      {recetaAbierta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleAbrirEditarReceta(prod)}
                      className="text-xs font-bold text-[#997A15] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Editar Receta
                    </button>
                  </div>

                  {recetaAbierta && (
                    <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 space-y-2 animate-scale-in">
                      {prod.receta.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">
                          Este producto no tiene insumos vinculados en su receta.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {prod.receta.map(it => (
                            <div key={it.id || it.insumo_id} className="py-1.5 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-800">{it.insumo_nombre || it.insumo_codigo}</span>
                                <span className="text-[10px] font-mono text-slate-500 ml-1.5">({it.insumo_codigo})</span>
                              </div>
                              <div className="font-mono font-bold text-slate-900">
                                {it.cantidad_requerida} {it.unidad_medida}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer de la tarjeta */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Tiempo estimado: {prod.tiempo_estimado_horas}h
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Kardex Automático CU06
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Añadir Nuevo Producto con Constructor de Receta */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-slate-900 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  Añadir Nuevo Producto al Catálogo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registra el artículo e indica qué insumos del Kardex consume en su fabricación.
                </p>
              </div>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-slate-400 hover:text-slate-800 text-2xl leading-none p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Banner de Código Autogenerado */}
            <div className="bg-slate-50 border border-[#D4AF37] rounded-2xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Código Correlativo Autogenerado:</p>
                <p className="font-mono text-sm font-black text-[#997A15]">{codigoPreview}</p>
              </div>
              <span className="text-[10px] bg-[#D4AF37]/15 text-[#997A15] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full font-bold">
                Autogenerado
              </span>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Taza Glitter Dorada, Polo Oversize Estampado"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={nuevoCategoria}
                    onChange={e => setNuevoCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  >
                    <option value="SUBLIMADOS">Sublimados</option>
                    <option value="PRENDAS">Prendas</option>
                    <option value="JOYERIA">Joyería</option>
                    <option value="CORTE_LASER">Corte Láser</option>
                    <option value="REGALOS">Regalos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Precio Venta (S/) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={nuevoPrecio}
                    onChange={e => setNuevoPrecio(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Fabricación (Horas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevoTiempo}
                    onChange={e => setNuevoTiempo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Detalles sobre acabado o empaque"
                  value={nuevoDescripcion}
                  onChange={e => setNuevoDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              {/* Constructor de Receta de Insumos */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    Receta de Insumos del Kardex (CU06 / CU07)
                  </h4>
                  <span className="text-xs font-bold text-[#997A15]">
                    Costo Materiales: S/ {costoRecetaTemporal.toFixed(2)}
                  </span>
                </div>

                {/* Selector rápido para agregar material */}
                <div className="flex items-center gap-2">
                  <select
                    value={insumoIdSeleccionado}
                    onChange={e => setInsumoIdSeleccionado(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                  >
                    {insumosDisponibles.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} ({i.codigo}) — S/ {i.costo_unitario.toFixed(2)}/{i.unidad_medida}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={cantidadInsumoSeleccionado}
                    onChange={e => setCantidadInsumoSeleccionado(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                    placeholder="Cant."
                  />

                  <button
                    type="button"
                    onClick={handleAgregarInsumoReceta}
                    className="px-3.5 py-2 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                {/* Tabla de Insumos en la Receta */}
                {itemsRecetaTemporal.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    Agrega los insumos que se descontarán automáticamente del Kardex al pasar a producción.
                  </p>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 divide-y divide-slate-200 max-h-40 overflow-y-auto">
                    {itemsRecetaTemporal.map(it => {
                      const insumo = insumosDisponibles.find(i => i.id === it.insumo_id);
                      const subtotalItem = (insumo?.costo_unitario || 0) * it.cantidad;

                      return (
                        <div key={it.insumo_id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{insumo?.nombre || 'Insumo'}</span>
                            <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                              (S/ {subtotalItem.toFixed(2)})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800">
                              {it.cantidad} {insumo?.unidad_medida}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuitarInsumoReceta(it.insumo_id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoAccion}
                  className="px-5 py-2.5 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {cargandoAccion ? (
                    <span className="inline-flex items-center gap-2">
                      <GoldSpinner size="xs" /> Guardando...
                    </span>
                  ) : (
                    'Guardar Producto y Receta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Editar Receta de Insumos de Producto Existente */}
      {modalRecetaAbierto && productoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-slate-900 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D4AF37]" />
                  Editar Receta: {productoSeleccionado.nombre}
                </h3>
                <p className="text-xs font-mono text-[#997A15] mt-0.5">{productoSeleccionado.codigo}</p>
              </div>
              <button
                onClick={() => setModalRecetaAbierto(false)}
                className="text-slate-400 hover:text-slate-800 text-2xl leading-none p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Selector para agregar insumos */}
            <div className="flex items-center gap-2">
              <select
                value={insumoIdSeleccionado}
                onChange={e => setInsumoIdSeleccionado(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
              >
                {insumosDisponibles.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.nombre} ({i.codigo}) — S/ {i.costo_unitario.toFixed(2)}/{i.unidad_medida}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0.1"
                step="0.1"
                value={cantidadInsumoSeleccionado}
                onChange={e => setCantidadInsumoSeleccionado(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                placeholder="Cant."
              />

              <button
                type="button"
                onClick={handleAgregarInsumoReceta}
                className="px-3.5 py-2 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            {/* Listado de Insumos */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 divide-y divide-slate-200 max-h-56 overflow-y-auto">
              {itemsRecetaTemporal.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No hay insumos asignados a esta receta.
                </p>
              ) : (
                itemsRecetaTemporal.map(it => {
                  const insumo = insumosDisponibles.find(i => i.id === it.insumo_id);
                  const subtotalItem = (insumo?.costo_unitario || 0) * it.cantidad;

                  return (
                    <div key={it.insumo_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{insumo?.nombre || 'Insumo'}</span>
                        <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                          (S/ {subtotalItem.toFixed(2)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">
                          {it.cantidad} {insumo?.unidad_medida}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuitarInsumoReceta(it.insumo_id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-100">
              <span className="text-slate-500">Nuevo Costo Estimado:</span>
              <span className="text-[#997A15] font-black text-sm">
                S/ {costoRecetaTemporal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalRecetaAbierto(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={cargandoAccion}
                onClick={handleGuardarRecetaEditada}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs shadow-md shadow-[#D4AF37]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {cargandoAccion ? (
                  <span className="inline-flex items-center gap-2">
                    <GoldSpinner size="xs" /> Guardando...
                  </span>
                ) : (
                  'Actualizar Receta'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
