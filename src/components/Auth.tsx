import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        setMessage('Uspešno ste se prijavili! 🎉');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage('Registracija uspešna! Proverite email za potvrdu. ✨');
      }
    } catch (err: any) {
      setError(err.message || 'Greška pri autentifikaciji');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F2' }}>
      <motion.div
        className="w-full max-w-md rounded-3xl p-8"
        style={{ backgroundColor: '#FAF7F2', boxShadow: '0 25px 50px rgba(62,47,44,0.15)' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Decoration circles */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-10"
          style={{ backgroundColor: '#D4A39B' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-12 h-12 rounded-full opacity-20"
          style={{ backgroundColor: '#E3CBB3' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-2" style={{ fontFamily: "'Great Vibes', cursive", color: '#D4A39B' }}>
              Aria
            </h1>
            <p className="text-sm tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.6 }}>
              Priča o rasti i ljubavi
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvoj@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border-0 outline-none"
                style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F5E1DA', color: '#3E2F2C' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>
                Lozinka
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border-0 outline-none"
                style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F5E1DA', color: '#3E2F2C' }}
              />
            </div>

            {/* Messages */}
            {error && (
              <motion.div
                className="p-3 rounded-xl text-sm"
                style={{ backgroundColor: '#FFE5E5', color: '#C33D3D', fontFamily: "'Inter', sans-serif" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                className="p-3 rounded-xl text-sm"
                style={{ backgroundColor: '#E5F5E5', color: '#3D8C3D', fontFamily: "'Inter', sans-serif" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {/* Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl text-white font-medium"
              style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#D4A39B' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Učitavanje...' : isLogin ? 'Prijava' : 'Registracija'}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', fontSize: '14px' }}>
              {isLogin ? 'Nemaš nalog?' : 'Već imaš nalog?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setMessage(null);
                }}
                className="font-semibold"
                style={{ color: '#D4A39B', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {isLogin ? 'Registruj se' : 'Prijavi se'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
