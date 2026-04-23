import React from 'react';
import { motion } from 'framer-motion';

const KoonFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-5 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Línea divisoria con gradiente sutil */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-400 to-transparent mb-8 opacity-50"></div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Copyright & Info */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                            <p className="text-[10px] font-black text-[#010e24]/40 uppercase tracking-[0.3em]">
                                © {currentYear} Denar.network
                            </p>
                        </div>
                        <p className="text-[9px] font-medium text-[#010e24]/30 uppercase tracking-widest ml-3">
                            Todos los derechos reservados. Ciudad de México.
                        </p>
                    </div>

                    {/* Enlaces Ultra-Minimalistas */}
                    <div className="flex items-center gap-8">
                        {['Términos', 'Privacidad', 'Soporte'].map((link) => (
                            <a
                                key={link}
                                href={`/${link.toLowerCase()}`}
                                className="text-[9px] font-black text-[#010e24]/40 uppercase tracking-[0.2em] hover:text-primary transition-colors duration-300"
                            >
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* Status del Sistema */}
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#60e2ff] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#60e2ff]"></span>
                        </span>
                        <span className="text-[8px] font-black text-[#010e24]/50 uppercase tracking-tighter">Pago Inmediato</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default KoonFooter;