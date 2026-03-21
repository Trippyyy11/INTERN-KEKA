import sys

filepath = r'd:\Miscs\TP\INTERN-KEKA\INTERN KEKA\frontend\src\components\Dashboard.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '    return (\n        <div className="dashboard-layout"'
end_marker = '                </main>\n            </div>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Error: Could not find markers')
    sys.exit(1)

original_block = content[start_idx:end_idx]

# Extract components from the original block
# 1. vantaRef div
vanta_start = original_block.find('<div ref={vantaRef}')
vanta_end = original_block.find('}}></div>') + 9
vanta_block = original_block[vanta_start:vanta_end]

# 2. sidebar nav
nav_start = original_block.find('<nav className="sidebar-nav"')
nav_end = original_block.find('</nav>') + 6
nav_block = original_block[nav_start:nav_end]

# 3. topbar actions
actions_start = original_block.find('<div className="topbar-actions"')
# the actions block ends right before </header>
actions_end = original_block.find('</header>')
actions_block = original_block[actions_start:actions_end].rstrip()

new_block = f'''    return (
        <div className="dashboard-layout" style={{{{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden', padding: '1.25rem', gap: '1.25rem', boxSizing: 'border-box' }}}}>
            {vanta_block}

            {{/* FLOATING SIDEBAR ISLAND */}}
            <aside className="sidebar" style={{{{ width: '260px', borderRadius: '24px', background: isLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', zIndex: 5, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}}}>
                <div className="sidebar-brand" style={{{{ padding: '1.5rem', height: 'auto', background: 'transparent', margin: 0, fontSize: '1.5rem', border: 'none', textAlign: 'center', fontWeight: '700' }}}}>
                    <span style={{{{ color: 'var(--primary)' }}}}>TP</span>&nbsp;<span style={{{{ color: 'var(--text-main)' }}}}>Interns</span>
                </div>
                <div style={{{{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}}}>
                    {nav_block}
                </div>
            </aside>

            {{/* RIGHT COLUMN (Topbar + Content) */}}
            <div style={{{{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden', zIndex: 5 }}}}>
                
                {{/* FLOATING TOPBAR ISLAND */}}
                <header className="topbar" style={{{{ width: '100%', borderRadius: '24px', background: isLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: '74px', flexShrink: 0, padding: '0 1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', transition: 'all 0.3s ease' }}}}>
                    <div style={{{{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}}}>
                        <div style={{{{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-topbar)' }}}}>
                            {{systemSettings?.companyName || 'Teaching Pariksha'}}
                        </div>
                        <div className="hidden md:block" style={{{{ fontSize: '0.9rem', color: 'var(--text-topbar)', opacity: 0.7, borderLeft: '1px solid var(--border-dark)', paddingLeft: '1.5rem' }}}}>
                            {{new Date().toLocaleDateString('en-US', {{ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }})}}
                        </div>
                    </div>
                    {actions_block}
                </header>

                {{/* MAIN CONTENT CANVAS */}}
                <main className="main-content" style={{{{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', borderRadius: '24px', border: '1px solid var(--border-dark)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' }}}}>
                    <div className="dashboard-content" style={{{{ flex: 1, overflowY: 'auto', height: '100%' }}}}>
                        {{renderContent()}}
                        {{renderUserAttendanceModal()}}
                    </div>
                </main>
            </div>'''

new_content = content[:start_idx] + new_block + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Success')
