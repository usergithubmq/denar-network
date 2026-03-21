import React, { useState, useEffect } from "react";
import {
    FaTimes, FaArrowDown, FaUniversity, FaSpinner, FaReceipt,
    FaCheckCircle, FaClock, FaStore, FaMoneyBillWave, FaExclamationTriangle, FaShieldAlt
} from "react-icons/fa";
import api from "../../../api/axios";

// --- SUB-COMPONENTE: MODAL DE PAGO EN EFECTIVO ---
const CashPaymentForm = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative animate-in zoom-in-95">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 rounded-full hover:text-red-500 transition-colors">
                    <FaTimes size={16} />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaStore size={30} />
                    </div>
                    <h4 className="text-xl font-black text-slate-800">Pago en Tiendas</h4>
                    <p className="text-slate-500 text-sm">Genera tu ficha de pago para OXXO/Paynet</p>
                </div>
                <button className="w-full bg-[#0c516e] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-[#0a4058] transition-all">
                    <FaReceipt /> GENERAR FICHA DE PAGO
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function BalanceModal({ isOpen, onClose, user }) {
    const [abonos, setAbonos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);

    const formatMXN = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

    useEffect(() => {
        // Usamos clabe_stp o la clabe que venga del objeto user
        const clabe = user?.clabe_stp || user?.cuenta_beneficiario;
        if (isOpen && clabe) fetchData(clabe);
    }, [isOpen, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Historial (Esta ruta SÍ existe en tu archivo como /client/stp/abonos/...)
            const resAbonos = await api.get(`/client/stp/abonos/${user.clabe_stp}`);
            setAbonos(resAbonos.data.data || []);

            // 2. Consulta de Saldo (POST a la ruta correcta con el prefijo 'client')
            const resSaldo = await api.post(`/client/consultar-pago`, {
                cuenta_beneficiario: user.clabe_stp
            });

            // Laravel devuelve { data: { ... } }, React accede a .data.data
            setResumen(resSaldo.data.data);
        } catch (error) {
            console.error("Error en KoonSystem:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">

                    {/* Header: Branding KoonSystem */}
                    <div className="bg-[#0c516e] p-7 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-teal-400 text-[#0c516e] rounded-2xl shadow-lg shadow-teal-500/20">
                                <FaShieldAlt size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{user.name || user.nombre}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] text-teal-300 font-black tracking-widest uppercase">Cuenta Auditada en Tiempo Real</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><FaTimes size={20} /></button>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar bg-slate-50/50">
                        {/* 1. Resumen de Bolsa Única */}
                        {resumen && (
                            <div className="px-7 pt-7 grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-[1.5rem] border bg-white border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Monto Acumulado</p>
                                    <p className="text-lg font-black text-emerald-600">{formatMXN(resumen.monto_acumulado)}</p>
                                </div>
                                <div className="p-4 rounded-[1.5rem] border bg-white border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-red-700 mb-1">Cargos Moratoria</p>
                                    <p className="text-lg font-black text-red-700">{formatMXN(resumen.moratoria)}</p>
                                </div>
                                <div className="hidden md:block p-4 rounded-[1.5rem] border bg-white border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Progreso</p>
                                    <p className="text-lg font-black text-blue-600">{resumen.progreso}%</p>
                                </div>
                            </div>
                        )}

                        {/* 2. Banner de Liquidación Total */}
                        {resumen && (
                            <div className="px-7 py-5">
                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                    <div className="relative z-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* CLABE SPEI */}
                                            <div className="group flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                                <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-500/20"><FaUniversity size={18} /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CLABE SPEI PERSONALIZADA</p>
                                                    <p className="text-sm font-mono font-bold tracking-widest text-blue-100">{user.clabe_stp || 'SIN ASIGNAR'}</p>
                                                </div>
                                            </div>
                                            {/* Efectivo */}
                                            <button onClick={() => setShowCashModal(true)} className="flex items-center gap-4 bg-emerald-500 p-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                                                <div className="bg-white text-emerald-600 p-3 rounded-xl"><FaStore size={18} /></div>
                                                <p className="text-xs font-black uppercase text-white tracking-wider">Pagar en Efectivo</p>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 opacity-20 rotate-12 text-blue-400"><FaMoneyBillWave size={180} /></div>
                                </div>
                            </div>
                        )}

                        {/* 3. Historial de Abonos */}
                        <div className="px-7 pb-10">
                            <div className="flex items-center justify-between my-8 px-2">
                                <h5 className="font-black text-slate-800 flex items-center gap-2 text-xs uppercase tracking-widest">
                                    <div className="w-1.5 h-5 bg-teal-500 rounded-full"></div> Bitácora de Pagos
                                </h5>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">Sync Real-Time</span>
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <FaSpinner className="animate-spin text-3xl mb-3 text-[#0c516e]" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Consultando con el Banco...</p>
                                    </div>
                                ) : abonos.length > 0 ? (
                                    abonos.map((abono) => (
                                        <div key={abono.id} className="group flex justify-between items-center p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-lg hover:border-teal-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-lg shadow-inner">
                                                    <FaCheckCircle />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm leading-tight">{abono.concepto_pago || 'Transferencia STP'}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold font-mono tracking-tighter uppercase">{abono.clave_rastreo}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-emerald-600 font-black text-base leading-none mb-1">{formatMXN(abono.monto)}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(abono.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-14 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                            <FaClock size={28} />
                                        </div>
                                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Esperando primer abono...</p>
                                        <p className="text-[9px] text-slate-300 mt-1 uppercase">Los pagos vía SPEI se reflejan en segundos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Call to Action */}
                    <div className="p-6 border-t border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <FaShieldAlt size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Powered by KoonSystem Payment Core v3.0</span>
                        </div>
                        <button onClick={onClose} className="w-full md:w-auto px-10 py-4 bg-[#0c516e] text-white rounded-2xl font-black text-xs hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">ENTENDIDO</button>
                    </div>
                </div>
            </div>

            <CashPaymentForm isOpen={showCashModal} onClose={() => setShowCashModal(false)} user={user} />
        </>
    );
}