import React, { useState, useEffect } from "react";
import { FaUserPlus, FaUsers, FaFileInvoiceDollar, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import EndUserForm from "./components/EndUserForm";
import Conciliacion from "./Conciliacion";
import ProfileView from "./ProfileView";
import StpAccountsTable from "./components/StpAccountsTable";
import BalanceModal from "./components/BalanceModal";

export default function Dashboard() {
    const navigate = useNavigate();

    // ESTADOS
    const [vistaActual, setVistaActual] = useState('pagadores'); // <--- Esto faltaba
    const [showForm, setShowForm] = useState(false);
    const [endUsers, setEndUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [clienteInfo, setClienteInfo] = useState(null);

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
        } catch (err) {
            console.error("Error al cargar pagadores", err);
            setEndUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.get("/client/profile").then(res => setClienteInfo(res.data));
        fetchMyEndUsers();
    }, []);

    useEffect(() => {
        fetchMyEndUsers();
    }, []);

    const handleViewBalance = (user) => {
        setSelectedUser(user);
        setShowBalanceModal(true);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("¡Copiado al portapapeles!");
    };
    console.log("URL de la imagen:", clienteInfo?.logo_url ? `http://localhost:8000/storage/${clienteInfo.logo_url}` : "No hay logo");
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* SIDEBAR CLIENTE */}
            <aside className="w-72 bg-[#0c516e] p-6 hidden md:flex flex-col text-white shadow-2xl fixed h-full">
                {clienteInfo?.logo_url ? (
                    <img
                        // Agregamos un timestamp al final para evitar caché del navegador
                        src={`http://localhost:8000/storage/${clienteInfo.logo_url}?${Date.now()}`}
                        alt="Logo Empresa"
                        className="h-25 w-auto mb-10 object-contain"
                        onError={(e) => {
                            console.error("Error cargando imagen:", e.target.src);
                            e.target.style.display = 'none'; // Oculta si falla
                        }}
                    />
                ) : (
                    <h1 className="text-3xl font-black mb-10 tracking-tight text-teal-400 uppercase tracking-tighter">
                        KOON<span className="text-white"> SYSTEM</span>
                    </h1>
                )}

                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => setVistaActual('profile')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-sm font-medium ${vistaActual === 'profile'
                            ? 'bg-white/10 border-l-4 border-teal-400 font-bold shadow-lg text-white'
                            : 'hover:bg-white/5 text-white'
                            }`}
                    >
                        <FaUser className={vistaActual === 'profile' ? 'text-teal-400' : ''} />
                        Mi Perfil
                    </button>
                    <button
                        onClick={() => setVistaActual('pagadores')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-sm font-medium ${vistaActual === 'pagadores'
                            ? 'bg-white/10 border-l-4 border-teal-400 font-bold shadow-lg text-white'
                            : 'hover:bg-white/5 text-white'
                            }`}
                    >
                        <FaUsers className={vistaActual === 'pagadores' ? 'text-teal-400' : ''} />
                        Mis Clientes
                    </button>

                    <button
                        onClick={() => setVistaActual('reporte')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-sm font-medium ${vistaActual === 'reporte'
                            ? 'bg-white/10 border-l-4 border-teal-400 font-bold shadow-lg text-white'
                            : 'hover:bg-white/5 text-white'
                            }`}
                    >
                        <FaFileInvoiceDollar className={vistaActual === 'reporte' ? 'text-teal-400' : ''} />
                        Reporte de Pagos
                    </button>
                </nav>
                <button onClick={() => { localStorage.clear(); navigate("/login"); }}
                    className="flex items-center gap-3 p-3 text-red-300 hover:text-white transition-colors text-xs font-bold border-t border-white/10 pt-6 uppercase tracking-widest">
                    <FaSignOutAlt /> SALIR
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-72">
                {vistaActual === 'pagadores' ? (
                    <>
                        <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-6 py-4 bg-[#064760] backdrop-blur-md border-[#a8c6d4] shadow-sm mb-6">
                            <div className="flex flex-col gap-0.5">
                                {/* Título y descripción unidos */}
                                <div className="flex items-baseline">
                                    <span className="text-[24px] text-[#fff] font-light hidden md:block">Gestión de cuentas referenciadas</span>
                                </div>

                                {/* Etiqueta compacta */}
                                {clienteInfo?.nombre_comercial && (
                                    <div className="flex items-center gap-1.5 text-[12px] font-normal text-teal-100 uppercase tracking-[0.1em]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                                        {clienteInfo.nombre_comercial}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={`group px-6 py-2.5 rounded-xl font-black text-[11px] flex items-center gap-2 transition-all shadow-md active:scale-95 ${showForm
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-[#126588] text-white hover:bg-[#0a435c]'
                                    }`}
                            >
                                {showForm ? (
                                    <>CANCELAR</>
                                ) : (
                                    <>
                                        <FaUserPlus className="group-hover:scale-110 transition-transform" />
                                        NUEVO REGISTRO
                                    </>
                                )}
                            </button>
                        </header>
                        {showForm && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 px-10">
                                <EndUserForm onUserCreated={() => {
                                    setShowForm(false);
                                    fetchMyEndUsers();
                                }} />
                            </div>
                        )}

                        <div className="px-10">
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
                    <ProfileView clienteInfo={clienteInfo} onUpdate={() => {/* recarga tus datos */ }} />
                ) : (
                    <Conciliacion />
                )}
            </main>

            <BalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                user={selectedUser}
            />
        </div>
    );
}