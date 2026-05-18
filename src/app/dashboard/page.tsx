import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Halangi akses jika belum login
  if (!user) {
    redirect('/login')
  }

  // Ambil profil dari jadual profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Server Action untuk Log Keluar (Sign Out)
  async function handleSignOut() {
    'use server'
    const supabaseClient = await createClient()
    await supabaseClient.auth.signOut()
    redirect('/')
  }

  return (
    <main style={{ 
      padding: "24px", 
      display: "flex", 
      flexDirection: "column", 
      gap: "24px", 
      minHeight: "100vh",
      backgroundColor: "var(--color-bg)"
    }}>
      {/* Header Dashboard */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "2rem" }}>🐱</span>
          <h1 style={{ color: "var(--color-primary)", fontSize: "1.4rem", margin: 0, letterSpacing: "-0.5px" }}>
            Meowdah<span style={{ color: "var(--color-text-main)" }}>.my</span>
          </h1>
        </div>
        <Link href="/" style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-main)",
          padding: "8px 16px",
          borderRadius: "var(--radius-full)",
          fontSize: "0.8rem",
          fontWeight: "bold",
          textDecoration: "none",
          boxShadow: "var(--shadow-sm)"
        }}>
          🏠 Laman Utama
        </Link>
      </header>

      {/* Rangka Kad Pengguna */}
      <section style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Hiasan latar belakang oyen */}
        <div style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          fontSize: "6rem",
          opacity: 0.1,
          userSelect: "none"
        }}>🐈</div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-full)",
                border: "2px solid var(--color-primary)",
                objectFit: "cover"
              }}
            />
          ) : (
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "#FFF2E6",
              color: "var(--color-primary)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.8rem",
              fontWeight: "bold",
              border: "2px solid var(--color-primary)"
            }}>
              {profile?.full_name?.[0]?.toUpperCase() || "M"}
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--color-text-main)" }}>
                {profile?.full_name || "Pemilik Meow"}
              </h2>
              {profile?.is_verified_breeder && (
                <span style={{ 
                  backgroundColor: "var(--color-accent)", 
                  color: "white", 
                  fontSize: "0.65rem", 
                  fontWeight: "bold", 
                  padding: "2px 6px", 
                  borderRadius: "var(--radius-sm)" 
                }}>
                  ✓ Verified Breeder
                </span>
              )}
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
              @{profile?.username || "username"}
            </p>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>E-mel Berdaftar:</span>
            <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>{user.email}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Jenis Sesi:</span>
            <span style={{ fontWeight: "600", color: "var(--color-primary)" }}>🔑 Google Auth</span>
          </div>
        </div>
      </section>

      {/* Grid Menu Tindakan Pantas */}
      <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ fontSize: "1rem", color: "var(--color-text-main)" }}>
          🛠️ Pengurusan Kedai & Iklan
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { icon: "📝", label: "Post Iklan Baru", desc: "Tambah listing kucing", href: "/dashboard/post", active: true },
            { icon: "📦", label: "Urus Iklan Saya", desc: "Iklan aktif & SOLD", href: "/dashboard/my-ads", active: true },
            { icon: "💬", label: "Peti Sembang", desc: "Live chat pembeli", href: "/dashboard/chat", active: true },
            { icon: "🏪", label: "Profil Pro Niaga", desc: "Urus storefront kedai", href: "/dashboard/my-ads?tab=profile", active: true }
          ].map((item, idx) => (
            <Link key={idx} href={item.href} style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "relative",
              textDecoration: "none",
              transition: "var(--transition)",
              boxShadow: "var(--shadow-sm)"
            }} className="category-card">
              <span style={{ fontSize: "1.8rem" }}>{item.icon}</span>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-text-main)" }}>{item.label}</h4>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{item.desc}</p>
              </div>
            </Link>
          ))}

          {/* Admin Dashboard Card (Hanya untuk Admin) */}
          {profile?.is_admin && (
            <Link href="/dashboard/admin" style={{
              gridColumn: "span 2",
              backgroundColor: "#FFF2E6",
              border: "2px dashed var(--color-primary)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textDecoration: "none",
              transition: "var(--transition)"
            }}>
              <span style={{ fontSize: "2rem" }}>👑</span>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-primary)" }}>Papan Kawalan Admin</h4>
                <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Moderasi iklan, verifikasi breeder & payment settings</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Butang Keluar */}
      <form action={handleSignOut} style={{ marginTop: "auto", width: "100%" }}>
        <button 
          type="submit" 
          className="btn btn-secondary" 
          style={{ 
            width: "100%", 
            border: "2px solid var(--color-error)",
            color: "var(--color-error)",
            padding: "14px",
            backgroundColor: "white"
          }}
        >
          🚪 Log Keluar dari Akaun
        </button>
      </form>

      {/* Footer */}
      <footer style={{ 
        textAlign: "center", 
        color: "var(--color-text-muted)", 
        fontSize: "0.75rem", 
        padding: "12px 0"
      }}>
        <p>© 2026 Meowdah.my. Semua sistem berjalan lancar.</p>
      </footer>
    </main>
  )
}
