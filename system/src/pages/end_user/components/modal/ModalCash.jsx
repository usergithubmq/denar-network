import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBarcode, FaTimes, FaClock, FaSyncAlt } from "react-icons/fa";

const ModalCash = ({ data, onClose, onRefreshReference }) => {
    // Inicializamos con el monto de la data, pero permitimos strings para el control del input
    const [manualAmount, setManualAmount] = useState(data?.amount || "");

    // Si la data externa cambia (ej. al actualizar referencia), sincronizamos el estado
    useEffect(() => {
        if (data?.amount) {
            setManualAmount(data.amount);
        }
    }, [data]);

    if (!data) return null;

    const handleAmountChange = (e) => {
        const value = e.target.value;

        // Si el input está vacío, permitimos el estado vacío para evitar el error NaN
        if (value === "") {
            setManualAmount("");
            return;
        }

        const parsedValue = parseFloat(value);

        // Solo actualizamos si es un número válido
        if (!isNaN(parsedValue)) {
            setManualAmount(parsedValue);
        }
    };

    const isAmountUnchanged = parseFloat(manualAmount) === parseFloat(data.amount);

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
                    <p className="text-xs text-[#60e2ff] font-medium mb-8 tracking-widest uppercase">Referencia Personalizada</p>

                    {/* SECCIÓN DE MONTO EDITABLE */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-6 group focus-within:border-[#60e2ff]/50 transition-all">
                        <p className="text-[10px] font-black tracking-[0.3em] text-[#60e2ff] mb-3 uppercase">Monto a Depositar (MXN)</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-black opacity-50">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={manualAmount}
                                onChange={handleAmountChange}
                                className="bg-transparent text-4xl font-black w-full text-center outline-none border-b-2 border-white/10 focus:border-[#60e2ff] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-[9px] text-white/30 mt-3 italic">* El monto debe ser exacto al pagar en ventanilla</p>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 mb-6">
                        <p className="text-[10px] font-black tracking-[0.3em] text-[#60e2ff] mb-2 uppercase">Número de Referencia</p>
                        <span className="text-2xl font-mono tracking-[0.15em] text-white">
                            {data.reference}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-8 text-left">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[9px] opacity-50 uppercase mb-1 font-bold flex items-center gap-1">
                                    <FaClock size={8} /> Expira el
                                </p>
                                <p className="text-xs font-bold">
                                    {new Date(data.expiration_date).toLocaleDateString()}
                                </p>
                            </div>

                            <button
                                onClick={() => onRefreshReference(manualAmount)}
                                disabled={!manualAmount || isAmountUnchanged}
                                className="flex items-center gap-2 bg-[#60e2ff]/10 text-[#60e2ff] px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#60e2ff] hover:text-[#0a2936] transition-all disabled:opacity-20"
                            >
                                <FaSyncAlt size={10} className={manualAmount && !isAmountUnchanged ? "animate-spin-slow" : ""} /> Actualizar
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => window.print()}
                            className="py-4 rounded-2xl border border-white/10 font-black uppercase text-[10px] hover:bg-white/5 transition-all"
                        >
                            Imprimir
                        </button>
                        <button
                            disabled={!manualAmount || isAmountUnchanged}
                            onClick={() => onRefreshReference(manualAmount)}
                            className="py-4 rounded-2xl bg-[#60e2ff] text-[#0a2936] font-black uppercase text-[10px] hover:bg-white transition-all disabled:opacity-20"
                        >
                            Confirmar Monto
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ModalCash;