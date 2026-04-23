import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';

const BotonPagoTarjeta = ({ monto, clienteNombre, onOpenModal }) => {
    // 1. Eliminamos el alert estorboso
    // 2. Usamos onOpenModal que viene por props

    return (
        <button
            onClick={onOpenModal} // <-- Cambiamos esto para que abra el modal
            className="group relative w-full bg-slate-900 rounded-[2.2rem] p-1 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
        >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.1rem] p-5 flex flex-row items-center justify-between border border-white/10 w-full">

                <div className="flex flex-row items-center gap-4 text-left">
                    <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-[#0c516e] flex items-center justify-center border border-[#279a94]">
                        <CreditCard className="text-[#279a94]" size={24} />
                    </div>

                    <div className="flex flex-col">
                        <p className="text-[10px] font-black text-[#279a94] uppercase tracking-widest leading-none mb-1">
                            Ingresa tus datos
                        </p>
                        <p className="text-white font-bold tracking-tight">
                            Pagar con Tarjeta
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0 bg-white/10 h-10 w-10 rounded-full flex items-center justify-center group-hover:bg-[#279a94] transition-all shadow-inner">
                    <ArrowRight className="text-white" size={18} />
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
    );
};

export default BotonPagoTarjeta;