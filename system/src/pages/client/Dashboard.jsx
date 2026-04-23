import React, { useState, useEffect } from "react";
import { FaUserPlus, FaUsers, FaFileInvoiceDollar, FaSignOutAlt, FaUser, FaBell, FaChartLine, FaSync, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import EndUserForm from "./components/EndUserForm";
import Conciliacion from "./Conciliacion";
import ProfileView from "./ProfileView";
import StpAccountsTable from "./components/StpAccountsTable";
import BalanceModal from "./components/BalanceModal";
import ClientSidebar from "./components/ClientSidebar";
import DashboardHeader from "./components/DashboardHeader";
import PasswordResetModal from "./components/PasswordResetModal";

export default function Dashboard() {
    const navigate = useNavigate();

    // ESTADOS
    const [showForceReset, setShowForceReset] = useState(false);
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

    useEffect(() => {
        // Checar si el usuario debe cambiar la contraseña
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.must_change_password) {
            setShowForceReset(true);
        }

        api.get("/client/profile").then(res => setClienteInfo(res.data));
        fetchMyEndUsers();
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

    console.log("Usuarios actuales (endUsers):", endUsers);

    // En Dashboard.jsx
    const getPaymentPlanForUser = (userId) => {
        // Buscamos el usuario en los datos que ya cargamos de la API
        const user = endUsers.find(u => (u.user_id || u.id) === userId);

        // Si lo encuentra y trae el plan que mandamos desde Laravel, lo devuelve
        return user?.payment_plan || null;
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
            {/* Insertar el Modal al inicio del renderizado */}
            <PasswordResetModal
                isOpen={showForceReset}
                onSuccess={() => setShowForceReset(false)}
            />
            {/* EL SIDEBAR COMPONENTE */}
            <ClientSidebar
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
                        <DashboardHeader
                            scrolled={scrolled}
                            clienteInfo={clienteInfo}
                            estadisticas={estadisticas}
                            refreshData={refreshData}
                            refreshing={refreshing}
                            setShowNotifications={setShowNotifications}
                            showNotifications={showNotifications}
                            notifications={notifications}
                            showForm={showForm}
                            setShowForm={setShowForm}
                        />

                        {/* Formulario con animación mejorada */}
                        {showForm && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 px-10 pt-4">
                                <EndUserForm onUserCreated={() => {
                                    setShowForm(false);
                                    fetchMyEndUsers();
                                    showToast("Pagador registrado exitosamente", "success");
                                }} />

                            </div>
                        )}

                        {/* Tabla principal */}
                        <div className="px-10 py-6">
                            <StpAccountsTable
                                clienteInfo={clienteInfo}
                                endUsers={endUsers}
                                onCopy={copyToClipboard}
                                loading={loading}
                                onRefresh={() => {

                                    fetchMyEndUsers();
                                }}
                                onViewBalance={handleViewBalance}
                                getPaymentPlanForUser={getPaymentPlanForUser}
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
            <style>{`
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