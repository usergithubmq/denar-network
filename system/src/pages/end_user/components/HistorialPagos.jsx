import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowDown, FaCalendarDay, FaReceipt } from 'react-icons/fa';

const HistorialPagos = ({ movimientos = [] }) => {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-[#010e24]/70 uppercase tracking-[0.3em]">Actividad Reciente</p>
                    <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full">
                        {movimientos.length} Pagos
                    </span>
                </div>
                <FaReceipt className="text-slate-300" size={14} />
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {movimientos.length > 0 ? (
                        movimientos.map((pago, index) => (
                            <motion.div
                                key={pago.id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-50 hover:border-primary/20 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-primary group-hover:text-[#010e24] transition-colors">
                                        <FaArrowDown size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[#010e24] uppercase tracking-tight">
                                            {pago.concepto || 'Abono Recibido'}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                                            <FaCalendarDay size={8} />
                                            {pago.fecha_human || 'Reciente'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#010e24]">
                                        +${(pago.monto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[8px] font-black text-teal-500 uppercase tracking-tighter">Confirmado</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-10 text-center">
                            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-dashed border-slate-200">
                                <FaReceipt className="text-slate-200" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin movimientos registrados</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HistorialPagos;