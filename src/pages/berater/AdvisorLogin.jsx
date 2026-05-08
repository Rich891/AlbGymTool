import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';

const ADVISOR_PASSWORD = 'AlbGym2024!';

export default function AdvisorLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === ADVISOR_PASSWORD) {
      localStorage.setItem('advisorAuth', 'true');
      navigate('/berater/dashboard');
    } else {
      setError('Passwort ist incorrect.');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground uppercase mb-2">Berater-Bereich</h1>
          <p className="text-muted-foreground">Authentifizierung erforderlich</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full h-14 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-lg focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Wird authentifiziert...
              </>
            ) : (
              'Login →'
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Nur für autorisierte Berater
        </p>
      </motion.div>
    </div>
  );
}