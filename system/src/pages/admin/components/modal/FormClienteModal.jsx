import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaShieldAlt, FaSearch } from 'react-icons/fa';
import api from "../../../../api/axios";

const FormClienteModal = ({ isOpen, onClose, formData, setFormData, handleSubmit, loading }) => {
    const [nodosOcupados, setNodosOcupados] = useState([]);
    const [loadingInventory, setLoadingInventory] = useState(false);

    useEffect(() => {
        if (isOpen) fetchOcupados();
    }, [isOpen]);

    const fetchOcupados = async () => {
        setLoadingInventory(true);
        try {
            const res = await api.get("/admin/check-inventory");
            setNodosOcupados(res.data);
        } catch (err) {
            console.error("Error cargando inventario", err);
        } finally {
            setLoadingInventory(false);
        }
    };

    const todosLosNodos = Array.from({ length: 21 }, (_, i) => i.toString().padStart(3, '0'));
    const nodosDisponibles = todosLosNodos.filter(n => !nodosOcupados.includes(n));

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#051d26]/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-7xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    {/* COLUMNA IZQUIERDA: Branding (Más delgada y compacta) */}
                    <div className="w-full md:w-[30%] bg-[#051d26] p-10 flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <FaShieldAlt className="text-[#57c2ce] mb-6" size={28} />
                            <h2 className="text-4xl font-black text-white italic tracking-tighter leading-[0.9] mb-4">
                                REGISTRO<br />
                                <span className="text-[#57c2ce]">NODO_DENAR</span>
                            </h2>
                            <p className="text-[9px] text-slate-400 tracking-[0.3em] uppercase">Denar.Network v1.8</p>
                        </div>
                        <img src="/denarTexto.png" alt="Logo" className="h-20 opacity-40 self-start" />
                    </div>

                    {/* COLUMNA DERECHA: Formulario (Espaciado optimizado) */}
                    <div className="flex-1 p-8 md:p-12 bg-white relative overflow-hidden flex flex-col justify-center">
                        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all">
                            <FaTimes size={20} />
                        </button>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Selector Tipo Persona */}
                            <div className="flex gap-4">
                                {['empresa', 'fisica'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tipo_cliente: type })}
                                        className={`flex-1 py-3 rounded-xl border-2 text-[9px] font-bold uppercase tracking-widest transition-all ${formData.tipo_cliente === type
                                            ? 'bg-[#051d26] text-white border-[#051d26]'
                                            : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}
                                    >
                                        {/* CORRECCIÓN AQUÍ: Si el tipo es 'empresa' muestra 'Empresa', sino 'Individuo' */}
                                        {type === 'empresa' ? 'Empresa' : 'Individuo'}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                                <div className="col-span-12 md:col-span-4 relative">
                                    <ModalField
                                        label="RFC Contribuyente"
                                        value={formData.rfc}
                                        isMono
                                        onChange={v => setFormData({ ...formData, rfc: v.toUpperCase() })}
                                        placeholder="XXXX000000XXX"
                                        maxLength={13}
                                    />
                                    <div className="absolute right-3 bottom-3 text-slate-300"><FaSearch size={12} /></div>
                                </div>

                                <div className="col-span-12 md:col-span-8">
                                    <ModalField
                                        label="Razón Social"
                                        value={formData.nombre_comercial}
                                        onChange={v => setFormData({ ...formData, nombre_comercial: v })}
                                        placeholder="NOMBRE LEGAL DE LA COMPAÑÍA"
                                    />
                                </div>

                                <div className="col-span-12">
                                    <ModalField
                                        label="Email de Acceso Maestro"
                                        type="email"
                                        value={formData.email}
                                        onChange={v => setFormData({ ...formData, email: v })}
                                        placeholder="admin@dominio.com"
                                    />
                                </div>

                                {/* SELECTOR DE TRONCO STP DINÁMICO (Más compacto) */}
                                <div className="col-span-12 space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            Nodos de Red Disponibles
                                        </label>
                                        {loadingInventory && <span className="text-[8px] text-[#57c2ce] animate-pulse font-bold">SCANNING...</span>}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2 p-1">
                                        {nodosDisponibles.map((nodo) => (
                                            <button
                                                key={nodo}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, clabe_stp_intermedia: `6461806665${nodo}` })}
                                                className={`py-2.5 rounded-lg border font-mono text-[10px] transition-all ${formData.clabe_stp_intermedia?.endsWith(nodo)
                                                    ? 'bg-[#051d26] text-[#57c2ce] border-[#051d26] shadow-md scale-105'
                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-[#57c2ce]/50'
                                                    }`}
                                            >
                                                #{nodo}
                                            </button>
                                        ))}
                                    </div>

                                    {/* VISUALIZADOR DE CLABE SELECCIONADA (Inline para ahorrar espacio) */}
                                    <div className="py-3 px-5 bg-slate-900 rounded-2xl flex justify-between items-center border border-white/5">
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">CLABE Seleccionada:</span>
                                        <span className="text-xs font-mono font-bold text-[#57c2ce]">
                                            {formData.clabe_stp_intermedia || 'WAITING_SELECTION...'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.clabe_stp_intermedia}
                                className="w-full bg-[#82c9c4] text-[#051d26] py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-[#57c2ce] hover:translate-y-[-1px] transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                            >
                                {loading ? "SINCRONIZANDO..." : <><FaCheckCircle size={16} /> Aprovisionar Infraestructura</>}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const ModalField = ({ label, value, onChange, type = "text", placeholder, isMono, maxLength }) => (
    <div className="space-y-1.5 group">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 italic group-focus-within:text-[#57c2ce] transition-colors">
            {label}
        </label>
        <input
            required type={type} value={value || ''} maxLength={maxLength}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-slate-50 border-b border-slate-200 p-3.5 text-[13px] font-medium text-[#051d26] outline-none focus:border-[#57c2ce] focus:bg-white transition-all ${isMono ? 'font-mono tracking-tight' : ''}`}
        />
    </div>
);

export default FormClienteModal;