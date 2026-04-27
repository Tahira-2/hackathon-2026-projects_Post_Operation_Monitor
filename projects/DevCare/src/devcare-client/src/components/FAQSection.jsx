import React, { useState } from 'react';

const faqs = [
  {
    question: "Is DevCare a replacement for my physical therapist?",
    answer: "No, DevCare is designed to complement your clinical care. It helps you perform your prescribed exercises correctly at home and provides your therapist with accurate data to monitor your progress."
  },
  {
    question: "What equipment do I need to get started?",
    answer: "All you need is a standard webcam on your laptop or a smartphone camera. DevCare's AI uses computer vision to track your movements without the need for expensive wearable sensors or hardware."
  },
  {
    question: "How accurate is the AI posture detection?",
    answer: "Our AI uses advanced skeletal mapping to track joint angles with high precision. It provides real-time feedback that matches clinical standards, helping you maintain perfect form during every session."
  },
  {
    question: "Is my personal health data secure?",
    answer: "Absolutely. We use end-to-end encryption for all video sessions and medical data. Your records are only accessible to you and the clinicians you explicitly choose to share them with."
  },
  {
    question: "Can I use DevCare on my mobile phone?",
    answer: "Yes, DevCare is fully responsive and works seamlessly on mobile browsers. You can also use your phone as a camera while viewing your exercises on a larger screen."
  }
];

function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-[#F8FAFC] pt-4 pb-16 sm:pt-8 sm:pb-24">
      <div className="site-container">
        <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-12 sm:p-20 shadow-xl border border-[var(--color-border)] relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-soft)] opacity-20 rounded-full blur-3xl -z-10 -mr-32 -mt-32"></div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl text-[var(--color-secondary)] mb-6">
              Frequently Asked <span className="text-[var(--color-primary)]">Questions</span>
            </h2>
            <p className="max-w-2xl mx-auto text-[var(--color-text-muted)] text-lg leading-relaxed">
              Everything you need to know about the DevCare platform and how it transforms your rehabilitation journey.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`transition-all duration-300 rounded-2xl ${
                  activeIndex === index ? 'bg-[var(--color-primary-soft)] shadow-sm' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <button
                  className="w-full text-left px-8 py-7 flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className={`text-lg font-bold transition-colors duration-300 ${activeIndex === index ? 'text-[var(--color-primary-dark)]' : 'text-[var(--color-secondary)]'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeIndex === index ? 'bg-[var(--color-primary)] text-white rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-8 pb-8 text-[var(--color-text-muted)] text-base leading-relaxed border-t border-white/50 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
