'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG } from 'qrcode.react';

export default function RSVPPage() {
  const [name, setName] = useState('');
  const [pax, setPax] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const [confirmedPax, setConfirmedPax] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    setLoading(true);
    const token = uuidv4();

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), pax: Number(pax), qr_token: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit RSVP. Please try again.');
      }

      setQrToken(token);
      setConfirmedName(name.trim());
      setConfirmedPax(Number(pax));
      setSubmitted(true);
    } catch (err: unknown) {
  setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS / QR DISPLAY ───────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="h-1 w-full bg-gradient-to-r from-[#c8a96e] via-[#e8d5b0] to-[#c8a96e] rounded-full mb-8" />

          <div className="bg-white rounded-3xl shadow-2xl shadow-rose-100 overflow-hidden border border-rose-100">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#7d3b52] to-[#a85070] px-8 py-8 text-center">
              <div className="text-3xl mb-2">💌</div>
              <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
                You&apos;re on the List!
              </h1>
              <p className="text-rose-200 text-sm mt-1 font-light tracking-widest uppercase">
                RSVP Confirmed
              </p>
            </div>

            <div className="px-8 py-6 text-center">
              {/* Guest Summary */}
              <div className="mb-6">
                <p className="text-[#7d3b52] font-serif text-xl font-semibold">
                  {confirmedName}
                </p>
                <p className="text-[#a0897a] text-sm mt-1">
                  {confirmedPax} {confirmedPax === 1 ? 'seat' : 'seats'} reserved
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-rose-100" />
                <span className="text-rose-300 text-xs tracking-widest uppercase">Your Entry Pass</span>
                <div className="flex-1 h-px bg-rose-100" />
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-rose-200 shadow-inner">
                  <QRCodeSVG
                    value={qrToken}
                    size={200}
                    fgColor="#7d3b52"
                    bgColor="#ffffff"
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Screenshot Reminder */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
                <p className="text-amber-800 text-sm font-medium">
                  📸 Screenshot this QR code
                </p>
                <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                  Show this at the entrance on the day of the event. Each code is unique and can only be used once.
                </p>
              </div>

              {/* Token reference */}
              <p className="text-[#c8a0a0] text-[10px] font-mono break-all leading-relaxed">
                {qrToken}
              </p>
            </div>

            <div className="px-8 pb-8 text-center">
              <p className="text-[#a0897a] text-xs italic">
                We can&apos;t wait to celebrate with you! 🥂
              </p>
            </div>
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-[#c8a96e] via-[#e8d5b0] to-[#c8a96e] rounded-full mt-8" />
        </div>
      </main>
    );
  }

  // ── RSVP FORM ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="h-1 w-full bg-gradient-to-r from-[#c8a96e] via-[#e8d5b0] to-[#c8a96e] rounded-full mb-8" />

        <div className="bg-white rounded-3xl shadow-2xl shadow-rose-100 overflow-hidden border border-rose-100">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#7d3b52] to-[#a85070] px-8 py-10 text-center">
            <div className="text-4xl mb-3">🌹</div>
            <h1 className="font-serif text-3xl font-bold text-white tracking-wide leading-tight">
              Sarah & James
            </h1>
            <p className="text-rose-200 text-xs mt-2 font-light tracking-[0.3em] uppercase">
              September 21, 2025 · Nuvali, Laguna
            </p>
            <div className="mt-4 h-px w-16 bg-rose-300 mx-auto opacity-50" />
            <p className="text-rose-100 text-sm mt-4 font-light italic">
              Kindly RSVP before September 1, 2025
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-[#7d3b52] font-serif text-xl font-semibold">
                Reserve Your Seat
              </h2>
              <p className="text-[#a0897a] text-xs mt-1">
                Fill in your details below to confirm your attendance.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-2">
                <span className="text-red-500 text-sm mt-0.5">⚠️</span>
                <p className="text-red-700 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-[#7d3b52] text-xs font-semibold tracking-widest uppercase"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Santos"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border-2 border-rose-100 bg-[#fdf9f7] text-[#4a2636] placeholder-[#d4b0b8] text-sm font-medium focus:outline-none focus:border-[#7d3b52] focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Number of Seats */}
            <div className="space-y-2">
              <label className="block text-[#7d3b52] text-xs font-semibold tracking-widest uppercase">
                Number of Seats
              </label>
              <p className="text-[#b09090] text-xs">Including yourself</p>
              <div className="grid grid-cols-5 gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPax(num)}
                    disabled={loading}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all duration-150 focus:outline-none ${
                      pax === num
                        ? 'bg-[#7d3b52] border-[#7d3b52] text-white shadow-md shadow-rose-200'
                        : 'bg-white border-rose-100 text-[#7d3b52] hover:border-[#a85070] hover:bg-rose-50'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[#c8a96e] text-xs text-center mt-1">
                {pax === 1 ? 'Just you' : `You + ${pax - 1} guest${pax - 1 > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-[#7d3b52] to-[#a85070] text-white shadow-lg shadow-rose-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none transition-all duration-200 focus:outline-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Confirming RSVP...
                </span>
              ) : (
                '✉️  Confirm My Attendance'
              )}
            </button>

            <p className="text-center text-[#c8a0a0] text-xs italic">
              Your QR code entry pass will be generated upon submission.
            </p>
          </form>
        </div>

        <div className="h-1 w-full bg-gradient-to-r from-[#c8a96e] via-[#e8d5b0] to-[#c8a96e] rounded-full mt-8" />
        <p className="text-center text-[#b09a8a] text-xs mt-6 italic">
          Questions? Contact us at wedding@sarahandjames.com
        </p>
      </div>
    </main>
  );
}