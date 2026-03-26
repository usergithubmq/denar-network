import React from 'react';

const PaymentStatus = ({ monto, fecha }) => (
    <div className="flex flex-col md:flex-row items-center justify-between rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
        <div className="text-center md:text-left mb-6 md:mb-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">PRÓXIMO VENCIMIENTO</p>
            <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-slate-900">${monto.toLocaleString()}</span>
                <div className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase">
                    Vence: {fecha}
                </div>
            </div>
        </div>
        <button className="w-full md:w-auto rounded-2xl bg-[#0c1421] px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-blue-700 transition-all active:scale-95">
            Pagar Ahora
        </button>
    </div>
);

export default PaymentStatus;