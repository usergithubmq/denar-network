import React, { useState, useEffect } from 'react';
import { FaTerminal, FaPlus, FaGlobe, FaClock, FaSignal } from "react-icons/fa";

const AdminHeader = ({ view, openModal }) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        /* CAMBIO: Fondo más profundo con blur agresivo y borde neón sutil */
        <header className="h-20 px-12 flex justify-between items-center bg-[#051d26]/80 backdrop-blur-xl border-b border-[#60e2ff]/20 z-30 sticky top-0 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">

            {/* EFECTO DE LUZ AMBIENTAL DETRÁS DEL LOGO */}
            <div className="absolute top-0 left-20 w-32 h-full bg-[#60e2ff]/5 blur-[40px] pointer-events-none"></div>

            <div className="flex items-center gap-10">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        {/* TUNEADO: Brillo cian intenso al hacer hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#60e2ff] to-[#1e788d] rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>

                        {/* TUNEADO: El icono ahora tiene un look de metal cepillado */}
                        <div className="relative w-10 h-10 bg-gradient-to-br from-[#d3e0e5] to-[#a8bbc3] rounded-xl flex items-center justify-center border border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
                            <FaTerminal className="text-[#051d26] text-[12px] drop-shadow-sm" />
                        </div>
                    </div>

                    <div>
                        {/* TUNEADO: Texto con brillo (glow) */}
                        <h2 className="text-[7px] font-black tracking-[0.8em] text-[#60e2ff] uppercase mb-1 leading-none drop-shadow-[0_0_5px_rgba(96,226,255,0.5)]">Terminal_ID: 0x2026</h2>
                        <h1 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">
                            {view === 'dashboard' ? 'Métricas_Globales' :
                                view === 'list' ? 'Directorio_Nodos' : 'Gateway_Logs'}
                        </h1>
                    </div>
                </div>

                {/* TELEMETRÍA: Separadores con glow y fuentes más "tech" */}
                <div className="hidden xl:flex items-center gap-8 border-l border-[#60e2ff]/10 pl-10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#60e2ff]/60 uppercase tracking-widest mb-1">Status de Network</span>
                        <div className="flex items-center gap-2">
                            {/* TUNEADO: Icono de señal con pulso de color */}
                            <FaSignal className="text-[#60e2ff] text-[14px] drop-shadow-[0_0_8px_rgba(96,226,255,0.8)]" />
                            <span className="text-[11px] font-bold text-white font-mono">14ms_LATENCY</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#60e2ff]/60 uppercase tracking-widest mb-1">Hora Local</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-white font-mono uppercase tracking-tighter">{time}</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#60e2ff]/60 uppercase tracking-widest mb-1">Region</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-white font-mono uppercase">Zone_MX_Central</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTÓN REGISTRAR: Efecto 3D de cristal y cian neón */}
            <button
                onClick={openModal}
                className="group relative flex items-center gap-4 bg-[#60e2ff] hover:bg-[#60e2ff] px-6 py-3 rounded-2xl border-t border-white/50 transition-all duration-500 active:scale-95 overflow-hidden shadow-[0_10px_20px_rgba(96,226,255,0.2)]"
            >
                {/* Texto del botón */}
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#051d26] group-hover:text-white transition-colors duration-500">
                    Nuevo_Registro
                </span>

                {/* Icono + con rotación suave */}
                <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg bg-[#051d26]/10 group-hover:bg-[#051d26] transition-all duration-500">
                    <FaPlus className="text-[#051d26] text-[10px] group-hover:text-[#60e2ff] group-hover:rotate-180 transition-transform duration-700" />
                </div>

                {/* Overlay de fondo en hover (Efecto cortina) */}
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-[#0d3544] transition-transform duration-500 ease-out z-0" />

                {/* Reflejo de cristal superior */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40 z-20"></div>
            </button>
        </header>
    );
};

export default AdminHeader;