import React from 'react';
import { motion } from "framer-motion";
import { FaBarcode, FaBolt } from "react-icons/fa";

const CashPaymentCard = ({ onGenerate, loading }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[3rem] bg-[#020a0e] p-1 shadow-2xl group cursor-pointer"
            onClick={onGenerate}
        >
            {/* Glows de profundidad */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

            <div className="relative z-10 bg-gradient-to-br from-[#051a22] to-[#020a0e] rounded-[2.9rem] p-10 border border-white/5 flex flex-col md:flex-row items-center gap-12">

                {/* Lado Izquierdo: El "Arte" del Efectivo */}
                <div className="relative h-48 w-64 flex items-center justify-center">

                    {/* Billete Futurista */}
                    <motion.div
                        animate={{
                            rotateY: [0, 10, 0],
                            y: [0, -10, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative h-32 w-56 bg-gradient-to-br from-emerald-400/20 to-teal-900/40 border border-emerald-500/30 rounded-xl backdrop-blur-sm p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <div className="h-6 w-8 rounded bg-emerald-500/20 border border-emerald-500/40" />
                            <div className="text-[8px] font-black text-emerald-500/60 tracking-widest uppercase">Central Denar</div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                            <FaBolt size={60} />
                        </div>
                        <div className="h-2 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="h-full w-1/2 bg-emerald-400/40 shadow-[0_0_15px_#34d399]"
                            />
                        </div>
                    </motion.div>

                    {/* Monedas Flotantes */}
                    <motion.div
                        animate={{ y: [0, -25, 0], rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-4 right-8 h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-700 border border-white/20 shadow-lg flex items-center justify-center text-white/50 text-[10px] font-bold"
                    >
                        $
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, -360] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-2 left-6 h-10 w-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-600 border border-white/20 shadow-lg flex items-center justify-center text-white/50 text-[8px] font-bold"
                    >
                        $
                    </motion.div>
                </div>

                {/* Lado Derecho: Acción */}
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div>
                        <h2 className="text-3xl font-light tracking-tighter text-white/90">
                            Pago en <span className="font-bold text-white">Efectivo</span>
                        </h2>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-2">
                            Sistema de Referencia Express
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            disabled={loading}
                            className="group relative overflow-hidden bg-white px-8 py-4 rounded-2xl transition-all active:scale-95"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-4 text-black font-black text-[11px] uppercase tracking-widest">
                                {loading ? 'Cargando...' : 'Obtener Código'}
                                <FaBarcode size={18} />
                            </div>
                            <motion.div
                                whileHover={{ x: '100%' }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full transition-transform duration-500"
                            />
                        </button>

                        <div className="flex gap-4 justify-center md:justify-start opacity-20 group-hover:opacity-60 transition-opacity duration-700">
                            <div className="h-4 w-8 bg-white rounded-sm" /> {/* Simula Logo OXXO */}
                            <div className="h-4 w-8 bg-white rounded-sm" /> {/* Simula Logo 7-Eleven */}
                            <div className="h-4 w-8 bg-white rounded-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Escaneo Visual al Hover */}
            <div className="absolute inset-0 border-[1px] border-emerald-500/0 group-hover:border-emerald-500/20 rounded-[3rem] transition-all duration-700" />
        </motion.div>
    );
};

export default CashPaymentCard;