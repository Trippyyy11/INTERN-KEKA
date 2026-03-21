import sys

filepath = r'd:\Miscs\TP\INTERN-KEKA\INTERN KEKA\frontend\src\components\Dashboard.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '    return (\n        <div className=\"dashboard-layout\">'
end_marker = '                </div>\n            </main>'

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
nav_start = original_block.find('<nav className=\"sidebar-nav\">')
nav_end = original_block.find('</nav>') + 6
nav_block = original_block[nav_start:nav_end]

# 3. topbar actions
actions_start = original_block.find('<div className=\"topbar-actions\"')
actions_end = original_block.find('</header>')
actions_block = original_block[actions_start:actions_end].rstrip()

new_block = f'''    return (
        <div className="dashboard-layout" style={{{{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}}}>
            {vanta_block}

            {{/* FULL-WIDTH TOP HEADER */}}
            <header className="topbar" style={{{{ width: '100%', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10, background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-dark)', height: '70px', flexShrink: 0 }}}}>
                <div style={{{{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}}}>
                    <div className="sidebar-brand" style={{{{ padding: '0', height: 'auto', background: 'transparent', margin: 0, minWidth: 'auto', fontSize: '1.5rem', border: 'none' }}}}>
                        <span style={{{{ color: 'var(--primary)' }}}}>TP</span>&nbsp; Interns
                    </div>
                    <div style={{{{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-topbar)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '1.5rem' }}}}>
                        {{systemSettings?.companyName || 'Teaching Pariksha'}}
                    </div>
                    <div className="hidden md:block" style={{{{ fontSize: '0.85rem', color: 'var(--text-topbar)', opacity: 0.8, borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '1.5rem' }}}}>
                        {{new Date().toLocaleDateString('en-US', {{ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }})}}
                    </div>
                </div>
                {actions_block}
            </header>

            {{/* BODY WRAPPER (Sidebar + Main Content) */}}
            <div style={{{{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}}}>
                
                {{/* LEFT SIDEBAR (No Branding) */}}
                <aside className="sidebar" style={{{{ borderRight: '1px solid var(--border-dark)', background: 'var(--bg-panel)', height: '100%', zIndex: 5 }}}}>
                    <div style={{{{ paddingTop: '1rem', height: '100%', overflowY: 'auto' }}}}>
                        {nav_block}
                    </div>
                </aside>

                {{/* MAIN CONTENT (Canvas) */}}
                <main className="main-content" style={{{{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', margin: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-dark)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}}}>
                    <div className="dashboard-content" style={{{{ flex: 1, overflowY: 'auto', height: '100%' }}}}>
                        {{renderContent()}}
                        {{renderUserAttendanceModal()}}
                    </div>
                </main>'''

new_content = content[:start_idx] + new_block + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Success')
