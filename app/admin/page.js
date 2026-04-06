'use client';

import { useState, useCallback } from 'react';

const STATUS = {
  SCANNING: 'SCANNING',
  LOADING: 'LOADING',
  GRANTED: 'GRANTED',
  DUPLICATE: 'DUPLICATE',
  INVALID: 'INVALID',
  ERROR: 'ERROR',
};

const RESULT_CONFIG = {
  [STATUS.GRANTED]: {
    bg: 'bg-emerald-950',
    border: 'border-emerald-500',
    iconBg: 'bg-emerald-500',
    icon: '✓',
    title: 'Access Granted',
    titleColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-900',
    badgeText: 'text-emerald-300',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
  },
  [STATUS.DUPLICATE]: {
    bg: 'bg-amber-950',
    border: 'border-amber-500',
    iconBg: 'bg-amber-500',
    icon: '⚠',
    title: 'Already Checked In',
    titleColor: 'text-amber-400',
    badgeBg: 'bg-amber-900',
    badgeText: 'text-amber-300',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
  },
  [STATUS.INVALID]: {
    bg: 'bg-red-950',
    border: 'border-red-500',
    iconBg: 'bg-red-500',
    icon: '✕',
    title: 'Invalid Ticket',
    titleColor: 'text-red-400',
    badgeBg: 'bg-red-900',
    badgeText: 'text-red-300',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
  },
  [STATUS.ERROR]: {
    bg: 'bg-red-950',
    border: 'border-red-500',
    iconBg: 'bg-red-500',
    icon: '!',
    title: 'Server Error',
    titleColor: 'text-red-400',
    badgeBg: 'bg-red-900',
    badgeText: 'text-red-300',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
  },
};

export default function AdminPage() {
  const [scanStatus, setScanStatus] = useState(STATUS.SCANNING);
  const [result, setResult] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'camera'

  const resetScanner = useCallback(() => {
    setResult(null);
    setManualToken('');
    setScanStatus(STATUS.SCANNING);
  }, []);

  const verifyToken = useCallback(async (token) => {
    if (!token || !token.trim()) return;

    setScanStatus(STATUS.LOADING);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_token: token.trim() }),
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        setScanStatus(STATUS.GRANTED);
        setResult({ name: data.name, pax: data.pax });
      } else if (res.status === 400 && data.status === 'DUPLICATE') {
        setScanStatus(STATUS.DUPLICATE);
        setResult({ name: data.name, pax: data.pax });
      } else if (res.status === 404) {
        setScanStatus(STATUS.INVALID);
        setResult({ message: data.error });
      } else {
        setScanStatus(STATUS.ERROR);
        setResult({ message: data.error || 'Unexpected error.' });
      }
    } catch {
      setScanStatus(STATUS.ERROR);
      setResult({ message: 'Network error. Check your connection.' });
    }
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyToken(manualToken);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    setManualToken(pasted);
    // Auto-verify on paste
    setTimeout(() => verifyToken(pasted), 100);
  };

  const config = RESULT_CONFIG[scanStatus];
  const isResult = [STATUS.GRANTED, STATUS.DUPLICATE, STATUS.INVALID, STATUS.ERROR].includes(scanStatus);
  const isLoading = scanStatus === STATUS.LOADING;

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-start px-4 py-8">

      {/* Header */}
      <div className="w-full max-w-sm mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700" />
          <span className="text-slate-500 text-xs tracking-[0.3em] uppercase font-medium">
            Admin Portal
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700" />
        </div>
        <h1 className="text-white text-xl font-bold tracking-tight mt-2">
          🎫 Guest Check-In
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Sarah & James Wedding — Sep 21, 2025
        </p>
      </div>

      <div className="w-full max-w-sm">

        {/* Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-4">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'manual'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            📋 Paste Token
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'camera'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            📷 Camera Scan
          </button>
        </div>

        {/* ── MANUAL TAB ───────────────────────────────────────── */}
        {activeTab === 'manual' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-slate-400 text-sm text-center mb-5 leading-relaxed">
              Copy the token from the guest&apos;s QR code page and paste it below.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs uppercase tracking-widest mb-2">
                  QR Token
                </label>
                <textarea
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Paste the UUID token here..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-slate-500 resize-none disabled:opacity-50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !manualToken.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-slate-600 to-slate-500 text-white hover:from-slate-500 hover:to-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  '🔍 Verify Token'
                )}
              </button>
            </form>

            {/* Result Card */}
            {isResult && config && (
              <div className={`mt-5 rounded-2xl border-2 ${config.border} ${config.bg} ${config.glow} p-5 text-center transition-all duration-300`}>
                <div className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center text-white text-3xl font-black mx-auto mb-3`}>
                  {config.icon}
                </div>

                <h2 className={`text-xl font-black ${config.titleColor}`}>
                  {config.title}
                </h2>

                {result?.name && (
                  <div className="mt-3">
                    <p className="text-white font-bold text-lg">{result.name}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 ${config.badgeBg} ${config.badgeText} rounded-full text-sm font-semibold`}>
                      <span>👥</span>
                      <span>{result.pax} {result.pax === 1 ? 'seat' : 'seats'}</span>
                    </div>
                  </div>
                )}

                {result?.message && !result?.name && (
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {result.message}
                  </p>
                )}

                <button
                  onClick={resetScanner}
                  className="mt-4 px-6 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  ↻ Verify Another
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CAMERA TAB ───────────────────────────────────────── */}
        {activeTab === 'camera' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">📷</div>
              <h3 className="text-white font-bold text-lg">Camera Scanner</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Camera scanning requires HTTPS. Deploy to Vercel to use this feature, or use the <strong className="text-slate-200">Paste Token</strong> tab for local testing.
              </p>
              <div className="mt-4 bg-slate-800 rounded-xl px-4 py-3 text-left">
                <p className="text-slate-500 text-xs font-mono">
                  💡 To enable: deploy to Vercel and access via https://
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="w-full max-w-sm mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Mode', value: activeTab === 'manual' ? 'Manual' : 'Camera', color: 'text-slate-300' },
          { label: 'Status', value: isLoading ? 'Checking' : isResult ? 'Done' : 'Ready', color: 'text-emerald-400' },
          { label: 'Auto-Reset', value: 'Manual', color: 'text-slate-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl px-3 py-3">
            <p className={`text-xs font-bold ${color}`}>{value}</p>
            <p className="text-slate-600 text-[10px] mt-0.5 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </main>
  );
}