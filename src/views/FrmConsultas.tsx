import React, { useState, useEffect } from 'react';
import { Consulta, CanalContacto, EstadoConsulta, CrearConsultaDTO } from '../types';
import { apiService } from '../services/api';
import { GoldSpinner } from '../components/GoldSpinner';
import {
  MessageSquare,
  Plus,
  Search,
  CheckCircle,
  ExternalLink,
  ShoppingCart,
  Clock,
  Phone,
  Sparkles,
  ShieldCheck,
  Filter
} from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

export const FrmConsultas: React.FC<Props> = ({ onNavigate }) => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [filtroCanal, setFiltroCanal] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [cargandoLista, setCargandoLista] = useState(true);

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalConvertirAbierto, setModalConvertirAbierto] = useState(false);
  const [consultaAConvertir, setConsultaAConvertir] = useState<Consulta | null>(null);

  // Formulario Crear Consulta
  const [nuevoCanal, setNuevoCanal] = useState<CanalContacto>('WHATSAPP');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoContacto, setNuevoContacto] = useState('');
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  // Estados UI
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  useEffect(() => {
    cargarConsultas();
  }, [filtroCanal, filtroEstado]);

  const cargarConsultas = async () => {
    setCargandoLista(true);
    try {
      const data = await apiService.getConsultas(filtroCanal, filtroEstado);
      setConsultas(data);
    } finally {
      setCargandoLista(false);
    }
  };

  const consultasFiltradas = consultas.filter(c =>
    c.remitente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.remitente_contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.mensaje.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrearConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoMensaje.trim()) return;
    setCargandoAccion(true);
    try {
      const dto: CrearConsultaDTO = {
        canal: nuevoCanal,
        remitente_nombre: nuevoNombre.trim(),
        remitente_contacto: nuevoContacto.trim() || 'No especificado',
        mensaje: nuevoMensaje.trim()
      };
      await apiService.crearConsulta(dto);
      setMensajeExito(`Consulta de '${dto.remitente_nombre}' registrada exitosamente.`);
      setModalCrearAbierto(false);
      setNuevoNombre('');
      setNuevoContacto('');
      setNuevoMensaje('');
      await cargarConsultas();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al registrar consulta');
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleToggleEstado = async (consulta: Consulta) => {
    const nuevoEstado: EstadoConsulta = consulta.estado === 'PENDIENTE' ? 'ATENDIDA' : 'PENDIENTE';
    try {
      await apiService.actualizarEstadoConsulta(consulta.id, nuevoEstado);
      setMensajeExito(`Consulta marcada como '${nuevoEstado}'.`);
      await cargarConsultas();
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  const handleConfirmarConvertir = async () => {
    if (!consultaAConvertir) return;
    setCargandoAccion(true);
    try {
      await apiService.convertirConsultaAPedido(consultaAConvertir.id);
      setMensajeExito(`¡Consulta de '${consultaAConvertir.remitente_nombre}' convertida a Pedido con éxito!`);
      setModalConvertirAbierto(false);
      setConsultaAConvertir(null);
      await cargarConsultas();
      setTimeout(() => {
        setMensajeExito(null);
        onNavigate('dashboard');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Error al convertir consulta');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Renderizador de Badges por Red Social / Canal
  const renderBadgeCanal = (canal: CanalContacto) => {
    switch (canal) {
      case 'WHATSAPP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            WhatsApp
          </span>
        );
      case 'FACEBOOK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Facebook
          </span>
        );
      case 'TIKTOK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-white border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            TikTok
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Presencial
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-slate-800">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/50 shadow-sm">
              <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
            </div>
            Bandeja de Consultas Multicanal (CU01)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Recepción centralizada de prospectos, cotizaciones y conversión directa a pedidos.
          </p>
        </div>

        <button
          onClick={() => setModalCrearAbierto(true)}
          className="px-4 py-2.5 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Registrar Consulta
        </button>
      </div>

      {/* Banner Informativo Oficial: Trámite de Meta Cloud API */}
      <div className="bg-white border border-[#D4AF37]/50 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-black text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">
                Conexión Automática a Meta Cloud API (WhatsApp & Messenger)
              </h3>
              <span className="text-[10px] bg-[#D4AF37]/15 text-[#997A15] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-bold">
                En Trámite & Homologación
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
              Actualmente operando en <strong>modo recepción operativa y registro multicanal directo</strong>. Puedes registrar todas las cotizaciones de WhatsApp, Facebook y TikTok, darles seguimiento y convertirlas a pedidos de producción con 1 solo clic.
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de éxito */}
      {mensajeExito && (
        <div className="bg-white border-2 border-[#D4AF37] text-slate-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md animate-scale-in">
          <CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-semibold">{mensajeExito}</span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o consulta..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
            />
          </div>

          {/* Filtros de Canal y Estado */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5 text-[#D4AF37]" /> Canal:
            </div>
            {['TODOS', 'WHATSAPP', 'FACEBOOK', 'TIKTOK'].map(canal => (
              <button
                key={canal}
                onClick={() => setFiltroCanal(canal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filtroCanal === canal
                    ? 'bg-black text-[#D4AF37] shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {canal === 'TODOS' ? 'Todos' : canal.charAt(0) + canal.slice(1).toLowerCase()}
              </button>
            ))}

            <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            {['TODOS', 'PENDIENTE', 'ATENDIDA'].map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filtroEstado === estado
                    ? 'bg-[#D4AF37] text-black shadow-sm font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {estado === 'TODOS' ? 'Todos Estados' : estado === 'PENDIENTE' ? 'Pendientes' : 'Atendidas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista Mobile (Tarjetas) */}
      <div className="grid grid-cols-1 md:hidden gap-3">
        {cargandoLista ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-200 flex justify-center shadow-sm">
            <GoldSpinner size="md" texto="Cargando consultas multicanal..." />
          </div>
        ) : consultasFiltradas.length === 0 ? (
          <div className="py-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No hay consultas registradas que coincidan con los filtros.
          </div>
        ) : (
          consultasFiltradas.map(c => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {renderBadgeCanal(c.canal)}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.fecha_recepcion ? new Date(c.fecha_recepcion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mt-1">{c.remitente_nombre}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-[#D4AF37]" />
                    {c.remitente_contacto}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleEstado(c)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                    c.estado === 'PENDIENTE'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {c.estado === 'PENDIENTE' ? '🟡 Pendiente' : '🟢 Atendida'}
                </button>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{c.mensaje}"
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {c.canal === 'WHATSAPP' && c.remitente_contacto.replace(/[^0-9]/g, '').length >= 8 && (
                  <a
                    href={`https://wa.me/${c.remitente_contacto.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1"
                  >
                    Abrir Chat <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setConsultaAConvertir(c);
                    setModalConvertirAbierto(true);
                  }}
                  className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Convertir a Pedido
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-black border-b border-black text-xs font-black uppercase text-[#D4AF37] tracking-wider">
            <tr>
              <th className="px-5 py-4">Canal</th>
              <th className="px-5 py-4">Cliente / Contacto</th>
              <th className="px-5 py-4">Mensaje / Cotización</th>
              <th className="px-5 py-4 text-center">Estado</th>
              <th className="px-5 py-4 text-right">Acción Operativa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargandoLista ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <GoldSpinner size="md" texto="Cargando bandeja de consultas..." />
                  </div>
                </td>
              </tr>
            ) : consultasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400">
                  No hay consultas registradas que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              consultasFiltradas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    {renderBadgeCanal(c.canal)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{c.remitente_nombre}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      {c.remitente_contacto}
                      {c.canal === 'WHATSAPP' && c.remitente_contacto.replace(/[^0-9]/g, '').length >= 8 && (
                        <a
                          href={`https://wa.me/${c.remitente_contacto.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir conversación en WhatsApp"
                          className="text-emerald-600 hover:text-emerald-700 ml-1 inline-flex items-center"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-md">
                    <p className="text-xs text-slate-700 line-clamp-2">
                      {c.mensaje}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Recibido: {c.fecha_recepcion ? new Date(c.fecha_recepcion).toLocaleString() : 'Hoy'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleEstado(c)}
                      title="Clic para cambiar de estado"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black cursor-pointer transition-all ${
                        c.estado === 'PENDIENTE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${c.estado === 'PENDIENTE' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`}></span>
                      {c.estado === 'PENDIENTE' ? 'Pendiente' : 'Atendida'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setConsultaAConvertir(c);
                        setModalConvertirAbierto(true);
                      }}
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Convertir a Pedido
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Registrar Nueva Consulta */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-slate-900 animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                  Registrar Consulta Multicanal (CU01)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingresa las cotizaciones o consultas recibidas por WhatsApp, Facebook o TikTok.
                </p>
              </div>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-slate-400 hover:text-slate-800 text-2xl leading-none p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCrearConsulta} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Canal de Contacto
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'WHATSAPP', label: 'WhatsApp', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                    { id: 'FACEBOOK', label: 'Facebook', color: 'border-blue-500 text-blue-700 bg-blue-50' },
                    { id: 'TIKTOK', label: 'TikTok', color: 'border-slate-800 text-slate-900 bg-slate-50' }
                  ].map(canal => (
                    <button
                      key={canal.id}
                      type="button"
                      onClick={() => setNuevoCanal(canal.id as CanalContacto)}
                      className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                        nuevoCanal === canal.id
                          ? `${canal.color} shadow-sm ring-2 ring-[#D4AF37]`
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {canal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre del Cliente o Prospecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lucero Falcon, Marcos Benitez"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Teléfono / WhatsApp o Usuario de Red Social
                </label>
                <input
                  type="text"
                  placeholder="Ej: +51944556677 o @usuario_tiktok"
                  value={nuevoContacto}
                  onChange={e => setNuevoContacto(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mensaje o Producto Cotizado *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej: Consulta por 3 tazas mágicas personalizadas para entrega el viernes en SMP."
                  value={nuevoMensaje}
                  onChange={e => setNuevoMensaje(e.target.value)}
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
                  disabled={cargandoAccion}
                  className="px-5 py-2.5 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37] font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {cargandoAccion ? (
                    <span className="inline-flex items-center gap-2">
                      <GoldSpinner size="xs" /> Guardando...
                    </span>
                  ) : (
                    'Registrar Consulta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmar Conversión de Consulta a Pedido */}
      {modalConvertirAbierto && consultaAConvertir && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D4AF37]/50 space-y-5 text-slate-900 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] text-black flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-6 h-6 text-[#997A15]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Convertir Consulta a Pedido</h3>
                <p className="text-xs text-[#997A15] font-bold mt-0.5">Flujo CU01 ➔ CU02 (Registro de Pedidos)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Se creará la orden de pedido transfiriendo automáticamente los datos del cliente y la cotización:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-900">{consultaAConvertir.remitente_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contacto / Teléfono:</span>
                <span className="font-mono font-bold text-slate-900">{consultaAConvertir.remitente_contacto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Canal de Origen:</span>
                <span>{renderBadgeCanal(consultaAConvertir.canal)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Detalle del Pedido:</span>
                <p className="font-semibold text-slate-800 italic">"{consultaAConvertir.mensaje}"</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalConvertirAbierto(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={cargandoAccion}
                onClick={handleConfirmarConvertir}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs shadow-md shadow-[#D4AF37]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {cargandoAccion ? (
                  <span className="inline-flex items-center gap-2">
                    <GoldSpinner size="xs" /> Creando Pedido...
                  </span>
                ) : (
                  'Confirmar y Crear Pedido'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
