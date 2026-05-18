"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "breeders" | "payments">("reports");

  // Statistics
  const [stats, setStats] = useState({
    totalAds: 0,
    totalProfiles: 0,
    totalReports: 0
  });

  // Data lists
  const [reports, setReports] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  // Payment settings
  const [toyyibpaySecretKey, setToyyibpaySecretKey] = useState("");
  const [toyyibpayCategoryCode, setToyyibpayCategoryCode] = useState("");
  const [billplzApiKey, setBillplzApiKey] = useState("");
  const [billplzCollectionId, setBillplzCollectionId] = useState("");
  const [billplzXSignature, setBillplzXSignature] = useState("");
  const [activeGateway, setActiveGateway] = useState("none");
  const [savingSettings, setSavingSettings] = useState(false);

  // Authenticate Admin & Load Data
  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setCurrentUser(user);

        // Verify if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.is_admin) {
          alert("⛔ Akses dihalang. Halaman ini hanya dibenarkan untuk Administrator sahaja.");
          router.push("/dashboard");
          return;
        }

        // Fetch counts for Stats
        const { count: adsCount } = await supabase.from("ads").select("*", { count: "exact", head: true });
        const { count: profilesCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
        const { count: reportsCount } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");

        setStats({
          totalAds: adsCount || 0,
          totalProfiles: profilesCount || 0,
          totalReports: reportsCount || 0
        });

        // Fetch Reports joined with ad title & reporter username
        const { data: reportsData } = await supabase
          .from("reports")
          .select("*, ad:ads(title, seller_id), reporter:profiles(username)")
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (reportsData) setReports(reportsData);

        // Fetch Profiles for Breeder list
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (profilesData) setProfiles(profilesData);

        // Fetch Payment Settings from system_settings
        const { data: settings } = await supabase
          .from("system_settings")
          .select("*");

        if (settings) {
          const tpSec = settings.find(s => s.key === "toyyibpay_secret_key")?.value || "";
          const tpCat = settings.find(s => s.key === "toyyibpay_category_code")?.value || "";
          const bpApi = settings.find(s => s.key === "billplz_api_key")?.value || "";
          const bpCol = settings.find(s => s.key === "billplz_collection_id")?.value || "";
          const bpSig = settings.find(s => s.key === "billplz_x_signature")?.value || "";
          const gate = settings.find(s => s.key === "active_gateway")?.value || "none";

          setToyyibpaySecretKey(tpSec);
          setToyyibpayCategoryCode(tpCat);
          setBillplzApiKey(bpApi);
          setBillplzCollectionId(bpCol);
          setBillplzXSignature(bpSig);
          setActiveGateway(gate);
        }

      } catch (err) {
        console.error("Ralat memuatkan portal pentadbiran:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  // Moderation Actions
  const handleDismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: "dismissed", resolved_at: new Date().toISOString() })
        .eq("id", reportId);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== reportId));
      setStats(prev => ({ ...prev, totalReports: prev.totalReports - 1 }));
      alert("✅ Laporan ditolak. Iklan dikekalkan.");
    } catch (err) {
      console.error(err);
      alert("Gagal menolak laporan.");
    }
  };

  const handleDeleteReportedAd = async (reportId: string, adId: string) => {
    if (!confirm("Adakah anda pasti mahu memadam iklan yang diadukan ini dari pelantar?")) return;
    try {
      // Delete the ad (triggers cascade delete on reports and other constraints)
      const { error: adError } = await supabase
        .from("ads")
        .delete()
        .eq("id", adId);

      if (adError) throw adError;

      // Update report status
      await supabase
        .from("reports")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", reportId);

      setReports(prev => prev.filter(r => r.id !== reportId));
      setStats(prev => ({ 
        ...prev, 
        totalReports: prev.totalReports - 1,
        totalAds: prev.totalAds - 1 
      }));
      alert("🗑️ Iklan yang dilaporkan berjaya dipadamkan secara kekal dari pangkalan data.");
    } catch (err) {
      console.error(err);
      alert("Gagal memadam iklan.");
    }
  };

  // Toggle Breeder Verification Badge
  const toggleBreederBadge = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified_breeder: !currentStatus })
        .eq("id", profileId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p => p.id === profileId ? { ...p, is_verified_breeder: !currentStatus } : p)
      );
      alert(`🎉 Lencana Verified Breeder berjaya ${!currentStatus ? "diberikan kepada" : "ditarik balik daripada"} ahli tersebut!`);
    } catch (err) {
      console.error(err);
      alert("Gagal menukar status pengesahan breeder.");
    }
  };

  // Save Gateway Credentials Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    const settingsToSave = [
      { key: "toyyibpay_secret_key", value: toyyibpaySecretKey },
      { key: "toyyibpay_category_code", value: toyyibpayCategoryCode },
      { key: "billplz_api_key", value: billplzApiKey },
      { key: "billplz_collection_id", value: billplzCollectionId },
      { key: "billplz_x_signature", value: billplzXSignature },
      { key: "active_gateway", value: activeGateway }
    ];

    try {
      for (const item of settingsToSave) {
        const { error } = await supabase
          .from("system_settings")
          .upsert({ 
            key: item.key, 
            value: item.value, 
            updated_at: new Date().toISOString() 
          });

        if (error) throw error;
      }
      alert("🎉 Kunci gerbang pembayaran (Payment Settings) berjaya disimpan dan dikunci!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal mengemas kini sistem tetapan.");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Membuka portal pentadbiran...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)", paddingBottom: "60px" }}>
      
      {/* Header */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "14px 16px",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <Link href="/dashboard" style={{ fontSize: "1.4rem", color: "var(--color-text-main)", cursor: "pointer" }}>
          ←
        </Link>
        <h2 style={{ fontSize: "1rem", color: "var(--color-primary)", fontWeight: "900", margin: 0 }}>
          👑 Papan Pentadbiran Meowdah
        </h2>
        <span style={{ width: "24px" }} />
      </header>

      {/* Main Stats Block */}
      <section style={{ 
        padding: "16px", 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "10px" 
      }}>
        <div style={{ backgroundColor: "white", padding: "12px 8px", borderRadius: "12px", border: "1px solid var(--color-border)", textAlign: "center" }}>
          <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: "bold" }}>JUMLAH IKLAN</p>
          <p style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--color-primary)", marginTop: "4px" }}>{stats.totalAds}</p>
        </div>
        <div style={{ backgroundColor: "white", padding: "12px 8px", borderRadius: "12px", border: "1px solid var(--color-border)", textAlign: "center" }}>
          <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: "bold" }}>JUMLAH AHLI</p>
          <p style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--color-text-main)", marginTop: "4px" }}>{stats.totalProfiles}</p>
        </div>
        <div style={{ backgroundColor: "#FDF2F0", padding: "12px 8px", borderRadius: "12px", border: "1px solid #FADBD8", textAlign: "center" }}>
          <p style={{ fontSize: "0.65rem", color: "var(--color-error)", fontWeight: "bold" }}>ADUAN SCAM</p>
          <p style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--color-error)", marginTop: "4px" }}>{stats.totalReports}</p>
        </div>
      </section>

      {/* Admin Tab Selectors */}
      <div style={{
        display: "flex",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0 16px"
      }}>
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            flex: 1,
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: "0.8rem",
            fontWeight: "bold",
            color: activeTab === "reports" ? "var(--color-error)" : "var(--color-text-muted)",
            borderBottom: activeTab === "reports" ? "3px solid var(--color-error)" : "3px solid transparent",
            cursor: "pointer"
          }}
        >
          🚨 Moderasi ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("breeders")}
          style={{
            flex: 1,
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: "0.8rem",
            fontWeight: "bold",
            color: activeTab === "breeders" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "breeders" ? "3px solid var(--color-primary)" : "3px solid transparent",
            cursor: "pointer"
          }}
        >
          💎 Breeder & Ahli
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          style={{
            flex: 1,
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: "0.8rem",
            fontWeight: "bold",
            color: activeTab === "payments" ? "var(--color-accent)" : "var(--color-text-muted)",
            borderBottom: activeTab === "payments" ? "3px solid var(--color-accent)" : "3px solid transparent",
            cursor: "pointer"
          }}
        >
          💳 Gateway FPX
        </button>
      </div>

      <main style={{ padding: "16px" }}>

        {/* TAB 1: SCAM REPORTS MODERATION */}
        {activeTab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--color-text-main)", fontWeight: "bold" }}>
              🚨 Laporan Aduan Scammer & KerosakanListing
            </h3>

            {reports.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: "2.5rem" }}>🌈</span>
                <h4 style={{ marginTop: "12px" }}>Tiada Laporan Pending</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "4px" }}>Pelantar Meowdah berada dalam keadaan selamat & bersih.</p>
              </div>
            ) : (
              reports.map((rep) => (
                <div 
                  key={rep.id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #FADBD8",
                    borderRadius: "12px",
                    padding: "14px",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ backgroundColor: "#FDF2F0", color: "var(--color-error)", fontSize: "0.68rem", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>
                      Sebab: {rep.reason}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
                      Oleh: @{rep.reporter?.username || "Aduan Awam"}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-text-main)", margin: "8px 0" }}>
                    Listing: {rep.ad?.title || "Iklan telah dipadam"}
                  </h4>

                  {rep.description && (
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", backgroundColor: "#FAF9F9", padding: "8px", borderRadius: "6px", margin: "6px 0" }}>
                      Butiran aduan: {rep.description}
                    </p>
                  )}

                  {/* Actions buttons */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      style={{
                        flex: 1,
                        backgroundColor: "#FFF2E6",
                        color: "var(--color-primary)",
                        border: "1px solid rgba(255,140,50,0.2)",
                        padding: "8px",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      ✓ Tolak Aduan
                    </button>
                    <button
                      onClick={() => handleDeleteReportedAd(rep.id, rep.ad_id)}
                      style={{
                        flex: 1.2,
                        backgroundColor: "var(--color-error)",
                        color: "white",
                        border: "none",
                        padding: "8px",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      🗑️ Padam & Gantung Iklan
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: BREEDER VERIFICATION PANEL */}
        {activeTab === "breeders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--color-text-main)", fontWeight: "bold" }}>
              💎 Pengesahan Badge Verified Breeder & Profil Ahli
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {profiles.map((prof) => (
                <div 
                  key={prof.id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-text-main)" }}>
                      {prof.full_name || prof.username}
                    </h4>
                    <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>
                      @{prof.username} | {prof.store_name || "Tiada Store"}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleBreederBadge(prof.id, prof.is_verified_breeder)}
                    style={{
                      backgroundColor: prof.is_verified_breeder ? "var(--color-accent)" : "#FFF2E6",
                      color: prof.is_verified_breeder ? "white" : "var(--color-primary)",
                      border: prof.is_verified_breeder ? "none" : "1px solid rgba(255, 140, 50, 0.2)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {prof.is_verified_breeder ? "✓ Verified Breeder" : "Beri Badge Verified"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC SECURE PAYMENT CONFIGURATION */}
        {activeTab === "payments" && (
          <form onSubmit={handleSaveSettings} style={{
            backgroundColor: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--color-text-main)", fontWeight: "bold" }}>
              💳 Panel Tetapan Gerbang Pembayaran Dinamik
            </h3>
            
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
              API Keys dan rahsia transaksi anda akan dikunci dan diuruskan dengan Row-Level Security (RLS) PostgreSQL untuk keselamatan tinggi.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Saluran FPX Aktif (Active Gateway) *</label>
              <select
                value={activeGateway}
                onChange={(e) => setActiveGateway(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--color-border)", backgroundColor: "white", fontSize: "0.85rem" }}
              >
                <option value="none">❌ Matikan Pembayaran Premium (Semua Percuma)</option>
                <option value="toyyibpay">ToyyibPay (Caj FPX Malaysia)</option>
                <option value="billplz">Billplz (Caj FPX Malaysia)</option>
              </select>
            </div>

            {/* ToyyibPay Block */}
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 style={{ fontSize: "0.82rem", color: "var(--color-primary)", fontWeight: "bold" }}>🔶 Integrasi ToyyibPay</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>ToyyibPay Secret Key</label>
                <input
                  type="password"
                  value={toyyibpaySecretKey}
                  onChange={(e) => setToyyibpaySecretKey(e.target.value)}
                  placeholder="Kunci Keselamatan Rahsia ToyyibPay"
                  style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "0.8rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>ToyyibPay Category Code</label>
                <input
                  type="text"
                  value={toyyibpayCategoryCode}
                  onChange={(e) => setToyyibpayCategoryCode(e.target.value)}
                  placeholder="Category Code Pembayaran FPX"
                  style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "0.8rem" }}
                />
              </div>
            </div>

            {/* Billplz Block */}
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 style={{ fontSize: "0.82rem", color: "var(--color-accent)", fontWeight: "bold" }}>🔷 Integrasi Billplz</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Billplz API Key</label>
                <input
                  type="password"
                  value={billplzApiKey}
                  onChange={(e) => setBillplzApiKey(e.target.value)}
                  placeholder="Kunci API Rahsia Billplz"
                  style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "0.8rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Billplz Collection ID</label>
                <input
                  type="text"
                  value={billplzCollectionId}
                  onChange={(e) => setBillplzCollectionId(e.target.value)}
                  placeholder="Collection ID"
                  style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "0.8rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Billplz X-Signature Key</label>
                <input
                  type="password"
                  value={billplzXSignature}
                  onChange={(e) => setBillplzXSignature(e.target.value)}
                  placeholder="Kunci X-Signature untuk keselamatan webhook callback"
                  style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "0.8rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "10px", padding: "12px" }}
              disabled={savingSettings}
            >
              {savingSettings ? "Menyimpan Gateway Keys..." : "Simpan Semua Tetapan ➔"}
            </button>
          </form>
        )}

      </main>
    </div>
  );
}
