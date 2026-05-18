"use client";

import { useState, useEffect, useRef, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adId = searchParams.get("adId");
  const sellerId = searchParams.get("sellerId");
  const supabase = createClient();

  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false); // For mobile view toggle

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Authentication & Load Chats List
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setCurrentUser(user);

        // Fetch all chats involving the user
        const { data: chatData, error } = await supabase
          .from("chats")
          .select("*, ad:ads(title, images, price), buyer:profiles!chats_buyer_id_fkey(id, username, store_name, full_name, avatar_url), seller:profiles!chats_seller_id_fkey(id, username, store_name, full_name, avatar_url)")
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (chatData) {
          setChats(chatData);

          // Direct navigation checking (adId & sellerId)
          if (adId && sellerId && sellerId !== user.id) {
            // Check if chat room already exists
            const existing = chatData.find(
              (c) => c.ad_id === adId && 
              ((c.buyer_id === user.id && c.seller_id === sellerId) || 
               (c.buyer_id === sellerId && c.seller_id === user.id))
            );

            if (existing) {
              setActiveChat(existing);
              setShowChatWindow(true);
            } else {
              // Create new chat room
              const { data: newChat, error: createError } = await supabase
                .from("chats")
                .insert([
                  {
                    ad_id: adId,
                    buyer_id: user.id,
                    seller_id: sellerId
                  }
                ])
                .select("*, ad:ads(title, images, price), buyer:profiles!chats_buyer_id_fkey(id, username, store_name, full_name, avatar_url), seller:profiles!chats_seller_id_fkey(id, username, store_name, full_name, avatar_url)")
                .single();

              if (newChat) {
                setChats((prev) => [newChat, ...prev]);
                setActiveChat(newChat);
                setShowChatWindow(true);
              } else if (createError) {
                console.error("Gagal membina bilik sembang:", createError);
              }
            }
          }
        }
      } catch (err) {
        console.error("Ralat init chat:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [adId, sellerId]);

  // 2. Load Messages for Active Chat
  useEffect(() => {
    if (!activeChat) return;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", activeChat.id)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }

      // Mark unread messages as read
      const unread = data?.filter((m) => !m.is_read && m.sender_id !== currentUser?.id) || [];
      if (unread.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", unread.map((m) => m.id));
      }
    }

    loadMessages();

    // 3. Realtime Listener Subscription (PostgreSQL Listen/Notify)
    const channel = supabase
      .channel(`chat_messages_${activeChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${activeChat.id}`
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            // Prevent duplicate message if sender
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message Action
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat || sending) return;

    setSending(true);
    const content = newMessageText.trim();
    setNewMessageText("");

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: activeChat.id,
            sender_id: currentUser.id,
            content: content
          }
        ])
        .select()
        .single();

      if (data) {
        setMessages((prev) => [...prev, data]);
      } else if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Gagal menghantar mesej:", err);
      alert("Mesej gagal dihantar. Sila cuba lagi.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Menyambung ke talian sembang...</p>
      </div>
    );
  }

  // Get interlocutor details (The other person in the chat)
  const getInterlocutor = (chat: any) => {
    if (chat.buyer_id === currentUser.id) return chat.seller;
    return chat.buyer;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
      
      {/* Inbox View vs Chat Thread Toggle (For Premium Responsive Mobile layout) */}
      {!showChatWindow ? (
        // INBOX CHAT LIST
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
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
            <h2 style={{ fontSize: "1rem", color: "var(--color-text-main)", fontWeight: "800", margin: 0 }}>
              Peti Sembang Realtime
            </h2>
            <span style={{ width: "24px" }} />
          </header>

          <main style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
            {chats.length === 0 ? (
              <div style={{ 
                padding: "60px 20px", 
                textAlign: "center", 
                backgroundColor: "white", 
                borderRadius: "var(--radius-md)", 
                border: "1px solid var(--color-border)",
                marginTop: "20px" 
              }}>
                <span style={{ fontSize: "3rem" }}>💬</span>
                <h4 style={{ marginTop: "16px", color: "var(--color-text-main)" }}>Inbox Sembang Kosong</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Mesej daripada pembeli atau rundingan iklan kucing anda akan muncul di sini.
                </p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: "20px", padding: "10px 18px", fontSize: "0.82rem" }}>
                  Jelajah Iklan Kucing ➔
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {chats.map((chat) => {
                  const other = getInterlocutor(chat);
                  const adImg = chat.ad?.images?.[0] || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200";
                  return (
                    <div 
                      key={chat.id}
                      onClick={() => {
                        setActiveChat(chat);
                        setShowChatWindow(true);
                      }}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px",
                        display: "flex",
                        gap: "12px",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        transition: "var(--transition)",
                        borderLeft: activeChat?.id === chat.id ? "4px solid var(--color-primary)" : "1px solid var(--color-border)"
                      }}
                      className="category-card"
                    >
                      {/* Avatar */}
                      <div style={{ 
                        width: "44px", 
                        height: "44px", 
                        borderRadius: "50%", 
                        backgroundColor: "#FFF2E6", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "1px solid var(--color-border)"
                      }}>
                        {other?.avatar_url ? (
                          <img src={other.avatar_url} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "1.2rem" }}>👤</span>
                        )}
                      </div>

                      {/* Info & Ad Context snippet */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-text-main)" }}>
                            {other?.store_name || other?.full_name || other?.username || "Pengguna Meowdah"}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
                            RM {chat.ad?.price || "N/A"}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", margin: "2px 0 0 0" }}>
                          Tajuk: {chat.ad?.title || "Iklan telah dipadam"}
                        </p>
                      </div>

                      {/* Small Ad preview thumbnail */}
                      <div style={{ width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", backgroundColor: "#FFEAD7" }}>
                        <img src={adImg} alt="Ad Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      ) : (
        // ACTIVE CHAT WINDOW / MESSAGE THREAD VIEW
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <header style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "10px 16px",
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            zIndex: 10
          }}>
            <button 
              onClick={() => setShowChatWindow(false)} 
              style={{ background: "none", border: "none", fontSize: "1.4rem", color: "var(--color-primary)", cursor: "pointer", marginRight: "12px" }}
            >
              ←
            </button>
            
            {/* Interlocutor Name & Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FFF2E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {getInterlocutor(activeChat)?.avatar_url ? (
                  <img src={getInterlocutor(activeChat).avatar_url} alt="Interlocutor" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.1rem" }}>👤</span>
                )}
              </div>
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-text-main)", margin: 0 }}>
                  {getInterlocutor(activeChat)?.store_name || getInterlocutor(activeChat)?.full_name || "Pemilik Kucing"}
                </h4>
                <p style={{ fontSize: "0.65rem", color: "var(--color-accent)", fontWeight: "bold", margin: 0 }}>● Berhubung Secara Realtime</p>
              </div>
            </div>

            {/* Float Link to listing details */}
            <Link 
              href={`/ads/${activeChat.ad_id}`}
              style={{
                fontSize: "0.72rem",
                color: "var(--color-primary)",
                backgroundColor: "#FFF2E6",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontWeight: "bold",
                textDecoration: "none"
              }}
            >
              Lihat Iklan
            </Link>
          </header>

          {/* Ad context bar snippet */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            backgroundColor: "#FFF9F4",
            borderBottom: "1px solid var(--color-border)",
            fontSize: "0.75rem"
          }}>
            <span style={{ fontWeight: "700", color: "var(--color-text-main)" }}>Subjek: {activeChat.ad?.title || "Iklan Kucing"}</span>
            <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>RM {activeChat.ad?.price || "N/A"}</span>
          </div>

          {/* Messages Thread list */}
          <div style={{ 
            flexGrow: 1, 
            overflowY: "auto", 
            padding: "16px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "12px",
            backgroundColor: "#FAF5F0"
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.75rem", padding: "40px 0" }}>
                💬 Tiada mesej lagi. Hantar mesej pertama untuk memulakan rundingan!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender_id === currentUser.id;
                return (
                  <div 
                    key={m.id}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      backgroundColor: isMe ? "var(--color-primary)" : "white",
                      color: isMe ? "white" : "var(--color-text-main)",
                      padding: "10px 14px",
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}
                  >
                    <p style={{ fontSize: "0.82rem", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
                      {m.content}
                    </p>
                    <span style={{ 
                      fontSize: "0.58rem", 
                      color: isMe ? "rgba(255,255,255,0.7)" : "var(--color-text-muted)",
                      alignSelf: "flex-end",
                      marginTop: "2px" 
                    }}>
                      {new Date(m.created_at).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom send input bar */}
          <form 
            onSubmit={handleSendMessage}
            style={{
              padding: "12px 16px",
              backgroundColor: "white",
              borderTop: "1.5px solid var(--color-border)",
              display: "flex",
              gap: "8px",
              alignItems: "center"
            }}
          >
            <input 
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Tulis mesej anda di sini..."
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--color-border)",
                fontSize: "0.85rem",
                backgroundColor: "var(--color-bg)",
                outline: "none",
                color: "var(--color-text-main)"
              }}
            />
            <button 
              type="submit"
              disabled={!newMessageText.trim() || sending}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-full)",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                boxShadow: "0 4px 10px rgba(255, 140, 50, 0.2)"
              }}
            >
              ➔
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }}>🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Menyambung ke talian sembang...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
