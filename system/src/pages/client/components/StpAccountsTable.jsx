import React, { useState, useMemo } from "react";
import {
    FaCopy, FaUserCircle, FaSpinner, FaSearch, FaChevronLeft, FaChevronRight,
    FaEye, FaRegCopy, FaCheckCircle, FaClock, FaExclamationTriangle,
    FaWallet, FaHistory, FaChevronDown, FaChevronUp, FaCalendarAlt,
    FaChartLine, FaPercent
} from "react-icons/fa";

export default function StpAccountsTable({
    endUsers,
    onCopy,
    loading,
    onViewBalance,
    getPaymentPlanForUser // Función que recibe user_id y retorna el PaymentPlan
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [expandedUser, setExpandedUser] = useState(null);
    const itemsPerPage = 8;

    const formatClabe = (clabe) => {
        if (!clabe) return "GENERANDO...";
        return clabe.replace(/^(\d{3})(\d{3})(\d{4})(\d{3})(\d{4})(\d{1})$/, '$1 $2 $3 $4 $5 $6');
    };

    const formatMonto = (monto) => {
        if (!monto && monto !== 0) return "$0.00";
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(monto);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "No definida";
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleCopy = (clabe, userId) => {
        onCopy(clabe);
        setCopiedId(userId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Calcular datos de pago para cada endUser
    const usersWithPayments = useMemo(() => {
        return endUsers.map(user => {
            const paymentPlan = getPaymentPlanForUser ? getPaymentPlanForUser(user.user_id) : null;

            if (!paymentPlan) {
                return {
                    ...user,
                    tienePlan: false,
                    saldoPendiente: 0,
                    creditoTotal: 0,
                    montoPagado: 0,
                    porcentajePagado: 0,
                    estadoPago: 'sin_plan',
                    proximoPago: null,
                    fechaVencimiento: null,
                    numeroPago: 0,
                    totalPagos: 0,
                    montoNormal: 0,
                    moratoria: 0
                };
            }

            const creditoTotal = paymentPlan.credito || 0;
            const montoPagado = paymentPlan.monto_pagado_acumulado || 0;
            const saldoPendiente = creditoTotal - montoPagado;
            const porcentajePagado = creditoTotal > 0 ? (montoPagado / creditoTotal) * 100 : 0;

            // Determinar estado del pago
            let estadoPago = 'pendiente';
            if (saldoPendiente <= 0) {
                estadoPago = 'pagado';
            } else if (paymentPlan.estado === 'vencido' ||
                (paymentPlan.fecha_vencimiento && new Date(paymentPlan.fecha_vencimiento) < new Date())) {
                estadoPago = 'vencido';
            } else if (montoPagado > 0 && saldoPendiente > 0) {
                estadoPago = 'parcial';
            }

            return {
                ...user,
                tienePlan: true,
                paymentPlan,
                creditoTotal,
                montoPagado,
                saldoPendiente,
                porcentajePagado,
                estadoPago,
                proximoPago: paymentPlan.monto_normal || 0,
                fechaVencimiento: paymentPlan.fecha_vencimiento,
                numeroPago: paymentPlan.numero_pago || 0,
                totalPagos: paymentPlan.total_pagos || 0,
                montoNormal: paymentPlan.monto_normal || 0,
                moratoria: paymentPlan.moratoria || 0
            };
        });
    }, [endUsers, getPaymentPlanForUser]);

    // Obtener badge según estado
    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'pagado':
                return {
                    icon: <FaCheckCircle size={12} />,
                    text: 'COMPLETADO',
                    className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                };
            case 'parcial':
                return {
                    icon: <FaChartLine size={12} />,
                    text: 'EN PROCESO',
                    className: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/30'
                };
            case 'vencido':
                return {
                    icon: <FaExclamationTriangle size={12} />,
                    text: 'VENCIDO',
                    className: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30 animate-pulse'
                };
            case 'sin_plan':
                return {
                    icon: <FaClock size={12} />,
                    className: 'bg-gradient-to-r from-slate-500 to-gray-600 text-white'
                };
            default:
                return {
                    icon: <FaClock size={12} />,
                    text: 'PENDIENTE',
                    className: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-yellow-500/30'
                };
        }
    };

    // Filtrar usuarios
    const filteredUsers = usersWithPayments.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.referencia_interna && user.referencia_interna.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesEstado = filtroEstado === "todos" || user.estadoPago === filtroEstado;

        return matchesSearch && matchesEstado;
    });

    // Resumen
    const resumen = useMemo(() => {
        const totalPendiente = filteredUsers.reduce((sum, user) => sum + (user.saldoPendiente || 0), 0);
        const totalCredito = filteredUsers.reduce((sum, user) => sum + (user.creditoTotal || 0), 0);
        const totalPagado = filteredUsers.reduce((sum, user) => sum + (user.montoPagado || 0), 0);
        const clientesPagados = filteredUsers.filter(u => u.estadoPago === 'pagado').length;
        const clientesPendientes = filteredUsers.filter(u => u.estadoPago === 'pendiente' || u.estadoPago === 'vencido').length;
        const clientesParciales = filteredUsers.filter(u => u.estadoPago === 'parcial').length;

        return { totalPendiente, totalCredito, totalPagado, clientesPagados, clientesPendientes, clientesParciales };
    }, [filteredUsers]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (loading) return (
        <div className="flex flex-col justify-center items-center p-20 gap-3">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <FaSpinner className="animate-spin text-teal-500 text-4xl relative z-10" />
            </div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Cargando cuentas STP y planes de pago...</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* --- RESUMEN FINANCIERO MODERNO --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-r from-[#0c516e] to-[#04364b] rounded-2xl p-4 shadow-lg transform hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Total Crédito</p>
                            <p className="text-white text-2xl font-black mt-1">{formatMonto(resumen.totalCredito)}</p>
                        </div>
                        <FaWallet className="text-teal-200 text-3xl opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-[#279a94] to-[#107570] rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Total Pagado</p>
                            <p className="text-white text-2xl font-black mt-1">{formatMonto(resumen.totalPagado)}</p>
                        </div>
                        <FaCheckCircle className="text-green-200 text-3xl opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-[#0c516e] to-[#04364b] rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Saldo Pendiente</p>
                            <p className="text-white text-2xl font-black mt-1">{formatMonto(resumen.totalPendiente)}</p>
                        </div>
                        <FaExclamationTriangle className="text-orange-200 text-3xl opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-[#051a22] to-[#082735] rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Progreso</p>
                            <p className="text-white text-2xl font-black mt-1">
                                {resumen.totalCredito > 0
                                    ? `${Math.round((resumen.totalPagado / resumen.totalCredito) * 100)}%`
                                    : '0%'}
                            </p>
                        </div>
                        <FaPercent className="text-blue-200 text-3xl opacity-80" />
                    </div>
                </div>
            </div>

            {/* --- BUSCADOR Y FILTROS --- */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaSearch className="text-slate-400 text-sm group-focus-within:text-teal-500 transition-all duration-300" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, contrato o email..."
                        className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl shadow-lg focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 outline-none text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <select
                    value={filtroEstado}
                    onChange={(e) => {
                        setFiltroEstado(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-teal-500 transition-all duration-300 cursor-pointer"
                >
                    <option value="todos"> Todos ({filteredUsers.length})</option>
                    <option value="pagado"> Completados ({resumen.clientesPagados})</option>
                    <option value="parcial"> En Proceso ({resumen.clientesParciales})</option>
                    <option value="pendiente"> Pendientes ({resumen.clientesPendientes})</option>
                    <option value="vencido"> Vencidos</option>
                </select>
            </div>

            {/* --- TABLA PRINCIPAL CON DATOS DE PAGOS --- */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#051a22] via-[#0c516e] to-[#062b3b] bg-[length:200%_100%] animate-shimmer">
                                <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-wider">Cliente</th>
                                <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-wider text-right">Crédito / Pagado</th>
                                <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-wider text-right">Saldo Pendiente</th>
                                <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-wider text-center">Estado</th>
                                <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-wider text-center">Contrato</th>
                                <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.length > 0 ? (
                                currentItems.map((user, idx) => {
                                    const estadoBadge = getEstadoBadge(user.estadoPago);
                                    const porcentajeProgreso = user.porcentajePagado || 0;

                                    return (
                                        <React.Fragment key={user.id}>
                                            <tr
                                                className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-teal-50/30 cursor-pointer"
                                                onMouseEnter={() => setHoveredRow(user.id)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                style={{
                                                    animation: `slideIn 0.3s ease-out ${idx * 0.05}s backwards`
                                                }}
                                                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                            >
                                                <td className="py-3 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <FaUserCircle className="text-slate-400 text-2xl group-hover:text-teal-500 transition-all duration-300 group-hover:scale-110" />
                                                            {hoveredRow === user.id && (
                                                                <div className="absolute inset-0 bg-teal-500 rounded-full blur-md opacity-20 animate-pulse"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-teal-600 transition-colors">
                                                                {user.name}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 leading-tight font-medium">
                                                                {user.email || 'Sin correo electrónico'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-slate-600">Credito:</span>
                                                            <span className="font-bold text-slate-800">{formatMonto(user.creditoTotal)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-slate-600">Pagado:</span>
                                                            <span className="font-bold text-[#279a94]">{formatMonto(user.montoPagado)}</span>
                                                        </div>
                                                        {user.tienePlan && (
                                                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500"
                                                                    style={{ width: `${porcentajeProgreso}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-6 text-right">
                                                    <p className={`font-black text-lg ${user.saldoPendiente > 0 ? 'text-red-600' : 'text-[#279a94]'}`}>
                                                        {formatMonto(user.saldoPendiente)}
                                                    </p>
                                                    {user.tienePlan && user.saldoPendiente > 0 && (
                                                        <p className="text-[10px] text-slate-400 mt-1">
                                                            {user.numeroPago}/{user.totalPagos} pagos
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="py-3 px-6 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${estadoBadge.className}`}>
                                                        {estadoBadge.icon}
                                                        {estadoBadge.text}
                                                    </span>
                                                </td>


                                                <td className="py-3 px-6 text-center">
                                                    <span className="inline-block bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">
                                                        {user.referencia_interna || 'S/R'}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onViewBalance(user);
                                                            }}
                                                            className="p-2 rounded-xl text-teal-600 hover:text-white hover:bg-teal-600 transition-all duration-300"
                                                            title="Ver detalles"
                                                        >
                                                            <FaEye size={14} />
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(user.clabe_stp, user.id);
                                                            }}
                                                            className="p-2 rounded-xl text-slate-400 hover:text-teal-600 transition-all duration-300 hover:bg-teal-50 active:scale-90"
                                                            title="Copiar CLABE"
                                                        >
                                                            {copiedId === user.id ? (
                                                                <FaRegCopy size={14} className="text-teal-600" />
                                                            ) : (
                                                                <FaCopy size={14} />
                                                            )}
                                                        </button>

                                                        {user.tienePlan && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedUser(expandedUser === user.id ? null : user.id);
                                                                }}
                                                                className="p-2 rounded-xl text-slate-400 hover:text-teal-600 transition-all duration-300"
                                                            >
                                                                {expandedUser === user.id ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Detalles expandidos del PaymentPlan */}
                                            {expandedUser === user.id && user.tienePlan && (
                                                <tr className="bg-gradient-to-r from-slate-50 to-teal-50/30">
                                                    <td colSpan="7" className="py-4 px-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                                <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Detalles del Crédito</h4>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-600">Monto del crédito:</span>
                                                                        <span className="font-bold">{formatMonto(user.creditoTotal)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-600">Enganche:</span>
                                                                        <span className="font-bold">{formatMonto(user.paymentPlan?.enganche)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-600">Plazo:</span>
                                                                        <span className="font-bold">{user.paymentPlan?.plazo_credito_meses} meses</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                                <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Información de Pagos</h4>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-600">Pago mensual:</span>
                                                                        <span className="font-bold">{formatMonto(user.montoNormal)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-600">Moratoria:</span>
                                                                        <span className="font-bold text-red-600">{formatMonto(user.moratoria)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-600">Total pagos:</span>
                                                                        <span className="font-bold">{user.numeroPago} de {user.totalPagos}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                                <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Próximos Pasos</h4>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <FaCalendarAlt className="text-teal-500" />
                                                                        <span className="text-slate-600">Próximo vencimiento:</span>
                                                                        <span className="font-bold">{formatFecha(user.fechaVencimiento)}</span>
                                                                    </div>
                                                                    {user.estadoPago === 'vencido' && (
                                                                        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                                                                            <p className="text-[11px] text-red-700 font-medium">⚠️ Pago vencido - Se requiere atención inmediata</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-fade-in">
                                            <FaSearch className="text-slate-300 text-4xl" />
                                            <p className="text-slate-400 text-sm font-medium">
                                                No se encontraron resultados para "<span className="text-teal-500 font-bold">{searchTerm}</span>"
                                            </p>
                                            <button
                                                onClick={() => setSearchTerm("")}
                                                className="text-teal-500 text-xs font-bold hover:text-teal-600 transition-colors"
                                            >
                                                Limpiar búsqueda
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PAGINADOR --- */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm py-3 px-5 rounded-2xl border border-slate-100 shadow-lg">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                            Página {currentPage} de {totalPages}
                        </span>
                        <span className="text-[11px] text-slate-400">
                            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} cuentas
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 disabled:opacity-30 transition-all duration-300"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 disabled:opacity-30 transition-all duration-300"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: 0% 50%;
                    }
                    100% {
                        background-position: 100% 50%;
                    }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-shimmer {
                    background-size: 200% 100%;
                    animation: shimmer 3s ease infinite;
                }
            `}</style>
        </div>
    );
}