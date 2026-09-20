import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";



function App() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("diyorai_chats");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.log("Chat history error:", error);
    }

    return [
      {
        id: Date.now(),
        title: "New Chat",
        messages: [],
        createdAt: Date.now()
      }
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = localStorage.getItem("diyorai_active_chat");

    return saved ? Number(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("diyorai_theme") || "light";
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [modal, setModal] = useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats]);

  useEffect(() => {
    localStorage.setItem(
      "diyorai_chats",
      JSON.stringify(chats)
    );
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(
        "diyorai_active_chat",
        String(activeChatId)
      );
    }
  }, [activeChatId]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    localStorage.setItem(
      "diyorai_theme",
      theme
    );
  }, [theme]);

  const activeChat =
    chats.find(
      (chat) => chat.id === activeChatId
    ) || chats[0];

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now()
    };

    setChats((oldChats) => [
      newChat,
      ...oldChats
    ]);

    setActiveChatId(newChat.id);

    setMobileOpen(false);
  };

  const updateChat = (updatedChat) => {
    setChats((oldChats) =>
      oldChats.map((chat) =>
        chat.id === updatedChat.id
          ? updatedChat
          : chat
      )
    );
  };

  const openChat = (id) => {
    setActiveChatId(id);
    setMobileOpen(false);
  };

  const deleteChat = (id) => {
    const filteredChats = chats.filter(
      (chat) => chat.id !== id
    );

    if (filteredChats.length === 0) {
      const newChat = {
        id: Date.now(),
        title: "New Chat",
        messages: [],
        createdAt: Date.now()
      };

      setChats([newChat]);
      setActiveChatId(newChat.id);

      return;
    }

    setChats(filteredChats);

    if (activeChatId === id) {
      setActiveChatId(filteredChats[0].id);
    }
  };

  const filteredChats = useMemo(() => {
    if (!search.trim()) {
      return chats;
    }

    return chats.filter((chat) =>
      (chat.title || "New Chat")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [chats, search]);

  const toggleTheme = () => {
    setTheme((oldTheme) =>
      oldTheme === "light"
        ? "dark"
        : "light"
    );
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(
      (oldValue) => !oldValue
    );
  };

  const openSearch = () => {
    setModal("search");
  };

  const openLibrary = () => {
    setModal("library");
  };

  const openSettings = () => {
    setModal("settings");
  };

  const openLogin = () => {
    setModal("login");
  };

  return (
    <div
      className={`app ${
        sidebarCollapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      <Navbar
        onNewChat={createNewChat}
        onMenu={() =>
          setMobileOpen(
            (oldValue) => !oldValue
          )
        }
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogin={openLogin}
      />

      <Sidebar
        chats={filteredChats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onOpenChat={openChat}
        onSearch={openSearch}
        onLibrary={openLibrary}
        onSettings={openSettings}
        onLogin={openLogin}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <Chat
        activeChat={activeChat}
        onUpdateChat={updateChat}
      />

      {modal === "search" && (
        <div
          className="modal-overlay"
          onClick={() => setModal(null)}
        >
          <div
            className="modal search-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>Search chats</h2>
                <p>
                  Oldingi suhbatlaringizni qidiring.
                </p>
              </div>

              <button
                onClick={() => setModal(null)}
              >
                ×
              </button>
            </div>

            <input
              className="modal-search"
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Chat qidirish..."
            />

            <div className="search-results">
              {filteredChats.length === 0 ? (
                <div className="modal-empty">
                  Chat topilmadi.
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      openChat(chat.id);
                      setModal(null);
                    }}
                  >
                    💬 {chat.title || "New Chat"}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {modal === "library" && (
        <div
          className="modal-overlay"
          onClick={() => setModal(null)}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>Library</h2>
                <p>
                  DiyorAI bilan yaratilgan
                  ma'lumotlar shu yerda bo‘ladi.
                </p>
              </div>

              <button
                onClick={() => setModal(null)}
              >
                ×
              </button>
            </div>

            <div className="library-grid">
              <div className="library-card">
                <div>📄</div>
                <h3>Documents</h3>
                <p>Hujjatlaringiz</p>
              </div>

              <div className="library-card">
                <div>🖼️</div>
                <h3>Images</h3>
                <p>Rasmlaringiz</p>
              </div>

              <div className="library-card">
                <div>💻</div>
                <h3>Projects</h3>
                <p>Loyiha materiallari</p>
              </div>

              <div className="library-card">
                <div>⭐</div>
                <h3>Saved</h3>
                <p>Saqlanganlar</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "settings" && (
        <div
          className="modal-overlay"
          onClick={() => setModal(null)}
        >
          <div
            className="modal settings-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>Settings</h2>
                <p>DiyorAI sozlamalari</p>
              </div>

              <button
                onClick={() => setModal(null)}
              >
                ×
              </button>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div>
                  <strong>Appearance</strong>
                  <span>
                    {theme === "dark"
                      ? "Dark mode"
                      : "Light mode"}
                  </span>
                </div>

                <button
                  className="setting-action"
                  onClick={toggleTheme}
                >
                  {theme === "dark"
                    ? "☀️"
                    : "🌙"}
                </button>
              </div>

              <div className="setting-item">
                <div>
                  <strong>Language</strong>
                  <span>O‘zbekcha</span>
                </div>

                <button className="setting-action">
                  EN
                </button>
              </div>

              <div className="setting-item">
                <div>
                  <strong>Chat history</strong>
                  <span>
                    {chats.length} ta chat
                  </span>
                </div>

                <button
                  className="danger-action"
                  onClick={() => {
                    const shouldClear =
                      window.confirm(
                        "Barcha chatlarni o‘chirishni xohlaysizmi?"
                      );

                    if (!shouldClear) {
                      return;
                    }

                    localStorage.removeItem(
                      "diyorai_chats"
                    );

                    const newChat = {
                      id: Date.now(),
                      title: "New Chat",
                      messages: [],
                      createdAt: Date.now()
                    };

                    setChats([newChat]);
                    setActiveChatId(newChat.id);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "login" && (
        <div
          className="modal-overlay"
          onClick={() => setModal(null)}
        >
          <div
            className="modal login-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() => setModal(null)}
            >
              ×
            </button>

            <div className="login-logo">
              D
            </div>

            <h2>Welcome to DiyorAI</h2>

            <p>
              Hisobingizga kiring yoki yangi
              account yarating.
            </p>

            <button className="google-login">
              Continue with Google
            </button>

            <div className="login-divider">
              <span>yoki</span>
            </div>

            <input
              type="email"
              placeholder="Email"
            />

            <input
              type="password"
              placeholder="Password"
            />

            <button className="login-submit">
              Login
            </button>

            <p className="login-note">
              Real authentication keyingi
              backend bosqichida ulanadi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;