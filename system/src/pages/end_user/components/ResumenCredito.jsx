import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCar, FaChevronLeft, FaChevronRight, FaClock, FaCheckCircle, FaExclamationTriangle, FaLayerGroup } from 'react-icons/fa';

const ResumenCredito = ({ planes, onPlanChange }) => {
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!planes || planes.length === 0) return null;

    const configEstado = {
        pendiente: { color: 'bg-primary text-[#60e2ff]', icon: <FaClock />, label: 'Pendiente' },
        pagado: { color: 'bg-teal-500 text-white', icon: <FaCheckCircle />, label: 'Al día' },
        atrasado: { color: 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]', icon: <FaExclamationTriangle />, label: 'Atrasado' },
        parcial: { color: 'bg-amber-500 text-[#010e24]', icon: <FaLayerGroup />, label: 'Abono Parcial' }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });

            // 2. CORRECCIÓN: Usar el índice calculado para notificar al padre
            const nextIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
            if (nextIndex >= 0 && nextIndex < planes.length) {
                setActiveIndex(nextIndex); // Actualizamos localmente
                if (onPlanChange) onPlanChange(nextIndex); // <--- ESTO NOTIFICA AL DASHBOARD
            }
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);

            if (index !== activeIndex) {
                setActiveIndex(index);
                if (onPlanChange) {
                    onPlanChange(index); // <--- ESTO NOTIFICA AL DASHBOARD AL DESLIZAR CON EL DEDO/MOUSE
                }
            }
        }
    };

    return (

        <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 2, y: 0 }} className="relative group w-full">

            {/* Contenedor Principal */}
            <div className="relative flex items-center">
                {/* Botón Izquierdo */}
                {planes.length > 1 && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-4 z-20 h-12 w-12 rounded-full bg-white shadow-xl border border-slate-800 flex items-center justify-center text-[#010e24] hover:bg-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                        disabled={activeIndex === 0}
                    >
                        <FaChevronLeft size={14} />
                    </button>
                )}

                {/* Carrusel */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 w-full"
                >
                    {planes.map((plan, index) => {
                        console.log("Datos del plan actual:", plan);
                        const status = configEstado[plan.estado] || configEstado.pendiente;

                        return (
                            <div key={plan.id || index} className="min-w-full snap-center px-1">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-[#1a4352] rounded-[3rem] p-7 relative overflow-hidden border border-white/5"
                                >
                                    {/* Esquina decorativa */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-10 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-3xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                                                <FaCar size={26} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Contrato</p>
                                                <p className="text-sm font-bold text-white uppercase">{plan.referencia}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[9px] font-black uppercase ${status.color}`}>
                                            {status.icon} <span>{status.label}</span>
                                        </div>
                                    </div>

                                    {/* Monto y Vencimiento */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
                                        <div>
                                            <p className="text-[9px] font-black text-[#60e2ff] uppercase tracking-[0.2em] mb-2">Monto Próximo</p>

                                            {/* BUSCAMOS AMBAS POSIBILIDADES: es_monto_libre o monto_libre */}
                                            {(plan.es_monto_libre || plan.monto_libre) ? (
                                                <div>
                                                    <p className="text-2xl font-black text-white tracking-tighter uppercase italic">
                                                        Monto Libre
                                                    </p>
                                                    <p className="text-[10px] font-bold text-teal-400/60 uppercase">Pago a tu medida</p>
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-black text-white tracking-tighter">
                                                    ${(plan.pago_pendiente || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col justify-end md:items-end text-white/50">
                                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase">
                                                <FaCalendarAlt className="text-primary" />
                                                {(plan.es_monto_libre || plan.monto_libre) ? 'Ciclo Mensual' : `Vence: ${plan.vencimiento_human}`}
                                            </div>
                                            <p className="text-[11px] mt-1 uppercase tracking-widest font-black text-white">
                                                {(plan.es_monto_libre || plan.monto_libre) ? 'Abono Opcional' : 'Pago Mensual'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Botón Derecho */}
                {planes.length > 1 && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-4 z-20 h-12 w-12 rounded-full bg-white shadow-xl border border-slate-800 flex items-center justify-center text-[#010e24] hover:bg-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                        disabled={activeIndex === planes.length - 1}
                    >
                        <FaChevronRight size={14} />
                    </button>
                )}
            </div>

            {/* CSS Global para ocultar scrollbars */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </motion.div>

    );
};

export default ResumenCredito;