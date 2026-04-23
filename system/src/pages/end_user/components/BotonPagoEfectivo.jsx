import React from 'react';
import { motion } from "framer-motion";
import { FaBarcode, FaBolt, FaChevronRight } from "react-icons/fa";

const BotonPagoEfectivo = ({ onGenerate, loading }) => {
    return (
        <button
            onClick={onGenerate}
            disabled={loading}
            className="group relative w-full bg-[#7a7f81] rounded-[2.2rem] p-1 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl border border-white/5"
        >
            {/* Glow de fondo sutil */}
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />

            <div className="bg-gradient-to-br from-[#285567] to-[#266381] rounded-[2.1rem] p-5 flex flex-row items-center justify-between w-full relative z-10">

                <div className="flex flex-row items-center gap-4 text-left">
                    {/* Mini Arte: El Billete y Monedas en pequeño */}
                    <div className="relative h-14 w-20 flex-shrink-0 flex items-center justify-center">
                        <motion.div
                            animate={{ rotateY: [0, 15, 0], y: [0, -2, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="relative h-8 w-14 bg-emerald-500/20 border border-emerald-500/40 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center"
                        >
                            <FaBolt className="text-emerald-500/40 text-[10px]" />
                        </motion.div>

                        {/* Moneda mini */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-1 right-2 h-5 w-5 rounded-full bg-amber-500/40 border border-amber-500/60 shadow-lg flex items-center justify-center text-[8px] font-bold text-white/80"
                        >
                            $
                        </motion.div>
                    </div>

                    <div className="flex flex-col">
                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] leading-none mb-1">
                            Deposito en efecticvo
                        </p>
                        <p className="text-[#ffffff] font-bold tracking-tight text-sm">
                            {loading ? 'Generando...' : 'Obtener Referencia'}
                        </p>
                    </div>
                </div>

                {/* Acción: Icono de Barcode con animación */}
                <div className="flex-shrink-0 bg-white/5 h-11 w-11 rounded-full flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all shadow-inner relative overflow-hidden">
                    <FaBarcode className={`text-white transition-transform ${loading ? 'animate-pulse' : 'group-hover:scale-110'}`} size={18} />

                    {/* Línea de escaneo láser */}
                    <motion.div
                        animate={{ y: [-20, 20] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-[1px] bg-emerald-400/50 shadow-[0_0_8px_#34d399]"
                    />
                </div>
            </div>

            {/* Efecto de brillo al pasar el mouse */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
    );
};

export default BotonPagoEfectivo;