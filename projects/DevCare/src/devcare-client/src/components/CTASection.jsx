import { Link } from 'react-router-dom';

function CTASection() {
  return (
    <section id="cta" className="site-container pt-24 pb-4 sm:pt-32 sm:pb-8 text-center">
      <div className="max-w-4xl mx-auto rounded-[3rem] bg-[var(--color-secondary)] p-12 sm:p-20 text-white shadow-2xl relative overflow-hidden isolate">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl -z-10"></div>

        <h2 className="text-4xl font-bold sm:text-5xl mb-8 leading-tight !text-white">
          Ready to Transform Your <span className="text-[var(--color-primary)]">Practice?</span>
        </h2>
        
        <p className="max-w-2xl mx-auto text-gray-300 text-lg sm:text-xl mb-12 leading-relaxed">
          Simple, effective, and evidence-based. Our three-step process ensures you get clinical-grade care at home.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/register" className="btn-primary bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-12 py-4 text-lg">
            Get Started Free
          </Link>
          <Link to="/login" className="px-12 py-4 text-lg font-semibold border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
