import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPrediction, getTrends } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';

// ───── Icons ─────
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const PredictIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const TrendsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ───── Custom Tooltip ─────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 15, 40, 0.92)',
        border: '1px solid rgba(0,186,242,0.25)',
        borderRadius: '14px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: 13 }}>{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: '#94a3b8', fontSize: 12, margin: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: entry.color }}></span>
            {entry.name}: <span style={{ color: '#fff', fontWeight: 600, marginLeft: 4 }}>{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ───── Inline Styles ─────
const getStyles = (darkMode) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Playfair+Display:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #050d1f;
    --navy-mid: #0a1628;
    --navy-card: #0d1e36;
    --navy-border: rgba(0,186,242,0.12);
    --cyan: #00BAF2;
    --cyan-dim: rgba(0,186,242,0.15);
    --cyan-glow: rgba(0,186,242,0.35);
    --gold: #f0c040;
    --gold-dim: rgba(240,192,64,0.15);
    --text-primary: #e8f0fe;
    --text-secondary: #7a90b0;
    --text-muted: #3d5278;
    --sidebar-w: 260px;
    --radius: 16px;
    --radius-sm: 10px;
  }

  .light-mode {
    --navy: #f0f4ff;
    --navy-mid: #e8eeff;
    --navy-card: #ffffff;
    --navy-border: rgba(0,41,112,0.12);
    --text-primary: #0a1628;
    --text-secondary: #4a6080;
    --text-muted: #8a9ab5;
  }

  body { font-family: 'DM Sans', sans-serif; }

  .dash-root {
    min-height: 100vh;
    background: var(--navy);
    font-family: 'DM Sans', sans-serif;
    color: var(--text-primary);
    transition: background 0.3s, color 0.3s;
    position: relative;
    overflow-x: hidden;
  }

  /* Background mesh */
  .dash-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% 10%, rgba(0,41,112,0.35) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,186,242,0.1) 0%, transparent 50%),
      radial-gradient(ellipse 40% 60% at 60% 20%, rgba(0,186,242,0.06) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  /* Grid texture */
  .dash-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: linear-gradient(rgba(0,186,242,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,186,242,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed;
    top: 0; left: 0;
    width: var(--sidebar-w);
    height: 100%;
    background: rgba(8, 14, 35, 0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-right: 1px solid var(--navy-border);
    z-index: 50;
    display: flex;
    flex-direction: column;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  }

  .light-mode .sidebar {
    background: rgba(240,244,255,0.9);
  }

  .sidebar-hidden { transform: translateX(-100%); }
  @media (min-width: 1024px) { .sidebar-hidden { transform: none; } }

  .sidebar-logo {
    padding: 28px 24px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--navy-border);
  }

  .logo-mark {
    width: 42px; height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #002970, #00BAF2);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 24px rgba(0,186,242,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
    flex-shrink: 0;
  }

  .logo-text h1 {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, var(--cyan) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.3px;
  }

  .logo-text p {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 500;
  }

  .nav-section {
    padding: 20px 12px;
    flex: 1;
    overflow-y: auto;
  }

  .nav-label {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 600;
    padding: 0 12px;
    margin-bottom: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    width: 100%;
    text-align: left;
    background: transparent;
    margin-bottom: 3px;
    position: relative;
    overflow: hidden;
  }

  .nav-item:hover {
    color: var(--text-primary);
    background: rgba(0,186,242,0.07);
    border-color: rgba(0,186,242,0.1);
  }

  .nav-item.active {
    background: linear-gradient(135deg, rgba(0,41,112,0.8), rgba(0,186,242,0.25));
    color: #fff;
    border-color: rgba(0,186,242,0.3);
    box-shadow: 0 4px 20px rgba(0,186,242,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    background: var(--cyan);
    border-radius: 0 3px 3px 0;
    box-shadow: 0 0 8px var(--cyan);
  }

  .nav-icon {
    width: 34px; height: 34px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .nav-item.active .nav-icon {
    background: rgba(0,186,242,0.2);
    box-shadow: 0 0 12px rgba(0,186,242,0.2);
  }

  .nav-item:hover:not(.active) .nav-icon {
    background: rgba(0,186,242,0.08);
  }

  /* Sidebar footer */
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--navy-border);
  }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(0,186,242,0.05);
    border: 1px solid rgba(0,186,242,0.1);
    margin-bottom: 10px;
  }

  .user-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #002970, #00BAF2);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 0 12px rgba(0,186,242,0.3);
  }

  .user-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: capitalize;
  }

  .logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #f87171;
    background: transparent;
    border: 1px solid rgba(248,113,113,0.15);
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.2px;
  }

  .logout-btn:hover {
    background: rgba(248,113,113,0.08);
    border-color: rgba(248,113,113,0.3);
  }

  /* ── Overlay ── */
  .sidebar-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 40;
  }

  /* ── Main ── */
  .main-wrap {
    margin-left: var(--sidebar-w);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
    transition: margin 0.35s;
  }

  @media (max-width: 1023px) {
    .main-wrap { margin-left: 0; }
  }

  /* ── Header ── */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 30;
    height: 64px;
    background: rgba(5,13,31,0.75);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--navy-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
  }

  .light-mode .topbar {
    background: rgba(240,244,255,0.8);
  }

  .topbar-left { display: flex; align-items: center; gap: 16px; }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    text-transform: capitalize;
    letter-spacing: -0.2px;
  }

  .page-sub {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 1px;
    font-weight: 400;
  }

  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .location-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(0,186,242,0.08);
    border: 1px solid rgba(0,186,242,0.2);
    font-size: 12px;
    font-weight: 500;
    color: var(--cyan);
    white-space: nowrap;
  }

  .theme-toggle {
    width: 52px; height: 28px;
    border-radius: 14px;
    background: rgba(0,186,242,0.1);
    border: 1px solid rgba(0,186,242,0.2);
    position: relative;
    cursor: pointer;
    transition: all 0.3s;
    display: flex; align-items: center;
  }

  .theme-toggle:hover { border-color: rgba(0,186,242,0.4); }

  .theme-knob {
    position: absolute;
    top: 3px;
    width: 22px; height: 22px;
    border-radius: 11px;
    background: linear-gradient(135deg, #002970, #00BAF2);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 2px 8px rgba(0,186,242,0.4);
  }

  .theme-knob.right { transform: translateX(26px); }
  .theme-knob.left { transform: translateX(3px); }

  .hamburger-btn {
    background: none; border: none; cursor: pointer;
    color: var(--text-secondary);
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s;
    display: none;
  }

  .hamburger-btn:hover { color: var(--text-primary); background: rgba(0,186,242,0.08); }

  @media (max-width: 1023px) { .hamburger-btn { display: flex; } }

  /* ── Page Content ── */
  .page-content {
    flex: 1;
    padding: 32px 28px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  @media (max-width: 768px) { .page-content { padding: 20px 16px; } }

  /* ── Cards ── */
  .card {
    background: rgba(13,30,54,0.7);
    border: 1px solid var(--navy-border);
    border-radius: var(--radius);
    backdrop-filter: blur(16px);
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }

  .light-mode .card {
    background: rgba(255,255,255,0.85);
    border-color: rgba(0,41,112,0.1);
    box-shadow: 0 2px 16px rgba(0,41,112,0.06);
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,186,242,0.03) 0%, transparent 60%);
    pointer-events: none;
  }

  .card:hover {
    border-color: rgba(0,186,242,0.25);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,186,242,0.1);
  }

  .card-p { padding: 24px; }
  .card-px { padding: 0 24px; }

  /* ── Hero ── */
  .hero-card {
    background: linear-gradient(135deg, #001540 0%, #002970 40%, #004590 70%, rgba(0,186,242,0.4) 100%);
    border: 1px solid rgba(0,186,242,0.3);
    border-radius: 20px;
    padding: 36px 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .hero-card::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,186,242,0.15) 0%, transparent 70%);
  }

  .hero-card::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 40%;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,186,242,0.08) 0%, transparent 70%);
  }

  .hero-eyebrow {
    font-size: 12px;
    font-weight: 500;
    color: rgba(0,186,242,0.8);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.5px;
    margin-bottom: 10px;
    line-height: 1.2;
  }

  .hero-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.6);
    max-width: 500px;
    line-height: 1.6;
    font-weight: 300;
  }

  /* ── Stat Cards ── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }

  .stat-card {
    background: rgba(13,30,54,0.7);
    border: 1px solid var(--navy-border);
    border-radius: var(--radius);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.25s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }

  .light-mode .stat-card {
    background: rgba(255,255,255,0.9);
    border-color: rgba(0,41,112,0.1);
  }

  .stat-card:hover {
    border-color: rgba(0,186,242,0.3);
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,186,242,0.1);
  }

  .stat-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    position: relative;
  }

  .stat-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Action Cards ── */
  .action-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 640px) { .action-grid { grid-template-columns: 1fr; } }

  .action-card {
    background: rgba(13,30,54,0.7);
    border: 1px solid var(--navy-border);
    border-radius: var(--radius);
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }

  .light-mode .action-card {
    background: rgba(255,255,255,0.9);
    border-color: rgba(0,41,112,0.1);
  }

  .action-card:hover {
    border-color: rgba(0,186,242,0.35);
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,186,242,0.15);
  }

  .action-card::after {
    content: '→';
    position: absolute;
    bottom: 20px; right: 20px;
    font-size: 20px;
    color: var(--text-muted);
    transition: all 0.3s;
    opacity: 0;
    transform: translateX(-8px);
  }

  .action-card:hover::after {
    opacity: 1;
    transform: translateX(0);
    color: var(--cyan);
  }

  .action-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    flex-shrink: 0;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .action-card:hover .action-icon {
    transform: scale(1.12) rotate(-3deg);
  }

  .action-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .action-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    font-weight: 300;
  }

  /* ── Section header ── */
  .section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }

  .section-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 3px;
    font-weight: 300;
  }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #002970, #0057b8, #00BAF2);
    border: 1px solid rgba(0,186,242,0.3);
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(0,186,242,0.2);
    white-space: nowrap;
    letter-spacing: 0.2px;
    font-family: 'DM Sans', sans-serif;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,186,242,0.35);
    border-color: rgba(0,186,242,0.5);
  }

  .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  /* ── Error Alert ── */
  .alert-error {
    padding: 14px 18px;
    border-radius: 12px;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.25);
    color: #fca5a5;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeSlideIn 0.3s ease;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Skeleton ── */
  .skeleton {
    border-radius: 8px;
    background: linear-gradient(90deg,
      rgba(255,255,255,0.03) 0%,
      rgba(0,186,242,0.08) 50%,
      rgba(255,255,255,0.03) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Prediction Result Cards ── */
  .pred-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 900px) { .pred-grid { grid-template-columns: 1fr; } }

  .pred-card {
    background: rgba(13,30,54,0.75);
    border: 1px solid var(--navy-border);
    border-radius: var(--radius);
    padding: 28px;
    position: relative;
    overflow: hidden;
    animation: fadeSlideIn 0.4s ease;
    transition: all 0.25s;
  }

  .light-mode .pred-card {
    background: rgba(255,255,255,0.9);
    border-color: rgba(0,41,112,0.1);
  }

  .pred-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
  }

  .pred-card-main {
    border-color: rgba(0,186,242,0.3);
    background: linear-gradient(135deg, rgba(0,20,60,0.9), rgba(0,41,112,0.4));
  }

  .pred-card-action { border-left: 3px solid var(--gold); }
  .pred-card-insight { border-left: 3px solid var(--cyan); }

  .pred-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }

  .pred-badge {
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  .pred-number {
    font-family: 'Playfair Display', serif;
    font-size: 56px;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(135deg, #fff 0%, var(--cyan) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;
  }

  .pred-unit {
    font-size: 16px;
    color: var(--text-muted);
    font-weight: 400;
    margin-left: 4px;
  }

  .pred-hint { font-size: 12px; color: var(--text-muted); margin-top: 8px; font-weight: 300; }

  .pred-body {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.65;
    font-weight: 400;
  }

  /* ── Chart Card ── */
  .chart-card {
    background: rgba(13,30,54,0.75);
    border: 1px solid var(--navy-border);
    border-radius: 20px;
    overflow: hidden;
  }

  .light-mode .chart-card {
    background: rgba(255,255,255,0.9);
    border-color: rgba(0,41,112,0.1);
  }

  .chart-header {
    padding: 22px 28px 0;
    display: flex; align-items: center; justify-content: space-between;
  }

  .chart-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .chart-legend {
    display: flex; align-items: center; gap: 16px;
  }

  .legend-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .legend-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }

  .chart-body { padding: 16px 12px 16px; }

  /* ── Table ── */
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 12px 20px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-muted);
    background: rgba(0,186,242,0.04);
    border-bottom: 1px solid var(--navy-border);
  }

  .data-table th:not(:first-child) { text-align: right; }

  .data-table td {
    padding: 12px 20px;
    font-size: 13px;
    color: var(--text-secondary);
    border-bottom: 1px solid rgba(0,186,242,0.05);
    transition: background 0.15s;
  }

  .data-table td:not(:first-child) { text-align: right; }
  .data-table td:first-child { font-weight: 500; color: var(--text-primary); font-family: 'DM Mono', monospace; font-size: 12px; }
  .data-table td:nth-child(2) { font-weight: 700; color: var(--cyan); }

  .data-table tr:hover td { background: rgba(0,186,242,0.04); }
  .data-table tr:last-child td { border-bottom: none; }

  /* ── Empty State ── */
  .empty-state {
    padding: 60px 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .empty-icon {
    width: 72px; height: 72px;
    border-radius: 20px;
    background: rgba(0,186,242,0.07);
    border: 1px solid rgba(0,186,242,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    margin-bottom: 8px;
  }

  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .empty-desc {
    font-size: 13px;
    color: var(--text-muted);
    max-width: 360px;
    line-height: 1.6;
    font-weight: 300;
  }

  /* ── Trends controls ── */
  .trends-controls {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  }

  .select-styled {
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--navy-border);
    background: rgba(13,30,54,0.8);
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    outline: none;
    transition: all 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a90b0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }

  .light-mode .select-styled {
    background-color: rgba(255,255,255,0.9);
    border-color: rgba(0,41,112,0.15);
    color: #0a1628;
  }

  .select-styled:hover { border-color: rgba(0,186,242,0.35); }
  .select-styled:focus { border-color: rgba(0,186,242,0.5); box-shadow: 0 0 0 3px rgba(0,186,242,0.1); }

  .table-count-badge {
    display: inline-flex;
    padding: 4px 10px;
    border-radius: 20px;
    background: rgba(0,186,242,0.1);
    border: 1px solid rgba(0,186,242,0.2);
    font-size: 11px;
    color: var(--cyan);
    font-weight: 600;
    margin-left: 8px;
  }

  /* ── Divider ── */
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,186,242,0.15), transparent);
    margin: 8px 0;
  }

  /* ── Spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.9s linear infinite; }

  /* ── Stagger animation ── */
  .stagger > * {
    animation: fadeSlideIn 0.4s ease both;
  }

  .stagger > *:nth-child(1) { animation-delay: 0s; }
  .stagger > *:nth-child(2) { animation-delay: 0.07s; }
  .stagger > *:nth-child(3) { animation-delay: 0.14s; }
  .stagger > *:nth-child(4) { animation-delay: 0.21s; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,186,242,0.2); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0,186,242,0.4); }
`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState('');

  const [trends, setTrends] = useState([]);
  const [trendRange, setTrendRange] = useState('weekly');
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchPrediction = async () => {
    setPredLoading(true);
    setPredError('');
    setPrediction(null);
    try {
      const data = await getPrediction(user.username);
      if (data.error) setPredError(data.error);
      else setPrediction(data);
    } catch (err) {
      setPredError(err.response?.data?.error || 'Failed to get prediction. Please try again.');
    } finally {
      setPredLoading(false);
    }
  };

  const fetchTrends = async () => {
    setTrendsLoading(true);
    setTrendsError('');
    setTrends([]);
    try {
      const data = await getTrends(user.username, trendRange);
      if (data.error) {
        setTrendsError(data.error);
      } else {
        const formatted = data.map((item) => {
          let dStr = '';
          if (typeof item.date === 'string') dStr = item.date.split('T')[0].split(' ')[0];
          else if (item.date) {
            try { dStr = new Date(item.date).toISOString().split('T')[0]; }
            catch (e) { dStr = String(item.date); }
          }
          return { ...item, date: dStr };
        });
        setTrends(formatted);
      }
    } catch (err) {
      setTrendsError(err.response?.data?.error || 'Failed to load trends. Please try again.');
    } finally {
      setTrendsLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'predict', label: 'Predict', icon: <PredictIcon /> },
    { id: 'trends', label: 'Trends', icon: <TrendsIcon /> },
  ];

  const statCards = [
    { label: 'Business Type', value: user?.category || '—', icon: '🏪', bg: 'linear-gradient(135deg,#002970,#0057b8)', shadow: 'rgba(0,87,184,0.35)' },
    { label: 'Location', value: user?.location || '—', icon: '📍', bg: 'linear-gradient(135deg,#065f46,#059669)', shadow: 'rgba(5,150,105,0.35)' },
    { label: 'Store ID', value: `#${user?.store_id ?? '—'}`, icon: '🏷️', bg: 'linear-gradient(135deg,#4c1d95,#7c3aed)', shadow: 'rgba(124,58,237,0.35)' },
    { label: 'Subscription', value: user?.subscribed ? 'Active' : 'Inactive', icon: user?.subscribed ? '✅' : '⚠️', bg: user?.subscribed ? 'linear-gradient(135deg,#064e3b,#10b981)' : 'linear-gradient(135deg,#78350f,#f59e0b)', shadow: user?.subscribed ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)' },
  ];

  const trendLabel = trendRange === 'daily' ? 'Last 7 Days' : trendRange === 'weekly' ? 'Last 30 Days' : 'Last 90 Days';

  return (
    <>
      <style>{getStyles(darkMode)}</style>
      <div className={`dash-root${darkMode ? '' : ' light-mode'}`}>
        {/* Overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`sidebar${sidebarOpen ? '' : ' sidebar-hidden'}`}>
          <div className="sidebar-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="logo-mark">
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="logo-text">
                <h1>Pulse</h1>
                <p>Merchant AI</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} className="lg-hidden">
              <CloseIcon />
            </button>
          </div>

          <nav className="nav-section">
            <p className="nav-label">Navigation</p>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`nav-item${activeTab === item.id ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="user-avatar">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="user-name">{user?.username || 'User'}</div>
                <div className="user-role">{user?.category || 'Merchant'}</div>
              </div>
            </div>
            <button id="logout-btn" onClick={handleLogout} className="logout-btn">
              <LogoutIcon />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main-wrap">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <button onClick={() => setSidebarOpen(true)} className="hamburger-btn">
                <MenuIcon />
              </button>
              <div>
                <div className="page-title">{activeTab}</div>
                <div className="page-sub">Welcome back, {user?.username}</div>
              </div>
            </div>
            <div className="topbar-right">
              {user?.location && (
                <span className="location-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.location}
                </span>
              )}
              <button
                id="dark-mode-toggle"
                className="theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle theme"
              >
                <div className={`theme-knob ${darkMode ? 'right' : 'left'}`}>
                  {darkMode ? <MoonIcon /> : <SunIcon />}
                </div>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="page-content">

            {/* ═══ DASHBOARD ═══ */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Hero */}
                <div className="hero-card">
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="hero-eyebrow">
                      <span>👋</span> Hello, {user?.username}
                    </div>
                    <h2 className="hero-title">Your Business at a Glance</h2>
                    <p className="hero-sub">
                      Use AI-powered predictions and trend analysis to make smarter inventory decisions for your {user?.category} business.
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="stat-grid stagger">
                  {statCards.map((stat, i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-icon" style={{ background: stat.bg, boxShadow: `0 8px 24px ${stat.shadow}` }}>
                        {stat.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Cards */}
                <div className="action-grid stagger">
                  <div className="action-card" onClick={() => setActiveTab('predict')}>
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #92400e, #f59e0b)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
                      <PredictIcon />
                    </div>
                    <div>
                      <div className="action-title">AI Prediction</div>
                      <div className="action-desc">Get tomorrow's sales forecast powered by XGBoost ML model</div>
                    </div>
                  </div>
                  <div className="action-card" onClick={() => setActiveTab('trends')}>
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #002970, #00BAF2)', boxShadow: '0 8px 24px rgba(0,186,242,0.3)' }}>
                      <TrendsIcon />
                    </div>
                    <div>
                      <div className="action-title">Sales Trends</div>
                      <div className="action-desc">Visualize your sales patterns over daily, weekly, or monthly periods</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ PREDICT ═══ */}
            {activeTab === 'predict' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="section-header">
                  <div>
                    <div className="section-title">AI Sales Prediction</div>
                    <div className="section-sub">Generate tomorrow's sales forecast using our ML model</div>
                  </div>
                  <button
                    id="predict-btn"
                    onClick={fetchPrediction}
                    disabled={predLoading}
                    className="btn-primary"
                  >
                    {predLoading ? (
                      <>
                        <svg className="spin" style={{ width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <PredictIcon />
                        Generate Prediction
                      </>
                    )}
                  </button>
                </div>

                {predError && (
                  <div className="alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {predError}
                  </div>
                )}

                {predLoading && !prediction && (
                  <div className="pred-grid">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="pred-card card-p">
                        <div className="skeleton" style={{ height: 14, width: 90, marginBottom: 20, borderRadius: 6 }}></div>
                        <div className="skeleton" style={{ height: 52, width: '70%', marginBottom: 12, borderRadius: 8 }}></div>
                        <div className="skeleton" style={{ height: 11, width: '55%', borderRadius: 6 }}></div>
                      </div>
                    ))}
                  </div>
                )}

                {prediction && (
                  <div className="pred-grid stagger">
                    {/* Predicted number */}
                    <div className="pred-card pred-card-main">
                      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,186,242,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
                      <div className="pred-eyebrow">
                        <div className="pred-badge" style={{ background: 'rgba(0,186,242,0.15)' }}>📊</div>
                        Predicted Sales
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span className="pred-number">{prediction.prediction?.toFixed(0)}</span>
                        <span className="pred-unit">units</span>
                      </div>
                      <div className="pred-hint">Tomorrow's estimated demand</div>
                    </div>

                    {/* Action */}
                    <div className="pred-card pred-card-action">
                      <div className="pred-eyebrow">
                        <div className="pred-badge" style={{ background: 'rgba(240,192,64,0.15)' }}>⚡</div>
                        Action Required
                      </div>
                      <div className="pred-body" style={{ fontWeight: 500, fontSize: 15 }}>{prediction.action}</div>
                    </div>

                    {/* Insight */}
                    <div className="pred-card pred-card-insight">
                      <div className="pred-eyebrow">
                        <div className="pred-badge" style={{ background: 'rgba(0,186,242,0.1)' }}>🤖</div>
                        AI Insight
                      </div>
                      <div className="pred-body" style={{ whiteSpace: 'pre-line' }}>{prediction.insight}</div>
                    </div>
                  </div>
                )}

                {!prediction && !predLoading && !predError && (
                  <div className="card">
                    <div className="empty-state">
                      <div className="empty-icon">🔮</div>
                      <div className="empty-title">No Prediction Yet</div>
                      <div className="empty-desc">
                        Click "Generate Prediction" to get tomorrow's sales forecast powered by our AI engine.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ TRENDS ═══ */}
            {activeTab === 'trends' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="section-header">
                  <div>
                    <div className="section-title">Sales Trends</div>
                    <div className="section-sub">Analyze your historical sales data</div>
                  </div>
                  <div className="trends-controls">
                    <select
                      id="trend-range"
                      value={trendRange}
                      onChange={(e) => setTrendRange(e.target.value)}
                      className="select-styled"
                    >
                      <option value="daily">📅 Daily (7 days)</option>
                      <option value="weekly">📊 Weekly (30 days)</option>
                      <option value="monthly">📈 Monthly (90 days)</option>
                    </select>
                    <button
                      id="load-trends-btn"
                      onClick={fetchTrends}
                      disabled={trendsLoading}
                      className="btn-primary"
                    >
                      {trendsLoading ? (
                        <>
                          <svg className="spin" style={{ width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Loading…
                        </>
                      ) : (
                        <>
                          <TrendsIcon />
                          Load Trends
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {trendsError && (
                  <div className="alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {trendsError}
                  </div>
                )}

                {trendsLoading && trends.length === 0 && (
                  <div className="chart-card" style={{ padding: 28 }}>
                    <div className="skeleton" style={{ height: 300, width: '100%', borderRadius: 12, marginBottom: 16 }}></div>
                    <div className="skeleton" style={{ height: 14, width: 180, margin: '0 auto', borderRadius: 6 }}></div>
                  </div>
                )}

                {trends.length > 0 && (
                  <>
                    {/* Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <div className="chart-title">Sales Over Time — {trendLabel}</div>
                        <div className="chart-legend">
                          <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#00BAF2' }}></div>
                            Sales
                          </div>
                          <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#8b5cf6' }}></div>
                            7-Day Avg
                          </div>
                        </div>
                      </div>
                      <div className="chart-body">
                        <div style={{ width: '100%', height: 320 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                              <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00BAF2" stopOpacity={0.25} />
                                  <stop offset="100%" stopColor="#00BAF2" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="meanGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(0,186,242,0.07)' : 'rgba(0,41,112,0.07)'} />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: darkMode ? '#4a6080' : '#8a9ab5', fontFamily: 'DM Sans' }}
                                axisLine={{ stroke: darkMode ? 'rgba(0,186,242,0.1)' : 'rgba(0,41,112,0.1)' }}
                                tickLine={false}
                                tickFormatter={(val) => {
                                  if (!val) return '';
                                  const parts = String(val).split('-');
                                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                                }}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: darkMode ? '#4a6080' : '#8a9ab5', fontFamily: 'DM Sans' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="sales" stroke="#00BAF2" strokeWidth={2.5} fill="url(#salesGradient)" name="Sales" dot={false} activeDot={{ r: 5, fill: '#00BAF2', stroke: '#fff', strokeWidth: 2 }} />
                              <Area type="monotone" dataKey="rolling_mean_7" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#meanGradient)" strokeDasharray="5 4" name="7-Day Avg" dot={false} activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="card" style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--navy-border)', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Detailed Records
                        </span>
                        <span className="table-count-badge">{trends.length}</span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Sales</th>
                              <th>Price (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trends.map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.date}</td>
                                <td>{typeof row.sales === 'number' ? row.sales.toFixed(1) : row.sales}</td>
                                <td>₹{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {trends.length === 0 && !trendsLoading && !trendsError && (
                  <div className="card">
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <div className="empty-title">No Trends Data</div>
                      <div className="empty-desc">
                        Select a time range and click "Load Trends" to visualize your sales patterns.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
