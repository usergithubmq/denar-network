import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserShield, FaArrowUp, FaWallet } from 'react-icons/fa';
import api from "../../../api/axios"; // Asegúrate de que la ruta sea correcta (3 niveles atrás)

const Estadisticas = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard-stats');
                setData(res.data);
            } catch (err) {
                console.error("Error al cargar estadísticas", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Función para formatear moneda
    const fmt = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

    const metrics = [
        { label: 'Clientes', value: data?.clientes, icon: <FaUsers size={14} />, color: 'from-[#051d26] to-[#0a3a4a]', accent: '#60e2ff', isMoney: false },
        { label: 'Usuarios Activos', value: data?.usuarios_activos, icon: <FaUserShield size={14} />, color: 'from-[#051d26] to-[#064e3b]', accent: '#10b981', isMoney: false },
        { label: 'Ingreso Mensual', value: data?.ingreso_mensual, icon: <FaArrowUp size={14} />, color: 'from-[#051d26] to-[#0a3a4a]', accent: '#60e2ff', isMoney: true },
        { label: 'Ingreso Total', value: data?.ingreso_total, icon: <FaArrowUp size={14} />, color: 'from-[#051d26] to-[#0a3a4a]', accent: '#60e2ff', isMoney: true },
        { label: 'Saldo Actual', value: data?.saldo_actual, icon: <FaWallet size={14} />, color: 'from-[#051d26] to-[#451a03]', accent: '#f59e0b', isMoney: true },
    ];

    return (
        <div className="relative z-10 flex flex-col gap-6">
            <div className="grid grid-cols-5 gap-4">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-gradient-to-br ${m.color} p-4 rounded-2xl border border-white/5 flex flex-col gap-3 relative overflow-hidden group`}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <div className="p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10" style={{ color: m.accent }}>
                                {m.icon}
                            </div>
                            <span className="text-[7px] font-black text-[#d3e0e5] uppercase tracking-widest">{m.label}</span>
                        </div>

                        <div className="relative z-10">
                            {loading ? (
                                <div className="h-6 w-2/3 bg-white/5 rounded-md animate-pulse mt-2" />
                            ) : (
                                <div className="text-white text-lg font-black tracking-tight">
                                    {m.isMoney ? fmt(m.value) : m.value}
                                </div>
                            )}
                            <div className="h-[2px] w-6 rounded-full mt-2" style={{ backgroundColor: m.accent }} />
                        </div>

                        <motion.div
                            animate={{ left: ['-100%', '200%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 w-10 h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Estadisticas;