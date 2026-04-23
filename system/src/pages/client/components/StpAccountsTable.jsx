import React, { useState, useMemo } from "react";
import {
    FaCopy, FaUserCircle, FaSpinner, FaSearch, FaChevronLeft, FaChevronRight,
    FaEye, FaRegCopy, FaCheckCircle, FaClock, FaExclamationTriangle,
    FaWallet, FaHistory, FaChevronDown, FaChevronUp, FaCalendarAlt,
    FaChartLine, FaPercent
} from "react-icons/fa";
import PlanDetalleEditable from "./subcomponentes/PlanDetalleEditable";

export default function StpAccountsTable({
    clienteInfo,
    endUsers,
    onCopy,
    loading,
    onViewBalance,
    getPaymentPlanForUser,
    onRefresh
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [expandedUser, setExpandedUser] = useState(null);
    const itemsPerPage = 8;
    const brandColor = clienteInfo?.primary_color || "#60e2ff";

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
            const paymentPlan = user.payment_plan;

            if (!paymentPlan) {
                return {
                    ...user,
                    tienePlan: false,
                    saldoPendiente: 0,
                    creditoTotal: 0,
                    montoPagado: 0,
                    porcentajePagado: 0,
                    estadoPago: 'sin_plan',
                    moratoria: 0,
                    montoNormal: 0,
                    totalAPagar: 0,
                    montoDisplay: 0
                };
            }

            // 1. Cálculos de dinero base
            const creditoBase = parseFloat(paymentPlan.credito || 0);
            const montoPagado = parseFloat(paymentPlan.monto_pagado_acumulado || 0);
            const moratoria = parseFloat(paymentPlan.moratoria || 0);
            const montoNormalFinal = parseFloat(paymentPlan.monto_normal_final || 0);

            // El total real que debería haber pagado a la fecha para estar al corriente
            const totalEsperadoAlDia = montoNormalFinal + moratoria;

            const totalAPagar = montoNormalFinal + moratoria;
            const creditoTotal = creditoBase + moratoria;
            const saldoPendiente = Math.max(creditoTotal - montoPagado, 0);

            const porcentajePagado = creditoBase > 0
                ? Math.min((montoPagado / creditoBase) * 100, 100)
                : 0;

            // 2. Lógica de Tiempos
            const hoy = new Date();
            const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
            const fechaVenc = paymentPlan.fecha_vencimiento ? new Date(paymentPlan.fecha_vencimiento) : null;
            const vencSinHora = fechaVenc
                ? new Date(fechaVenc.getFullYear(), fechaVenc.getMonth(), fechaVenc.getDate()).getTime()
                : null;

            // 3. DETERMINACIÓN DE ESTADO PRIORIZANDO EL PAGO REALIZADO
            let estadoPago = paymentPlan.estado || 'pendiente';
            let montoAMostrar = 0;

            // REGLA MAESTRA: Si el monto acumulado ya cubre la mensualidad + moratoria de este periodo
            const yaCubrioMensualidad = montoPagado >= totalEsperadoAlDia;

            if (saldoPendiente <= 0.9 || yaCubrioMensualidad) {
                estadoPago = 'pagado';
                montoAMostrar = 0; // Ya no debe nada de este periodo
            } else if (vencSinHora && hoySinHora > vencSinHora) {
                // CASO VENCIDO: No ha cubierto el monto y ya se pasó la fecha
                estadoPago = 'vencido';
                // Mostramos solo lo que le falta para cubrir este periodo
                montoAMostrar = totalEsperadoAlDia - montoPagado;
            } else if (vencSinHora && hoySinHora === vencSinHora) {
                // CASO HOY: Es el día del cobro
                estadoPago = 'pendiente';
                montoAMostrar = totalEsperadoAlDia - montoPagado;
            } else {
                // CASO FUTURO
                estadoPago = montoPagado > 0 ? 'parcial' : 'pendiente';
                montoAMostrar = 0;
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

                // --- DATOS PARA LA TABLA Y BADGES ---
                montoDisplay: montoAMostrar,
                totalAPagar,
                moratoria,
                montoNormalFinal,

                // Sincronización con nombres de DB
                pagos_realizados: paymentPlan.pagos_realizados || 0,
                plazo_credito_meses: paymentPlan.plazo_credito_meses || 0,

                proximoPago: montoNormalFinal,
                fechaVencimiento: paymentPlan.fecha_vencimiento,
                montoNormal: montoNormalFinal
            };
        });
    }, [endUsers]);

    // Obtener badge según estado
    const getEstadoBadge = (user) => {
        // Extraemos lo que calculamos en el useMemo
        const { estadoPago, montoDisplay } = user;

        switch (estadoPago) {
            case 'pagado':
                return {
                    icon: <FaCheckCircle size={12} />,
                    text: 'PAGADO',
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
                    // Si hay montoDisplay (moratoria), lo muestra, si no, solo VENCIDO
                    text: montoDisplay > 0 ? `VENCIDO: ${formatMonto(montoDisplay)}` : 'VENCIDO',
                    className: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30 animate-pulse'
                };
            case 'sin_plan':
                return {
                    icon: <FaClock size={12} />,
                    text: 'SIN PLAN',
                    className: 'bg-gradient-to-r from-slate-500 to-gray-600 text-white'
                };
            default:
                // Lógica para PENDIENTE: Si hoy es la fecha, muestra "PAGAR HOY"
                const textoDefault = montoDisplay > 0 ? `PAGAR HOY: ${formatMonto(montoDisplay)}` : 'PENDIENTE';
                return {
                    icon: <FaClock size={12} />,
                    text: textoDefault,
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

                {/* Tarjeta 1: Total Crédito */}
                <div className="bg-gradient-to-r from-[#051d26] to-[#04364b] rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-xs font-normal uppercase tracking-wider opacity-70">Total Crédito</p>
                            <p className="text-white text-2xl font-normal mt-1">{formatMonto(resumen.totalCredito)}</p>
                        </div>
                        {/* ÍCONO DINÁMICO */}
                        <FaWallet style={{ color: brandColor }} className="text-3xl opacity-80" />
                    </div>
                </div>

                {/* Tarjeta 2: Total Pagado */}
                <div className="bg-gradient-to-r from-[#051d26] to-[#04364b] rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-xs font-normal uppercase tracking-wider opacity-70">Total Pagado</p>
                            <p className="text-white text-2xl font-normal mt-1">{formatMonto(resumen.totalPagado)}</p>
                        </div>
                        {/* ÍCONO DINÁMICO */}
                        <FaCheckCircle style={{ color: brandColor }} className="text-3xl opacity-80" />
                    </div>
                </div>

                {/* Tarjeta 3: Saldo Pendiente */}
                <div className="bg-gradient-to-r from-[#051d26] to-[#04364b] rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-xs font-normal uppercase tracking-wider opacity-70">Saldo Pendiente</p>
                            <p className="text-white text-2xl font-normal mt-1">{formatMonto(resumen.totalPendiente)}</p>
                        </div>
                        {/* ÍCONO DINÁMICO */}
                        <FaExclamationTriangle style={{ color: brandColor }} className="text-3xl opacity-80" />
                    </div>
                </div>

                {/* Tarjeta 4: Progreso */}
                <div className="bg-gradient-to-r from-[#051d26] to-[#04364b] rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-xs font-normal uppercase tracking-wider opacity-70">Progreso</p>
                            <p className="text-white text-2xl font-normal mt-1">
                                {resumen.totalCredito > 0
                                    ? `${Math.round((resumen.totalPagado / resumen.totalCredito) * 100)}%`
                                    : '0%'}
                            </p>
                        </div>
                        {/* ÍCONO DINÁMICO */}
                        <FaPercent style={{ color: brandColor }} className="text-3xl opacity-80" />
                    </div>
                </div>
            </div>

            {/* --- BUSCADOR Y FILTROS --- */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaSearch className="text-slate-500 text-sm group-focus-within:text-teal-500 transition-all duration-300" />
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
                    className="px-4 py-3 text-[#98a5aa] bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-teal-500 transition-all duration-300 cursor-pointer"
                >
                    <option value="todos"> Todos ({filteredUsers.length})</option>
                    <option value="pagado"> Pagaado ({resumen.clientesPagados})</option>
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
                            <tr
                                className="transition-all duration-1000"
                                style={{
                                    // 1. Animación más lenta (8s para un barrido cinematográfico)
                                    animation: 'shimmer-slow 8s linear infinite',
                                    // 2. Gradiente con el color del cliente al 80% de opacidad (cc) 
                                    // 3. El centro (50%) ahora es más ancho para que el color resalte
                                    backgroundImage: `linear-gradient(90deg, #051a22 0%, ${brandColor}cc -10%, #062b3b 20%)`,
                                    backgroundSize: '200% 100%',
                                    borderBottom: `5px solid ${brandColor}66` // Borde más presente
                                }}
                            >
                                <th className="py-6 px-6 text-[10px] font-black text-white uppercase tracking-[0.3em] mix-blend-difference drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.9)]">
                                    Cliente
                                </th>
                                <th className="py-6 px-6 text-[10px] font-black text-white uppercase tracking-[0.3em] text-right">Movimientos</th>
                                <th className="py-6 px-6 text-[10px] font-black text-white uppercase tracking-[0.3em] text-right">Restante</th>
                                <th className="py-6 px-6 text-[10px] font-black text-white uppercase tracking-[0.3em] text-center">Estado</th>
                                <th className="py-6 px-3 text-[10px] font-black text-white uppercase tracking-[0.3em] text-center">Contrato</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-[#d3e0e5]">
                            {currentItems.length > 0 ? (
                                currentItems.map((user, idx) => {
                                    const estadoBadge = getEstadoBadge(user);
                                    const rowKey = user.id;

                                    return (
                                        <React.Fragment key={rowKey}>
                                            <tr
                                                className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-teal-50/30 cursor-pointer"
                                                onMouseEnter={() => setHoveredRow(rowKey)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                style={{
                                                    animation: `slideIn 0.3s ease-out ${idx * 0.05}s backwards`
                                                }}
                                                onClick={() => setExpandedUser(expandedUser === rowKey ? null : rowKey)}
                                            >
                                                <td className="py-2 px-7">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <FaUserCircle className="text-slate-400 text-2xl group-hover:text-teal-500 transition-all duration-300 group-hover:scale-110" />
                                                            {hoveredRow === rowKey && (
                                                                <div className="absolute inset-0 bg-teal-500 rounded-full blur-md opacity-20 animate-pulse"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-teal-600 transition-colors">
                                                                {user.name}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 group/clabe">
                                                                <p className="text-[13px] font-mono font-black text-slate-500 tracking-tighter bg-white/50 px-1.5 py-0.5 rounded border border-slate-200 group-hover/clabe:border-teal-200 group-hover/clabe:bg-teal-50 group-hover/clabe:text-teal-700 transition-all">
                                                                    {formatClabe(user.clabe_stp)}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopy(user.clabe_stp, rowKey);
                                                                    }}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 transition-all duration-300 hover:bg-teal-100 active:scale-90"
                                                                >
                                                                    {copiedId === rowKey ? <FaCheckCircle size={12} className="text-teal-600" /> : <FaCopy size={12} />}
                                                                </button>
                                                                {user.tienePlan && (
                                                                    <button className="p-1.5 text-teal-600">
                                                                        {expandedUser === rowKey ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-[12px] text-slate-500 leading-tight font-medium opacity-70">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-2 px-7">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-slate-600">Valor Factura:</span>
                                                            <span className="font-bold text-slate-800">{formatMonto(user.creditoTotal)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-slate-600">Monto acumulado:</span>
                                                            <span className="font-bold text-[#279a94]">{formatMonto(user.montoPagado)}</span>
                                                        </div>
                                                        {user.tienePlan && (
                                                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden shadow-inner">
                                                                <div
                                                                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-700"
                                                                    style={{ width: `${user.porcentajePagado}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-2 px-6 text-right">
                                                    <p className={`font-black text-[13px] ${user.saldoPendiente > 0 ? 'text-red-600' : 'text-[#279a94]'}`}>
                                                        {formatMonto(user.saldoPendiente)}
                                                    </p>

                                                    {user.tienePlan && (
                                                        <p className="text-[10px] text-slate-400 mt-1">
                                                            {/* Usamos los nombres que vienen de la base de datos que acabamos de corregir */}
                                                            {user.pagos_realizados ?? 0} de {user.plazo_credito_meses ?? 0} pagos
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="py-2 px-4 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        {/* El Badge dinámico (PAGAR HOY / PENDIENTE / VENCIDO) */}
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-md ${estadoBadge.className}`}>
                                                            {estadoBadge.icon}
                                                            {estadoBadge.text}
                                                        </span>

                                                        {/* --- CORRECCIÓN: Solo mostrar el monto si montoDisplay > 0 --- */}
                                                        {user.montoDisplay > 0 && user.estadoPago !== 'pagado' && (
                                                            <div className="flex flex-col items-center animate-fadeIn">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    Total a pagar:
                                                                </p>
                                                                <p className="text-[12px] font-black text-slate-700 leading-none">
                                                                    {formatMonto(user.montoDisplay)}
                                                                </p>
                                                                {user.moratoria > 0 && user.estadoPago === 'vencido' && (
                                                                    <span className="text-[8px] text-red-500 font-bold">
                                                                        (Incluye moratoria)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-2 px-3 text-center">
                                                    <span className="inline-block bg-white/80 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
                                                        {user.referencia_interna || 'S/R'}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Fila Expandida */}
                                            {expandedUser === rowKey && user.tienePlan && (
                                                <tr className="bg-slate-50/50 backdrop-blur-md">
                                                    <td colSpan="6" className="py-8 px-10 border-x-4 border-teal-500/30">
                                                        <PlanDetalleEditable
                                                            user={user}
                                                            onUpdate={onRefresh}
                                                        />
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