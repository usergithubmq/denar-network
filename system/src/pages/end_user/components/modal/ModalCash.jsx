import React from 'react';
import { motion } from 'framer-motion';
import { FaBarcode, FaTimes, FaPrint, FaClock } from "react-icons/fa";

const ModalCash = ({ data, onClose }) => {
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010e24]/90 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a2936] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden text-white shadow-2xl"
            >
                <div className="p-8 text-center relative">
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-6">
                        <FaBarcode size={32} className="text-[#0a2936]" />
                    </div>

                    <h3 className="text-xl font-black uppercase mb-2">Pago en Efectivo</h3>
                    <p className="text-xs text-[#60e2ff] font-medium mb-8 tracking-widest uppercase">Referencia pago en efectivo</p>

                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 mb-6">
                        <p className="text-[10px] font-black tracking-[0.3em] text-[#60e2ff] mb-2 uppercase">Número de Referencia</p>
                        <span className="text-2xl font-mono tracking-[0.15em] text-white">
                            {data.reference} {/* Campo 'reference' de la API */}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[9px] opacity-50 uppercase mb-1 font-bold">Monto Exacto</p>
                            <p className="text-lg font-black">${data.amount} MXN</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[9px] opacity-50 uppercase mb-1 font-bold flex items-center gap-1">
                                <FaClock size={8} /> Expira
                            </p>
                            <p className="text-xs font-bold mt-1">
                                {new Date(data.expiration_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="w-full py-4 rounded-2xl bg-[#60e2ff] text-[#0a2936] font-black uppercase text-sm hover:bg-white transition-all transform active:scale-95"
                    >
                        Imprimir Referencia
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ModalCash;