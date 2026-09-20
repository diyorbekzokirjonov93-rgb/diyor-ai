function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onOpenChat,
  onSearch,
  onLibrary,
  onSettings,
  onLogin,
  mobileOpen,
  onClose,
  collapsed,
  onToggle
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`sidebar ${mobileOpen ? "mobile-open" : ""} ${
          collapsed ? "collapsed" : ""
        }`}
      >
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? "Sidebarni ochish" : "Sidebarni yopish"}
        >
          {collapsed ? "›" : "‹"}
        </button>

        {!collapsed && (
          <>
            <div className="sidebar-top">
              <button
                className="sidebar-new-chat"
                onClick={onNewChat}
              >
                <span>＋</span> New Chat
              </button>

              <nav className="sidebar-menu">
                <button onClick={onSearch}>
                  <span>⌕</span> Search
                </button>

                <button>
                  <span>◷</span> Recents
                </button>

                <button onClick={onLibrary}>
                  <span>▣</span> Library
                </button>
              </nav>

              <div className="chat-history">
                <div className="history-title">
                  <span>Recent chats</span>
                  <span>{chats.length}</span>
                </div>

                {chats.length === 0 ? (
                  <div className="empty-history">
                    No chats yet
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`history-item ${
                        chat.id === activeChatId ? "active" : ""
                      }`}
                      onClick={() => {
                        onOpenChat(chat.id);
                        onClose();
                      }}
                    >
                      <span className="history-icon">💬</span>

                      <span className="history-text">
                        {chat.title || "New Chat"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="sidebar-bottom">
              <button onClick={onSettings}>
                <span>⚙</span> Settings
              </button>

              <button onClick={onLogin}>
                <span className="small-avatar">D</span>
                Account
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default Sidebar;