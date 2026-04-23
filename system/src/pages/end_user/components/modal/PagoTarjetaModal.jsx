// src/pages/end_user/components/PaymentModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CreditCard, User, Mail, ShieldCheck } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, monto, clienteNombre }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="bg-[#f8fafc] w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-white"
                >
                    {/* Header Premium */}
                    <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#0c516e] flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 leading-none tracking-tight">Pasarela Sinergy</h3>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Powered by STP</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Resumen de Pago */}
                        <div className="mb-8 p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-xl">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#279a94] mb-1">Total a pagar</p>
                                    <h2 className="text-3xl font-light italic">${monto.toLocaleString('es-MX')} <span className="text-sm opacity-60">MXN</span></h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Referencia</p>
                                    <p className="font-mono text-sm">STP-{Math.floor(Math.random() * 90000) + 10000}</p>
                                </div>
                            </div>
                            {/* Decoración 3D fondo tarjeta */}
                            <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-[#0c516e] rounded-full blur-[60px] opacity-30"></div>
                        </div>

                        {/* Formulario Estilo Sobrio */}
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre del Tarjetahabiente</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="text" placeholder="Como aparece en la tarjeta" className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Número de Tarjeta</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Vencimiento</label>
                                    <input type="text" placeholder="MM / AA" className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">CVV</label>
                                    <input type="password" placeholder="***" className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                                </div>
                            </div>

                            <button className="w-full bg-[#0c516e] text-white font-bold py-5 rounded-[1.5rem] shadow-lg shadow-blue-200 hover:bg-[#0c516e] transition-all flex items-center justify-center gap-3 mt-4 group">
                                <span className="tracking-tight">Pagar </span>
                                <Lock size={16} className="opacity-50 group-hover:scale-110 transition-transform" />
                            </button>
                        </form>

                        <p className="mt-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Lock size={12} /> Transacción Protegida por STP México
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;