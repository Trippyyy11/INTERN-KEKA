import { LogOut, Sun, Moon, HelpCircle } from 'lucide-react';

const Sidebar = ({
    sidebarItems,
    user,
    activeSidebar,
    setActiveSidebar,
    teammates,
    onLogout,
    isLightMode,
    toggleTheme
}) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span style={{ color: 'var(--primary)' }}>TP</span>&nbsp; Interns
            </div>
            <nav className="sidebar-nav">
                {sidebarItems.filter(item => {
                    if (item.name === 'My Team' && teammates.length === 0) return false;
                    if (item.name === 'Admin' && !(user?.role === 'Reporting Officer' || user?.role === 'Super Admin')) return false;
                    return true;
                }).map(item => (
                    <div
                        key={item.name}
                        className={`sidebar-item ${activeSidebar === item.name ? 'active' : ''}`}
                        onClick={() => setActiveSidebar(item.name)}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </div>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="sidebar-item" onClick={toggleTheme}>
                    {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{isLightMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className="sidebar-item">
                    <HelpCircle size={20} />
                    <span>Help Center</span>
                </div>
                <div className="sidebar-item" onClick={onLogout} style={{ color: 'var(--danger)' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
