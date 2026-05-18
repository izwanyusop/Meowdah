import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", minHeight: "100vh" }}>
      {/* PWA Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "2.25rem", userSelect: "none" }}>🐱</span>
          <h1 style={{ color: "var(--color-primary)", fontSize: "1.6rem", margin: 0, letterSpacing: "-0.5px" }}>
            Meowdah<span style={{ color: "var(--color-text-main)" }}>.my</span>
          </h1>
        </div>
        
        {user ? (
          <Link href="/dashboard" style={{
            backgroundColor: "#FFF2E6",
            color: "var(--color-primary)",
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.8rem",
            fontWeight: "bold",
            border: "1px solid rgba(255, 140, 50, 0.2)",
            textDecoration: "none"
          }}>
            👤 {user.user_metadata?.full_name || user.email?.split('@')[0] || "Profil"}
          </Link>
        ) : (
          <Link href="/login" style={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.8rem",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(255, 140, 50, 0.2)",
            textDecoration: "none"
          }}>
            🔑 Log Masuk
          </Link>
        )}
      </header>


      {/* Hero Search Section */}
      <section style={{ 
        backgroundColor: "var(--color-surface)", 
        border: "1px solid var(--color-border)", 
        borderRadius: "var(--radius-lg)", 
        padding: "24px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "8px", color: "var(--color-text-main)", letterSpacing: "-0.5px" }}>
            Cari Kucing Oyen & Keperluan Si Bulus
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: "1.5" }}>
            Platform classifieds khusus kucing #1 di Malaysia. Cari baka tulen, adopsi percuma, hotel, & pasangan mating secara local!
          </p>
        </div>

        {/* Mock Search Input Group */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ 
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            <input 
              type="text" 
              placeholder="Cari BSH, Munchkin, Cat Food..." 
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
                fontSize: "0.9rem",
                color: "var(--color-text-main)",
                outline: "none"
              }}
              readOnly
            />
            <span style={{ position: "absolute", right: "16px", color: "var(--color-primary)" }}>🔍</span>
          </div>
          
          <button className="btn btn-primary" style={{ width: "100%" }}>
            🐱 Mulakan Carian
          </button>
        </div>
      </section>

      {/* Quick Categories Mock */}
      <section>
        <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--color-text-main)" }}>
          Kategori Pilihan
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {[
            { icon: "🐈", label: "Kucing" },
            { icon: "🐟", label: "Makanan" },
            { icon: "🧸", label: "Aksesori" },
            { icon: "🏥", label: "Servis" }
          ].map((cat, idx) => (
            <div key={idx} style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)"
            }}>
              <span style={{ fontSize: "1.75rem" }}>{cat.icon}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-main)" }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Ad Mockup Card */}
      <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--color-text-main)" }}>
            🔥 Iklan Pilihan (Featured)
          </h3>
          <span style={{ color: "var(--color-primary)", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}>
            Lihat Semua
          </span>
        </div>

        <div style={{
          backgroundColor: "var(--color-surface)",
          border: "2px solid var(--color-primary)", /* Amber highlight for Featured */
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Card Image Area */}
          <div style={{ 
            height: "220px", 
            backgroundColor: "#FFEAD7", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            position: "relative",
            userSelect: "none"
          }}>
            {/* Mocking a premium oyen cat photo with big emojis & premium gradient overlay */}
            <div style={{ fontSize: "5rem" }}>🐈</div>
            <div style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor: "var(--color-primary)",
              color: "white",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.7rem",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(255, 140, 50, 0.4)"
            }}>FEATURED</div>
          </div>
          
          {/* Card Info Area */}
          <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ 
                color: "var(--color-accent)", 
                fontSize: "0.75rem", 
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                🟢 Divaksin & Dimandulkan
              </span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Shah Alam, Selangor</span>
            </div>
            
            <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-text-main)" }}>
              Kucing British Shorthair (BSH) Oyen Pure Breed
            </h4>
            
            <span style={{ color: "var(--color-primary)", fontSize: "1.3rem", fontWeight: "800" }}>
              RM 1,200
            </span>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: "10px 14px", fontSize: "0.8rem" }}>
                💬 Chat Sembang
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: "10px 14px", fontSize: "0.8rem" }}>
                📞 WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Info Advice Footer */}
      <footer style={{ 
        textAlign: "center", 
        color: "var(--color-text-muted)", 
        fontSize: "0.75rem", 
        marginTop: "auto",
        padding: "24px 0 12px 0",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        <p style={{ fontWeight: "600", color: "var(--color-text-main)" }}>
          📱 Pasang Meowdah.my ke telefon bimbit anda!
        </p>
        <p>Buka pelayar Chrome/Safari, pilih **"Add to Home Screen"** untuk akses native luar talian yang terpantas.</p>
        <p style={{ marginTop: "12px", fontSize: "0.7rem" }}>© 2026 Meowdah.my. Semua hak terpelihara.</p>
      </footer>
    </main>
  );
}
