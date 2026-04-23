import React from 'react';
import { FaCopy, FaShieldAlt, FaCreditCard, FaBarcode } from "react-icons/fa";

const CuentaClabe = (props) => {
    // Desestructuramos dentro para mayor seguridad
    const { userName, clabe, onPayCard, onPayCash, loadingCash } = props;

    const copyClabe = () => {
        if (clabe) navigator.clipboard.writeText(clabe);
    };

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a2936] p-6 text-white border border-white/5">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 w-fit">
                            <FaShieldAlt className="text-[#60e2ff] text-[8px]" />
                            <span className="text-[8px] font-normal uppercase tracking-widest text-[#60e2ff]">Titular de Cuenta</span>
                        </div>

                        {/* PRUEBA DE FUEGO: Texto plano sin lógica compleja */}
                        <h2 className="text-[26px] font-black uppercase pl-1 text-white opacity-100 visible" style={{ display: 'block' }}>
                            {userName ? userName : "NOMBRE NO DISPONIBLE"}
                        </h2>
                    </div>
                    <span className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em] mt-1">CDMX</span>
                </div>

                <div className="group relative rounded-2xl bg-black/20 px-4 py-3 border border-white/5 backdrop-blur-md transition-all mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-[8px] font-black uppercase text-[#60e2ff] tracking-[0.3em] mb-1">CUENTA (CLABE)</p>
                            <span className="font-mono text-lg tracking-[0.12em] text-white">
                                {clabe || "000000000000000000"}
                            </span>
                        </div>
                        <button
                            onClick={copyClabe}
                            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[9px] font-black text-[#0c516e] hover:bg-teal-400 hover:text-white transition-all active:scale-95"
                        >
                            <FaCopy size={12} /> COPIAR
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={onPayCard} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-400/10 flex items-center justify-center border border-teal-400/30 text-[#60e2ff]">
                            <FaCreditCard size={23} />
                        </div>
                        <p className="text-xs font-bold text-white">Tarjeta</p>
                    </button>

                    <button onClick={onPayCash} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-white flex items-center justify-center border border-black text-black">
                            <FaBarcode size={25} />
                        </div>
                        <p className="text-xs font-bold text-white">{loadingCash ? '...' : 'Efectivo'}</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CuentaClabe;