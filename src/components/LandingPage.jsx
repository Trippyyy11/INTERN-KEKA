import {
    Building2,
    Users,
    Banknote,
    Target,
    Briefcase,
    Clock,
    ArrowRight,
    Menu,
    ChevronRight
} from 'lucide-react';

export default function LandingPage({ onLogin }) {
    const features = [
        {
            title: "Payroll & Expenses",
            desc: "Our industry redefining payroll system automates your payroll and saves time for everyone.",
            icon: <Banknote />
        },
        {
            title: "Modern HR",
            desc: "All your people information in one place to create a connected digital workplace.",
            icon: <Users />
        },
        {
            title: "Performance & Culture",
            desc: "An engaging culture driven by contextual feedback and organization aligned goals.",
            icon: <Target />
        },
        {
            title: "Hiring & Onboarding",
            desc: "An integrated hiring platform for teams to collaborate with recruiters and hire good talent.",
            icon: <Briefcase />
        },
        {
            title: "Project Timesheet",
            desc: "Track your employee time and maintain effective utilization to grow your services business.",
            icon: <Clock />
        },
        {
            title: "Company Organization",
            desc: "Everything you need to build a great company, right in one unified platform.",
            icon: <Building2 />
        }
    ];

    return (
        <div>
            {/* Navigation */}
            <header className="container">
                <nav className="navbar">
                    <div className="nav-brand">
                        <Building2 className="text-primary" size={32} color="var(--primary)" />
                        KekaClone
                    </div>
                    <div className="nav-links">
                        <a href="#features">Product</a>
                        <a href="#customers">Customers</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#resources">Resources</a>
                    </div>
                    <div className="nav-actions">
                        <button className="btn" onClick={onLogin}>Login</button>
                        <button className="btn btn-primary" onClick={onLogin}>Free Trial</button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <h1 className="hero-title animate-slide-up">
                        Everything you need to build <br />a great company
                    </h1>
                    <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        KekaClone is your people enabler. From automation of people processes to creating an engaged and driven culture, KekaClone is all you need to build a good to great company.
                    </p>
                    <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <button className="btn btn-primary" onClick={onLogin}>
                            Get Free Trial <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                        <button className="btn btn-outline">
                            Take a tour
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">Smart HR to outsmart the changing world</h2>
                    <div className="features-grid">
                        {features.map((feature, idx) => (
                            <div className="feature-card" key={idx}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-desc">{feature.desc}</p>
                                <button className="btn" style={{ padding: '0', marginTop: '1rem', color: 'var(--primary)', fontWeight: '600' }}>
                                    Learn more <ChevronRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
