import React, { useState, useEffect, useCallback } from 'react';
import api from "../../../api/axios";
import { FaArrowRight, FaFilter, FaSearch, FaMoneyBillWave, FaExchangeAlt, FaBuilding } from 'react-icons/fa';

const LogsSistema = () => {
    const [logsData, setLogsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState([]); // Para el filtro de empresas
    const [filters, setFilters] = useState({
        search: "",
        cliente_id: "",
        metodo: ""
    });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/stp-logs', { params: filters });
            setLogsData(response.data.data || response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="flex flex-col h-full space-y-4">

            {/* PANEL DE FILTROS DE NEGOCIO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#051d26] p-4 rounded-2xl border border-white/5">

                {/* Buscador */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={10} />
                    <input
                        type="text"
                        placeholder="RASTREO O NOMBRE..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] text-white font-black outline-none focus:border-[#60e2ff]"
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>

                {/* Filtro Empresa */}
                <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={10} />
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] text-white font-black outline-none appearance-none"
                        onChange={(e) => setFilters({ ...filters, cliente_id: e.target.value })}
                    >
                        <option value="">TODAS LAS EMPRESAS</option>
                        {/* Aquí mapearías tus clientes reales */}
                        <option value="1">EMPRESA A (Denar B2B)</option>
                    </select>
                </div>

                {/* Filtro Método */}
                <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white font-black outline-none"
                    onChange={(e) => setFilters({ ...filters, metodo: e.target.value })}
                >
                    <option value="">TODOS LOS MÉTODOS</option>
                    <option value="STP">TRANSFERENCIA STP</option>
                    <option value="EFECTIVO">EFECTIVO (PAYCASH)</option>
                </select>

                <div className="flex items-center justify-end px-4 text-[#60e2ff] text-[9px] font-black uppercase tracking-[0.2em]">
                    Total: {logsData.length} Transacciones
                </div>
            </div>

            {/* TABLA EVOLUCIONADA */}
            <div className="flex-1 bg-[#051d26] rounded-[1rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <th className="p-5">Origen / Método</th>
                                <th className="p-5">Empresa Cliente</th>
                                <th className="p-5 text-right">Monto</th>
                                <th className="p-5 text-right text-[#60e2ff]">Tu % (Denar)</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px]">
                            {logsData.map((log, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            {log.metodo_pago === 'EFECTIVO' ?
                                                <FaMoneyBillWave className="text-emerald-400" size={14} /> :
                                                <FaExchangeAlt className="text-[#60e2ff]" size={14} />
                                            }
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold">{log.nombre_ordenante || 'PAGO EN CAJA'}</span>
                                                <span className="text-slate-500 text-[9px] font-mono">{log.clave_rastreo}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="bg-[#60e2ff]/10 text-[#60e2ff] px-3 py-1 rounded-full text-[9px] font-black uppercase">
                                            {log.cliente?.name || 'EMPRESA PRUEBA'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="text-white font-bold text-[14px]">
                                            ${parseFloat(log.monto).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        {/* Aquí calculas tu porcentaje, ej: 1% */}
                                        <div className="text-[#60e2ff] font-black">
                                            ${(parseFloat(log.monto) * 0.01).toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsSistema;