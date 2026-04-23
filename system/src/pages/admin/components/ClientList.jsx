import React, { useEffect, useState } from "react";
import { FaBuilding, FaUser, FaCheckCircle, FaSpinner, FaSearch, FaExclamationTriangle, FaFingerprint, FaShieldAlt } from "react-icons/fa";
import api from "../../../api/axios";

export default function ClientList() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => { fetchClients(); }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/clients");
            let rawData = res.data;

            if (typeof rawData === 'string' && rawData.includes('[{"')) {
                const jsonStart = rawData.indexOf('[');
                rawData = JSON.parse(rawData.substring(jsonStart));
            }

            const finalData = Array.isArray(rawData) ? rawData : (rawData.data || []);
            setClients(finalData);
            setError(null);
        } catch (err) {
            setError("Error de comunicación con el nodo central.");
            setClients([]);
        } finally { setLoading(false); }
    };

    const filteredClients = Array.isArray(clients)
        ? clients.filter(c =>
            c.nombre_legal?.toLowerCase().includes(search.toLowerCase()) ||
            c.rfc?.toUpperCase().includes(search.toUpperCase())
        )
        : [];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-6">
            <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-teal-500/20 animate-pulse"></div>
                <FaSpinner className="animate-spin text-teal-400 text-5xl relative z-10" />
            </div>
            <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px]">Sincronizando Ledger...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">

            {/* Buscador Estilo Glassmorphism */}
            <div className="relative max-w-xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-[#0c516e] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative flex items-center bg-[#051d26]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                    <FaSearch className="ml-5 text-teal-500/50" />
                    <input
                        type="text"
                        placeholder="Filtrar base de datos por Nombre o RFC..."
                        className="w-full pl-4 pr-6 py-4 bg-transparent text-white placeholder-white outline-none text-sm font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Contenedor de Tabla High-Tech */}
            <div className="bg-[#133a46] backdrop-blur-md rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative">
                {/* Brillo decorativo superior */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#051d26]">
                                <th className="p-7 text-[11px] font-normal text-white uppercase tracking-[0.4em]">NOMBRE</th>
                                <th className="p-7 text-[11px] font-normal text-white uppercase tracking-[0.4em]">RFC</th>
                                <th className="p-7 text-[11px] font-normal text-white uppercase tracking-[0.4em]">STP (CLABE)</th>
                                <th className="p-7 text-[11px] font-normal text-white uppercase tracking-[0.4em]">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                                        <td className="p-7">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${client.tipo_cliente === 'empresa'
                                                    ? 'bg-[#2e6259] text-[#60e2ff] border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {client.tipo_cliente === 'empresa' ? <FaBuilding className="text-xl" /> : <FaUser className="text-xl" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-200 text-sm tracking-wide group-hover:text-white transition-colors">
                                                        {client.nombre_legal}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[10px] text-slate-200 font-medium lowercase tracking-wider">{client.user?.email || 'no-auth'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-7">
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[16px] font-mono font-normal text-slate-200 tracking-tighter">
                                                    {client.rfc}
                                                </p>
                                                <span className="text-[10px] w-fit px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[#60e2ff] font-bold uppercase tracking-widest">
                                                    {client.tipo_cliente === 'empresa' ? 'B2B Moral' : 'B2C Física'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-7">
                                            <div className="group/clabe relative cursor-help">
                                                <p className="font-mono text-[13px] text-slate-300 group-hover/clabe:text-[#60e2ff] transition-colors">
                                                    {client.clabe_stp
                                                        ? client.clabe_stp.replace(/^(\d{3})(\d{3})(\d{4})(\d{3})(\d{4})(\d{1})$/, '$1 $2 $3 $4 $5 $6')
                                                        : "———— ———— ———— ————"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-7 text-right">
                                            <div className="flex items-center gap-2 text-[#60e2ff] font-black text-[9px] bg-teal-500/5 border border-teal-500/20 px-4 py-2 rounded-xl w-fit group-hover:bg-teal-500/10 transition-all">
                                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div>
                                                <span className="tracking-[0.2em]">{client.estatus?.toUpperCase() || 'ACTIVO'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-32 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <FaFingerprint className="text-6xl mb-4" />
                                            <p className="text-sm font-bold uppercase tracking-[0.3em]">No se detectan registros</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}