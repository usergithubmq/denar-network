import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/kf3.png';

const HomeFintech = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-white text-slate-900 font-sans">

            {/* --- SIDEBAR COMPACTO --- */}
            <aside className="w-60 bg-[#0c516e] text-white flex flex-col fixed h-full z-50 shadow-2xl">
                <div className="p-12 flex justify-center">
                    <div className="cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={Logo} alt="Logo" className="w-25 h-25 object-contain group-hover:scale-105 transition-transform" />
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-2">
                    <div className="text-[12px] font-black text-teal-100/50 uppercase tracking-[0.2em] px-4 mb-2">Menú</div>
                    {[
                        { name: 'Soluciones', link: '#soluciones' },
                        { name: 'Legales', link: '#legales' },
                        { name: 'Preguntas', link: '#faq' },
                        { name: 'Contacto', link: '#contacto' }
                    ].map((item) => (
                        <a key={item.name} href={item.link} className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-white/5 font-light transition-all text-sm">
                            <div className="w-1 h-1 bg-teal-400 rounded-full"></div>
                            <span>{item.name}</span>
                        </a>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-white text-[#0c516e] py-3 rounded-xl text-xs font-black uppercase hover:bg-teal-50 transition-all shadow-lg"
                    >
                        Ingresar
                    </button>
                    <div className="mt-4 text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] text-center">
                        CDMX • 2026
                    </div>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 ml-60">
                <section className="relative pt-12 pb-20 bg-gradient-to-br from-slate-50 to-white overflow-hidden min-h-screen flex items-center">
                    <div className="container mx-auto px-8 md:px-16 relative z-10">

                        <div className="max-w-6xl w-full">
                            {/* --- TÍTULO REFINADO (MÁS DELGADO Y LIGERO) --- */}
                            <header className="mb-8">
                                <h1 className="text-[#0c516e] text-5xl md:text-[85px] font-extralight leading-[0.95] tracking-[-0.05em] mb-6">
                                    El motor financiero <br />
                                    <span className="text-[#279a94] font-medium tracking-tight text-3xl md:text-6xl">
                                        B2B Inteligente.
                                    </span>
                                </h1>
                                <div className="w-20 h-1 bg-[#279a94]/30 rounded-full"></div>
                            </header>

                            {/* LEMA MÁS LIGERO */}
                            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl font-extralight leading-relaxed tracking-tight">
                                Una sola infraestructura para automatizar tus pagos <br className="hidden lg:block" />
                                o fondear tu crecimiento estratégico en <span className="text-[#0c516e] font-normal">Ciudad de México.</span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                                {/* ROL 1: CRÉDITO */}
                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group flex items-start gap-6 border-b-4 border-b-teal-500/10">
                                    <div className="w-16 h-16 shrink-0 bg-teal-50 text-[#279a94] rounded-2xl flex items-center justify-center text-2xl font-light italic">01</div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-light mb-2 text-[#0c516e] uppercase tracking-tighter">Busco Crédito</h3>
                                        <p className="text-slate-500 text-sm mb-6 font-light">Precalifica tu empresa en minutos y obtén liquidez inmediata.</p>
                                        <button onClick={() => navigate('/select-person-type')} className="w-full bg-[#279a94] text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#0c516e] transition-all">Prerregistro</button>
                                    </div>
                                </div>

                                {/* ROL 2: ADMINISTRACIÓN */}
                                <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl hover:shadow-indigo-500/10 transition-all group flex items-start gap-6 border-b-4 border-b-white/5">
                                    <div className="w-16 h-16 shrink-0 bg-slate-800 text-teal-400 rounded-2xl flex items-center justify-center text-2xl font-light">02</div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-light mb-2 text-white uppercase tracking-tighter">Gestión Pagos</h3>
                                        <p className="text-slate-400 text-sm mb-6 font-light">Automatiza conciliación y nómina mediante nuestra API.</p>
                                        <button onClick={() => navigate('/register-admin')} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-teal-400 transition-all">Registro de Admin</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none -z-10">
                        <div className="absolute top-0 right-[-10%] w-[70%] h-[70%] bg-teal-50/50 rounded-full blur-[120px]"></div>
                    </div>
                </section>

                <footer className="bg-white py-8 px-16 border-t border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <div className="flex gap-4">
                            {['CDMX', 'SaaS', 'Fintech'].map(tag => <span key={tag}>#{tag}</span>)}
                        </div>
                        <div className="italic font-light uppercase tracking-tighter text-slate-400">KOONFINANCE © 2026</div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default HomeFintech;