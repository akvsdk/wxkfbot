import os

css = r"""@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap');
:root {
  --bg-root: #0a0b10;
  --bg-surface: #0f1117;
  --bg-elevated: #161822;
  --bg-hover: #1c1f2e;
  --border: #1e2235;
  --border-active: #2a3050;
  --text-primary: #e2e4ea;
  --text-secondary: #6b7194;
  --text-muted: #3d4260;
  --accent: #00d4aa;
  --accent-dim: rgba(0, 212, 170, 0.12);
  --accent-glow: rgba(0, 212, 170, 0.3);
  --danger: #ff4d6a;
  --warning: #ffb020;
  --info: #4d9fff;
  --radius: 6px;
  --radius-lg: 10px;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; background: var(--bg-root); color: var(--text-primary); font-family: var(--font-sans); font-size: 14px; line-height: 1.5; }
#app { height: 100%; }

/* Element Plus Dark Overrides */
.el-table { --el-table-bg-color: var(--bg-surface); --el-table-tr-bg-color: var(--bg-surface); --el-table-header-bg-color: var(--bg-elevated); --el-table-row-hover-bg-color: var(--bg-hover); --el-table-border-color: var(--border); --el-table-text-color: var(--text-primary); --el-table-header-text-color: var(--text-secondary); }
.el-card { --el-card-bg-color: var(--bg-surface); --el-card-border-color: var(--border); border-radius: var(--radius-lg) !important; }
.el-card__header { border-bottom-color: var(--border) !important; }
.el-dialog { --el-dialog-bg-color: var(--bg-elevated); --el-dialog-border-radius: var(--radius-lg); border: 1px solid var(--border); }
.el-input__wrapper { background: var(--bg-elevated) !important; border-color: var(--border) !important; box-shadow: none !important; }
.el-input__wrapper:hover, .el-input__wrapper.is-focus { border-color: var(--accent) !important; box-shadow: 0 0 0 2px var(--accent-dim) !important; }
.el-input__inner { color: var(--text-primary) !important; }
.el-input__inner::placeholder { color: var(--text-muted) !important; }
.el-select__wrapper { background: var(--bg-elevated) !important; border-color: var(--border) !important; box-shadow: none !important; }
.el-button--primary { --el-button-bg-color: var(--accent); --el-button-border-color: var(--accent); --el-button-hover-bg-color: #00e8bb; --el-button-hover-border-color: #00e8bb; --el-button-text-color: #0a0b10; font-weight: 600; }
.el-button--danger { --el-button-bg-color: var(--danger); --el-button-border-color: var(--danger); }
.el-tag { border-radius: 4px; font-family: var(--font-mono); font-size: 12px; }
.el-form-item__label { color: var(--text-secondary) !important; }
.el-empty__description p { color: var(--text-muted) !important; }
.el-descriptions { --el-descriptions-item-bordered-label-background: var(--bg-elevated); }
.el-message-box { background: var(--bg-elevated) !important; border: 1px solid var(--border) !important; }
.el-overlay-dialog .el-dialog__title { color: var(--text-primary); }
.el-overlay-dialog .el-dialog__body { color: var(--text-secondary); }

/* Login Gate */
.login-gate { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-root); background-image: radial-gradient(ellipse at 20% 50%, rgba(0,212,170,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(77,159,255,0.03) 0%, transparent 50%); }
.login-terminal { width: 440px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); animation: fadeUp 0.4s ease; }
.terminal-header { display: flex; align-items: center; gap: 6px; padding: 12px 16px; background: var(--bg-elevated); border-bottom: 1px solid var(--border); }
.terminal-dot { width: 10px; height: 10px; border-radius: 50%; }
.terminal-dot.red { background: #ff5f57; }
.terminal-dot.yellow { background: #febc2e; }
.terminal-dot.green { background: #28c840; }
.terminal-title { margin-left: 10px; font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
.terminal-body { padding: 24px; }
.terminal-line { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
.terminal-line .prompt { color: var(--accent); margin-right: 8px; }
.terminal-form { margin-top: 20px; }
.input-line { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.input-line .prompt { font-family: var(--font-mono); font-size: 13px; color: var(--accent); white-space: nowrap; }
.terminal-input { flex: 1; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.terminal-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.terminal-input::placeholder { color: var(--text-muted); }
.terminal-btn { width: 100%; padding: 11px; background: var(--accent); color: var(--bg-root); border: none; border-radius: var(--radius); font-family: var(--font-mono); font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s, transform 0.1s; }
.terminal-btn:hover { background: #00e8bb; }
.terminal-btn:active { transform: scale(0.98); }
.terminal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.terminal-error { margin-top: 12px; font-family: var(--font-mono); font-size: 12px; color: var(--danger); }
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(10,11,16,0.3); border-top-color: var(--bg-root); border-radius: 50%; animation: spin 0.6s linear infinite; }

/* App Shell */
.app-shell { display: flex; height: 100vh; }
.sidebar { width: 200px; background: var(--bg-surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }
.sidebar-brand { padding: 20px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
.brand-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
.sidebar-brand span { font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: 2px; }
.sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; background: none; border-radius: var(--radius); color: var(--text-secondary); font-size: 13px; font-family: var(--font-sans); cursor: pointer; transition: all 0.15s; width: 100%; text-align: left; }
.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(0,212,170,0.2); }
.nav-icon { font-size: 14px; width: 18px; text-align: center; }
.sidebar-footer { padding: 12px 8px; border-top: 1px solid var(--border); }
.nav-item.logout:hover { color: var(--danger); }

.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.main-header { padding: 16px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); }
.main-header h1 { font-size: 16px; font-weight: 600; font-family: var(--font-sans); }
.header-status { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
.main-content { flex: 1; padding: 24px 28px; overflow-y: auto; background: var(--bg-root); }

/* Panel Shared */
.panel-card { border-radius: var(--radius-lg); }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-weight: 600; font-size: 13px; color: var(--text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.5px; }
.panel-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.mono { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
.form-tip { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.account-cell { display: flex; align-items: center; gap: 10px; }
.account-name { font-weight: 500; }
.stat-cards { margin-top: 16px; }
.stat-card { border-radius: var(--radius-lg); text-align: center; padding: 8px 0; background: var(--bg-surface); border: 1px solid var(--border); }
.stat-value { font-size: 28px; font-weight: 700; color: var(--accent); line-height: 1.2; font-family: var(--font-mono); }
.stat-label { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
.cursor-info { margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
.result-card { margin-top: 16px; }

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from { opacity: 0; transform: translateY(8px); }
.slide-leave-to { opacity: 0; transform: translateY(-8px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Animations */
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
"""

with open(os.path.join(os.path.dirname(__file__), '..', 'admin', 'src', 'style.css'), 'w', encoding='utf-8') as f:
    f.write(css)
print("style.css written successfully")
