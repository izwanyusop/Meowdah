'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Cek jika user sudah sedia login, terus redirect ke utama
    const checkUser = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          window.location.href = '/'
        } else {
          setCheckingAuth(false)
        }
      } catch (err) {
        setCheckingAuth(false)
      }
    }
    
    // Semak parameter error dari callback URL jika ada
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_failed') {
      setErrorMsg('Proses log masuk gagal. Sila cuba lagi.')
    }
    
    checkUser()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      
      if (error) throw error
    } catch (err: any) {
      setErrorMsg(err.message || 'Sambungan ke Google OAuth gagal.')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <main style={{ 
        padding: "24px", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        gap: "16px"
      }}>
        <div className="paw-spinner" style={{ fontSize: "3rem", animation: "bounce 1s infinite alternate" }}>🐱</div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: "500" }}>
          Menyemak kelayakan...
        </p>
        <style jsx global>{`
          @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-15px); }
          }
        `}</style>
      </main>
    )
  }

  return (
    <main style={{ 
      padding: "24px", 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      backgroundColor: "var(--color-bg)",
      position: "relative"
    }}>
      {/* Tombol Balik Ke Utama */}
      <header style={{ display: "flex", justifyContent: "flex-start", marginBottom: "32px" }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--color-text-main)",
          fontSize: "0.9rem",
          fontWeight: "600",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          padding: "8px 16px",
          borderRadius: "var(--radius-full)",
          boxShadow: "var(--shadow-sm)",
          transition: "var(--transition)"
        }}>
          ⬅️ Kembali ke Laman Utama
        </Link>
      </header>

      {/* Rangka Kad Utama */}
      <section style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "32px 24px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "24px"
      }}>
        {/* Cat Avatar/Illustration Group */}
        <div style={{
          position: "relative",
          width: "96px",
          height: "96px",
          backgroundColor: "#FFF2E6",
          borderRadius: "var(--radius-full)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid var(--color-primary)",
          boxShadow: "0 8px 20px rgba(255, 140, 50, 0.15)"
        }}>
          <span style={{ fontSize: "3.5rem" }}>🐈</span>
          <span style={{ 
            position: "absolute", 
            bottom: "0", 
            right: "0", 
            fontSize: "1.5rem",
            animation: "wiggle 1.5s infinite"
          }}>🔑</span>
        </div>

        {/* Tajuk & Slogan */}
        <div>
          <h2 style={{ 
            fontSize: "1.6rem", 
            color: "var(--color-text-main)", 
            letterSpacing: "-0.5px", 
            marginBottom: "8px",
            fontFamily: "var(--font-headings)" 
          }}>
            Selamat Datang Ke <span style={{ color: "var(--color-primary)" }}>Meowdah</span>
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: "1.5" }}>
            Sertai komuniti kucing terbesar di Malaysia. Satu akaun untuk post iklan, sembang live, & urus baka si bulus.
          </p>
        </div>

        {/* Senarai Kelebihan/Trust list */}
        <div style={{ 
          width: "100%", 
          backgroundColor: "var(--color-bg)", 
          borderRadius: "var(--radius-md)", 
          padding: "16px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          border: "1px dashed rgba(255, 140, 50, 0.3)"
        }}>
          {[
            { icon: "✨", text: "Post Iklan Kucing dalam 1 minit" },
            { icon: "💬", text: "Bilik Live-Chat Realtime bersepadu" },
            { icon: "🛡️", text: "Watermark Auto anti-scammer peribadi" },
            { icon: "📍", text: "Carian hyper-local berasaskan GPS" }
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-main)" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Paparan Mesej Error */}
        {errorMsg && (
          <div style={{
            width: "100%",
            backgroundColor: "#FDEDEC",
            color: "var(--color-error)",
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8rem",
            fontWeight: "500",
            border: "1px solid rgba(231, 76, 60, 0.2)"
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tombol Login Gergasi */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-primary"
          style={{ 
            width: "100%", 
            padding: "16px", 
            fontSize: "1.05rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            opacity: loading ? 0.8 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span>
              Memaut ke Google...
            </>
          ) : (
            <>
              {/* Google Colored Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Log Masuk dengan Google
            </>
          )}
        </button>

        {/* Badge Keselamatan */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          gap: "6px",
          color: "var(--color-text-muted)",
          fontSize: "0.7rem",
          fontWeight: "600"
        }}>
          <span>🔒 Google OAuth Selamat</span>
          <span>•</span>
          <span>🛡️ RLS PostgreSQL Aktif</span>
        </div>
      </section>

      {/* Info Footer */}
      <footer style={{ 
        textAlign: "center", 
        color: "var(--color-text-muted)", 
        fontSize: "0.75rem", 
        marginTop: "auto",
        padding: "24px 0 12px 0"
      }}>
        <p>© 2026 Meowdah.my. Keselamatan & Privasi diutamakan.</p>
      </footer>

      {/* Animasi Khas */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
