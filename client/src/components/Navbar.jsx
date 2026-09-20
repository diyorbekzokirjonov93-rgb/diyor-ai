function Navbar({ onNewChat, onMenu, theme, onToggleTheme, onLogin }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenu}>
          ☰
        </button>

        <div className="navbar-logo">
          Diyor<span>AI</span>
        </div>
      </div>

      <div className="navbar-actions">
        <button
          className="theme-btn"
          onClick={onToggleTheme}
          title="Theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <button className="new-chat-btn" onClick={onNewChat}>
          <span>＋</span>
          New Chat
        </button>

        <button className="profile-btn" onClick={onLogin}>
          D
        </button>
      </div>
    </header>
  );
}

export default Navbar;