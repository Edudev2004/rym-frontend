import React, { useState, useEffect } from 'react';
import { Cliente, TipoDocumentoIdentidad, CanalContacto } from '../types';
import { apiService } from '../services/api';
import { GoldSpinner } from '../components/GoldSpinner';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Building2,
  User,
  ShoppingBag
} from 'lucide-react';

interface Props {
  onNavigate?: (view: string) => void;
  onSeleccionarClienteParaPedido?: (cliente: Cliente) => void;
}

export const FrmClientes: React.FC<Props> = ({ onNavigate, onSeleccionarClienteParaPedido }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [cargandoLista, setCargandoLista] = useState(true);

  // Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoClienteId, setEditandoClienteId] = useState<string | null>(null);

  // Formulario
  const [tipoDoc, setTipoDoc] = useState<TipoDocumentoIdentidad>('DNI');
  const [numDoc, setNumDoc] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [canalFrecuente, setCanalFrecuente] = useState<CanalContacto>('WHATSAPP');

  // Estados UI
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  useEffect(() => {
    cargarClientes();
  }, [busqueda]);

  const cargarClientes = async () => {
    setCargandoLista(true);
    try {
      const data = await apiService.getClientes(busqueda);
      setClientes(data);
    } finally {
      setCargandoLista(false);
    }
  };

  // Validación de documento en vivo
  const validarDocumento = (tipo: TipoDocumentoIdentidad, num: string) => {
    const val = num.trim();
    if (tipo === 'DNI') {
      if (!/^\d{8}$/.test(val)) {
        return 'El DNI debe tener exactamente 8 dígitos numéricos.';
      }
    } else if (tipo === 'RUC') {
      if (!/^\d{11}$/.test(val)) {
        return 'El RUC debe tener exactamente 11 dígitos numéricos.';
      }
      if (!['10', '20', '15', '17'].some(p => val.startsWith(p))) {
        return 'El RUC debe comenzar con 10, 20, 15 o 17.';
      }
    }
    return null;
  };

  const docValido = !validarDocumento(tipoDoc, numDoc) && numDoc.length > 0;
  const telValido = /^\d{9}$/.test(telefono.replace(/\s+/g, '')) || (telefono.trim().length >= 7);

  const abrirModalNuevo = () => {
    setEditandoClienteId(null);
    setTipoDoc('DNI');
    setNumDoc('');
    setNombres('');
    setApellidos('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setCanalFrecuente('WHATSAPP');
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (c: Cliente) => {
    setEditandoClienteId(c.id);
    setTipoDoc(c.tipo_documento);
    setNumDoc(c.numero_documento);
    setNombres(c.nombres);
    setApellidos(c.apellidos || '');
    setTelefono(c.telefono);
    setEmail(c.email || '');
    setDireccion(c.direccion || '');
    setCanalFrecuente(c.canal_frecuente);
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const handleGuardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    const errorDoc = validarDocumento(tipoDoc, numDoc);
    if (errorDoc) {
      setErrorValidacion(errorDoc);
      return;
    }

    if (!nombres.trim()) {
      setErrorValidacion('Ingrese el nombre o razón social.');
      return;
    }

    if (!telefono.trim() || !telValido) {
      setErrorValidacion('Ingrese un número de teléfono celular válido (mínimo 7 dígitos).');
      return;
    }

    setCargandoAccion(true);
    try {
      if (editandoClienteId) {
        await apiService.actualizarCliente(editandoClienteId, {
          nombres,
          apellidos,
          telefono,
          email,
          direccion,
          canal_frecuente: canalFrecuente
        });
        setMensajeExito('Cliente actualizado correctamente.');
      } else {
        await apiService.crearCliente({
          tipo_documento: tipoDoc,
          numero_documento: numDoc,
          nombres,
          apellidos,
          telefono,
          email,
          direccion,
          canal_frecuente: canalFrecuente
        });
        setMensajeExito('Cliente registrado con éxito.');
      }

      setModalAbierto(false);
      await cargarClientes();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setErrorValidacion(err.message || 'Error al guardar cliente.');
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleEliminarCliente = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar a '${nombre}'?`)) return;
    setCargandoAccion(true);
    try {
      const ok = await apiService.eliminarCliente(id);
      if (ok) {
        setMensajeExito(`Cliente '${nombre}' eliminado.`);
        await cargarClientes();
        setTimeout(() => setMensajeExito(null), 3000);
      }
    } finally {
      setCargandoAccion(false);
    }
  };

  // Filtrado en memoria
  const clientesFiltrados = clientes.filter(c => {
    if (filtroTipo === 'DNI' && c.tipo_documento !== 'DNI') return false;
    if (filtroTipo === 'RUC' && c.tipo_documento !== 'RUC') return false;
    return true;
  });

  const totalDNI = clientes.filter(c => c.tipo_documento === 'DNI').length;
  const totalRUC = clientes.filter(c => c.tipo_documento === 'RUC').length;

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-slate-800">
      {/* Banner Principal — Blanco con Acento Dorado */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#D4AF37]/15 text-[#997A15] border border-[#D4AF37]/40 px-3 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                Directorio Clientes — Fase 2
              </span>
              {cargandoLista && <GoldSpinner size="xs" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-slate-900">
              Directorio de Clientes
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Base centralizada con validación SUNAT (DNI 8 dígitos / RUC 11 dígitos), trazabilidad de canales y enlace directo para pedidos.
            </p>
          </div>

          <button
            onClick={abrirModalNuevo}
            className="px-5 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs transition-all shadow-md shadow-[#D4AF37]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> + Registrar Nuevo Cliente
          </button>
        </div>

        {/* Resumen Métrico */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Clientes</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{clientes.length}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Personas (DNI)</p>
            <p className="text-xl sm:text-2xl font-black text-blue-700 mt-0.5">{totalDNI}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Empresas (RUC)</p>
            <p className="text-xl sm:text-2xl font-black text-purple-700 mt-0.5">{totalRUC}</p>
          </div>
        </div>
      </div>

      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por DNI, RUC, nombre, apellido o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 shadow-sm"
          />
        </div>

        {/* Selector de Filtro */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          {['TODOS', 'DNI', 'RUC'].map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filtroTipo === tipo
                  ? 'bg-black text-[#D4AF37] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tipo === 'TODOS' ? 'Todos' : tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map(c => {
          const esRuc = c.tipo_documento === 'RUC';
          const telFormateado = c.telefono.replace(/\s+/g, '');
          const enlaceWhatsApp = `https://wa.me/51${telFormateado}`;

          return (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cabecera Tarjeta: Tipo Doc y Canal */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    esRuc
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {esRuc ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {c.tipo_documento}: {c.numero_documento}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.canal_frecuente}
                  </span>
                </div>

                {/* Nombre */}
                <h3 className="font-extrabold text-sm text-slate-900 mt-2.5 line-clamp-1" title={c.nombre_completo}>
                  {c.nombre_completo}
                </h3>

                {/* Datos de Contacto */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono font-semibold text-slate-800">{c.telefono}</span>
                    <a
                      href={enlaceWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1"
                      title="Chatear por WhatsApp"
                    >
                      WhatsApp <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {c.email && (
                    <div className="flex items-center gap-2 truncate" title={c.email}>
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}

                  {c.direccion && (
                    <div className="flex items-center gap-2 truncate" title={c.direccion}>
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botonera de Acciones */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (onSeleccionarClienteParaPedido) {
                      onSeleccionarClienteParaPedido(c);
                    } else if (onNavigate) {
                      onNavigate('pedidos');
                    }
                  }}
                  className="px-3 py-1.5 bg-black hover:bg-[#D4AF37] text-white hover:text-black font-bold rounded-lg text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Iniciar Pedido
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => abrirModalEditar(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Editar Cliente"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEliminarCliente(c.id, c.nombre_completo)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar Cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {clientesFiltrados.length === 0 && !cargandoLista && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No se encontraron clientes</p>
          <p className="text-xs text-slate-500 mt-1">Pruebe ajustando los términos de búsqueda o registre un nuevo cliente.</p>
        </div>
      )}

      {/* Modal Crear / Editar Cliente */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editandoClienteId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                  </h3>
                  <p className="text-xs text-slate-500">Validación de identidad DNI / RUC SUNAT</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCliente} className="mt-4 space-y-3.5">
              {errorValidacion && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorValidacion}</span>
                </div>
              )}

              {/* Selector Tipo Doc y Número */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tipo Doc *
                  </label>
                  <select
                    value={tipoDoc}
                    disabled={!!editandoClienteId}
                    onChange={(e) => {
                      setTipoDoc(e.target.value as TipoDocumentoIdentidad);
                      setErrorValidacion(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="DNI">DNI (8 dígitos)</option>
                    <option value="RUC">RUC (11 dígitos)</option>
                    <option value="CE">Carnet Ext. (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Número de Documento *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={!!editandoClienteId}
                      value={numDoc}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (tipoDoc === 'DNI' && val.length > 8) return;
                        if (tipoDoc === 'RUC' && val.length > 11) return;
                        setNumDoc(val);
                      }}
                      placeholder={tipoDoc === 'DNI' ? 'Ej: 72849102' : 'Ej: 20601234567'}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none ${
                        docValido
                          ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/20'
                          : numDoc.length > 0
                          ? 'border-amber-400 focus:border-amber-400'
                          : 'border-slate-200 focus:border-[#D4AF37]'
                      }`}
                    />
                    {docValido && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {tipoDoc === 'DNI' ? 'Debe tener exactamente 8 dígitos.' : 'Debe tener 11 dígitos e iniciar con 10 o 20.'}
                  </p>
                </div>
              </div>

              {/* Nombres / Razón Social */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {tipoDoc === 'RUC' ? 'Razón Social / Nombre Comercial *' : 'Nombres *'}
                </label>
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder={tipoDoc === 'RUC' ? 'Ej: Inversiones y Regalos S.A.C.' : 'Ej: Juan Carlos'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Apellidos (si no es RUC) */}
              {tipoDoc !== 'RUC' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej: Pérez Alva"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}

              {/* Teléfono y Canal Frecuente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Teléfono Celular *
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 987654321"
                    maxLength={9}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Canal Habitual
                  </label>
                  <select
                    value={canalFrecuente}
                    onChange={(e) => setCanalFrecuente(e.target.value as CanalContacto)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="TIENDA_FISICA">Tienda Física</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              {/* Email y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@correo.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Dirección (Opcional)
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Perú 2450, SMP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoAccion}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs transition-all shadow-md shadow-[#D4AF37]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {cargandoAccion ? <GoldSpinner size="xs" /> : null}
                  {editandoClienteId ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
