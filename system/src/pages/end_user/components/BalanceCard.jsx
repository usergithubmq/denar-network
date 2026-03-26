import React from 'react';
import { motion } from "framer-motion";
import { FaCopy, FaShieldAlt } from "react-icons/fa";

const BalanceCard = ({ saldo, clabe }) => {
    const copyClabe = () => {
        navigator.clipboard.writeText(clabe);
        // Podríamos disparar un pequeño alert o toast aquí
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#0c1421] p-8 text-white shadow-2xl border border-white/5"
        >
            {/* Glows de fondo 2030 */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[90px]" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-[90px]" />

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <FaShieldAlt className="text-teal-400 text-[10px]" />
                    </div>
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">CDMX</span>
                </div>

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Total depositado</p>
                <h2 className="text-6xl font-light tracking-tighter mt-2 mb-12">
                    <span className="text-xl align-top mr-1 opacity-40">$</span>
                    {saldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h2>

                <div className="group relative rounded-2xl bg-white/[0.03] p-6 border border-white/5 backdrop-blur-md transition-all hover:bg-white/[0.06]">
                    <p className="text-[8px] font-black uppercase text-teal-500 tracking-[0.3em] mb-3">TU CLABE PERSONAL (STP)</p>
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-base md:text-lg lg:text-xl tracking-[0.05em] md:tracking-[0.12em] text-slate-200 leading-none">
                            {clabe.length === 18 ? (
                                <>
                                    {clabe.substring(0, 3)} <span className="opacity-40"></span> {clabe.substring(3, 6)} <span className="opacity-40"></span> {clabe.substring(6, 10)} <span className="opacity-40"></span> {clabe.substring(10, 13)} <span className="opacity-40"></span> {clabe.substring(13, 17)} <span className="opacity-40"></span> {clabe.substring(17)}
                                </>
                            ) : (
                                clabe
                            )}
                        </span>
                        <button
                            onClick={copyClabe}
                            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[10px] font-black text-black hover:bg-teal-400 transition-all active:scale-95"
                        >
                            <FaCopy /> COPIAR
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BalanceCard;