import React, { useState, useEffect } from "react";
import { FaUserPlus, FaUsers, FaFileInvoiceDollar, FaSignOutAlt, FaUser, FaBell, FaChartLine, FaSync, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import EndUserForm from "./components/EndUserForm";
import Conciliacion from "./Conciliacion";
import ProfileView from "./ProfileView";
import StpAccountsTable from "./components/StpAccountsTable";
import BalanceModal from "./components/BalanceModal";
import KoonSidebar from "./components/KoonSidebar";

export default function Dashboard() {
    const navigate = useNavigate();

    // ESTADOS
    const [vistaActual, setVistaActual] = useState('pagadores');
    const [showForm, setShowForm] = useState(false);
    const [endUsers, setEndUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [clienteInfo, setClienteInfo] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [scrolled, setScrolled] = useState(false);

    // Detectar scroll para efectos en el header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchMyEndUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/client/end-users");
            let rawResponse = res.data;

            if (typeof rawResponse === 'string' && rawResponse.includes('{"empresa"')) {
                try {
                    const jsonStart = rawResponse.indexOf('{');
                    rawResponse = JSON.parse(rawResponse.substring(jsonStart));
                } catch (e) {
                    console.error("Error parseando JSON sucio", e);
                }
            }

            const finalArray = (rawResponse && Array.isArray(rawResponse.data))
                ? rawResponse.data
                : [];

            setEndUsers(finalArray);

            // Generar notificaciones basadas en datos
            const pendientes = finalArray.filter(user => {
                // Aquí puedes agregar lógica para detectar pagos pendientes
                return user.saldo_pendiente > 0;
            });

            if (pendientes.length > 0) {
                setNotifications([
                    {
                        id: 1,
                        type: 'warning',
                        message: `${pendientes.length} cliente(s) con saldo pendiente`,
                        timestamp: new Date()
                    }
                ]);
            }
        } catch (err) {
            console.error("Error al cargar pagadores", err);
            setEndUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await fetchMyEndUsers();
        setTimeout(() => setRefreshing(false), 500);
    };

    useEffect(() => {
        api.get("/client/profile").then(res => setClienteInfo(res.data));
        fetchMyEndUsers();
    }, []);

    const handleViewBalance = (user) => {
        setSelectedUser(user);
        setShowBalanceModal(true);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Toast notification en lugar de alert
        showToast("¡CLABE copiada al portapapeles!", "success");
    };

    const showToast = (message, type = "success") => {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium animate-slide-up ${type === 'success' ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (err) {
            console.error("Error al avisar al servidor del logout", err);
        } finally {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
        }
    };

    const getLogoUrl = (path) => {
        if (!path) return null;
        if (window.location.hostname === 'localhost') {
            return `http://localhost:8000/storage/${path}`;
        }
        return `/storage/${path}`;
    };

    // Obtener estadísticas rápidas
    const getEstadisticas = () => {
        const total = endUsers.length;
        const activos = endUsers.filter(u => u.is_active !== false).length;
        const conContrato = endUsers.filter(u => u.referencia_interna).length;
        return { total, activos, conContrato };
    };

    const estadisticas = getEstadisticas();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
            {/* 1. EL SIDEBAR COMPONENTE */}
            <KoonSidebar
                vistaActual={vistaActual}
                setVistaActual={setVistaActual}
                clienteInfo={clienteInfo}
                handleLogout={handleLogout}
                getLogoUrl={getLogoUrl}
            />

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 transition-all duration-300">
                {vistaActual === 'pagadores' ? (
                    <>
                        {/* HEADER MODERNO CON EFECTOS */}
                        <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
                            ? "bg-gradient-to-r from-[#064760] via-[#054058] to-[#0b3343] border-b border-white/20"
                            : "bg-gradient-to-r from-[#051a22] via-[#054058] to-[#054058] border-b border-white/20"
                            }`}>
                            <div className="flex items-center justify-between gap-4 px-6 py-4">
                                <div className="flex flex-col gap-1.5">
                                    {/* Título y descripción unidos */}
                                    <div className="flex items-baseline gap-3">
                                        <span className={`text-[24px] font-extralight tracking-tight hidden md:block transition-all duration-300 ${scrolled
                                            ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] to-white"
                                            : "text-white"
                                            }`}>
                                            Gestión de cuentas referenciadas
                                        </span>

                                        {/* Badge de estadísticas rápidas */}
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${scrolled
                                                ? "bg-teal-50 text-teal-600 border border-teal-200"
                                                : "bg-white/10 text-white border border-white/20"
                                                }`}>
                                                <FaUsers size={10} />
                                                <span>{estadisticas.total} pagadores</span>
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${scrolled
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                : "bg-white/10 text-white border border-white/20"
                                                }`}>
                                                <FaChartLine size={10} />
                                                <span>{estadisticas.activos} activos</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Etiqueta compacta con animación moderna */}
                                    {clienteInfo?.nombre_comercial && (
                                        <div className={`flex items-center gap-2 text-[12px] font-extralight uppercase tracking-[0.15em] group transition-all duration-300 ${scrolled ? "text-teal-300" : "text-white"
                                            }`}>
                                            <div className="relative">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping absolute"></span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse relative"></span>
                                            </div>
                                            <span className="pl-3 pt-1 relative overflow-hidden">
                                                {clienteInfo.nombre_comercial}
                                                <span className={`absolute bottom-0 left-0 w-0 h-px transition-all duration-500 group-hover:w-full ${scrolled ? "bg-teal-300" : "bg-white"
                                                    }`}></span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Botón de actualizar */}
                                    <button
                                        onClick={refreshData}
                                        disabled={refreshing}
                                        className={`relative overflow-hidden p-2.5 rounded-xl transition-all duration-300 ${scrolled
                                            ? "bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                            }`}
                                        title="Actualizar datos"
                                    >
                                        <FaSync className={`${refreshing ? "animate-spin" : ""} text-sm`} />
                                    </button>

                                    {/* Botón de notificaciones */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            className={`relative p-2.5 rounded-xl transition-all duration-300 ${scrolled
                                                ? "bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white"
                                                : "bg-white/10 text-white hover:bg-white/20"
                                                }`}
                                        >
                                            <FaBell className="text-sm" />
                                            {notifications.length > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
                                                    {notifications.length}
                                                </span>
                                            )}
                                        </button>

                                        {/* Dropdown de notificaciones */}
                                        {showNotifications && (
                                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slide-down">
                                                <div className="p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notificaciones</h4>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {notifications.length > 0 ? (
                                                        notifications.map(notif => (
                                                            <div key={notif.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                                <div className="flex items-start gap-2">
                                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-teal-500"></div>
                                                                    <div>
                                                                        <p className="text-xs text-slate-700">{notif.message}</p>
                                                                        <p className="text-[10px] text-slate-400 mt-1">
                                                                            {notif.timestamp.toLocaleTimeString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-6 text-center">
                                                            <p className="text-xs text-slate-400">No hay notificaciones nuevas</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón principal */}
                                    <button
                                        onClick={() => setShowForm(!showForm)}
                                        className={`relative overflow-hidden px-6 py-2.5 rounded-xl font-black text-[11px] flex items-center gap-2 transition-all duration-300 shadow-xl active:scale-95 ${showForm
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-red-500/50'
                                            : scrolled
                                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 hover:shadow-teal-500/30'
                                                : 'bg-gradient-to-r from-[#051a22] to-[#051a22] text-white hover:from-[#279a94] hover:to-[#135c58] hover:shadow-teal-500/30'
                                            }`}
                                    >
                                        <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                                        <span className="relative z-10 flex items-center gap-2">
                                            {showForm ? (
                                                <>
                                                    <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    CANCELAR
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    NUEVO REGISTRO
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Formulario con animación mejorada */}
                        {showForm && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 px-10 pt-4">
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/20">
                                    <EndUserForm onUserCreated={() => {
                                        setShowForm(false);
                                        fetchMyEndUsers();
                                        showToast("Pagador registrado exitosamente", "success");
                                    }} />
                                </div>
                            </div>
                        )}

                        {/* Tabla principal */}
                        <div className="px-10 py-6">
                            <StpAccountsTable
                                endUsers={endUsers}
                                onCopy={copyToClipboard}
                                loading={loading}
                                onRefresh={fetchMyEndUsers}
                                onViewBalance={handleViewBalance}
                            />
                        </div>
                    </>
                ) : vistaActual === 'profile' ? (
                    <ProfileView
                        clienteInfo={clienteInfo}
                        onUpdate={() => {
                            api.get("/client/profile").then(res => setClienteInfo(res.data));
                            showToast("Perfil actualizado correctamente", "success");
                        }}
                    />
                ) : (
                    <Conciliacion />
                )}
            </main>

            <BalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                user={selectedUser}
            />

            {/* Estilos personalizados */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-down {
                    animation: slideIn 0.2s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-in {
                    animation: fadeIn 0.3s ease-out;
                }
                
                @keyframes spin-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                .animate-spin-slow {
                    animation: spin-slow 0.5s linear;
                }
            `}</style>
        </div>
    );
}