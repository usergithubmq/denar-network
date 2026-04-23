import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFingerprint } from 'react-icons/fa';

// Componentes locales
import CuentaClabe from './components/CuentaClabe';
import ResumenCredito from './components/ResumenCredito';
import HistorialPagos from './components/HistorialPagos';
import KoonSidebar from "./components/KoonSidebar";
import KoonFooter from "./components/KoonFooter";
import BrandCarousel from './components/BrandCarousel';
import PagoTarjetaModal from './components/modal/PagoTarjetaModal';

const Dashboard = () => {
    const navigate = useNavigate();

    // Estados
    const [loading, setLoading] = useState(true);
    const [generatingReference, setGeneratingReference] = useState(false);
    const [clienteInfo, setClienteInfo] = useState(null);
    const [activeReference, setActiveReference] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // NUEVO: Estado para saber qué plan está viendo el usuario en el carrusel
    const [currentPlanIndex, setCurrentPlanIndex] = useState(0);

    const [wallet, setWallet] = useState({
        user_name: '',
        clabe: 'Cargando...',
        saldo_en_cuenta: 0,
        planes: [],
        recent_history: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get('/api/my/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status === 'success' || response.data.status === 'empty') {
                    setWallet(response.data.data);
                    if (response.data.data.empresa) setClienteInfo(response.data.data.empresa);
                }
            } catch (error) {
                console.error("Dashboard Error:", error);
                if (error.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // Lógica para obtener los datos del plan que se está mostrando actualmente
    const planActivo = wallet.planes && wallet.planes.length > 0
        ? wallet.planes[currentPlanIndex]
        : null;

    const handleGenerateCashPayment = async () => {
        // Usamos el monto del plan activo actualmente en pantalla
        const montoTotal = planActivo ? planActivo.pago_pendiente : 0;

        if (montoTotal <= 0) return alert("No hay pagos pendientes por generar.");

        setGeneratingReference(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('/api/my/payment/cash-reference',
                { monto: montoTotal },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.status === 'success') {
                setActiveReference(response.data.data);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Error generating cash ref:", error.response?.data?.message);
        } finally {
            setGeneratingReference(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#010e24]">
            <div className="relative flex flex-col items-center gap-6">
                <div className="h-20 w-20 animate-spin rounded-full border-[3px] border-primary/10 border-t-primary shadow-[0_0_20px_rgba(88,245,209,0.2)]"></div>
                <FaFingerprint className="absolute top-7 text-primary animate-pulse" size={28} />
                <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.5em]">Cargando Sistema Denar...</p>
            </div>
        </div>
    );

    console.log("Datos de la wallet:", wallet);

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#010e24] flex overflow-x-hidden selection:bg-primary/20">
            <KoonSidebar clienteInfo={clienteInfo} />

            <main className="flex-1 ml-64 relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="mx-auto max-w-7xl px-12 pt-20 pb-24 relative z-10">

                    <header className="mb-10">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-[1px] w-20 bg-[#051a22] shadow-[0_0_20px_#60e2ff]"></div>
                                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">
                                    {clienteInfo?.nombre || 'PLATAFORMA NEONPAY'}
                                </p>
                            </div>
                        </motion.div>
                    </header>

                    <div className="grid gap-8 lg:grid-cols-12 items-start">

                        {/* COLUMNA IZQUIERDA: Carrusel de Planes */}
                        <div className="lg:col-span-5 space-y-6">
                            <ResumenCredito
                                planes={wallet.planes || []}
                                onPlanChange={(index) => setCurrentPlanIndex(index)} // Sincronizamos el índice
                                onVerHistorial={() => navigate('/historial')}
                            />

                            <HistorialPagos
                                movimientos={wallet.recent_history?.filter(h =>
                                    h.cuenta_beneficiario === (planActivo?.cuenta_beneficiario_especifica)
                                ) || []}
                            />
                        </div>

                        {/* COLUMNA DERECHA: Cuenta CLABE Dinámica */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[4rem]"></div>

                                <CuentaClabe
                                    userName={wallet.user_name}
                                    saldo={wallet.saldo_en_cuenta || 0}
                                    clabe={planActivo ? planActivo.cuenta_beneficiario_especifica : wallet.clabe}
                                    onPayCard={() => setIsModalOpen(true)}
                                    onPayCash={handleGenerateCashPayment}
                                    loadingCash={generatingReference}
                                />

                            </div>

                            <div className="backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 bg-slate-50/50 group transition-all">
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <p className="text-[9px] font-black text-[#010e24]/70 uppercase tracking-[0.3em]">Nuestros Aliados</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-primary transition-all"></div>)}
                                    </div>
                                </div>
                                <BrandCarousel />
                            </div>
                        </div> {/* Fin Columna 7 */}
                    </div> {/* Fin Grid Principal */}

                    {/* AQUÍ INSERTAS EL FOOTER */}
                    <KoonFooter />

                </div> {/* Fin Max-W-7xl */}
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <PagoTarjetaModal
                        isOpen={isModalOpen}
                        onClose={() => { setIsModalOpen(false); setActiveReference(null); }}
                        monto={planActivo ? planActivo.pago_pendiente : 0}
                        referenceData={activeReference}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;