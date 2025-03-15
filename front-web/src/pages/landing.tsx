import { useEffect } from 'react'
import { Navbar } from '../components/layout/navbar'
import { HeroSection } from '../components/landing/hero-section'
import { FeaturesSection } from '../components/landing/features-section'
import { PricingSection } from '../components/landing/pricing-section'
import { ContactSection } from '../components/landing/contact-section'
import { Footer } from '../components/layout/footer'

// Testimonial component
const TestimonialsSection = () => {
  const testimonials = [
    {
      content: "EduManage has completely transformed how we manage our school operations. The intuitive interface and comprehensive features have saved us countless hours of administrative work.",
      author: "Sarah Johnson",
      role: "Principal",
      institution: "Westfield Academy"
    },
    {
      content: "As a teacher, I appreciate how easy it is to track student progress and communicate with parents. The feedback system has improved our parent-teacher relationships significantly.",
      author: "Michael Chen",
      role: "Mathematics Teacher",
      institution: "Oakridge High School"
    },
    {
      content: "The financial management tools have given us clear insights into our budgeting and spending. We've been able to allocate resources more effectively since implementing EduManage.",
      author: "Patricia Rodriguez",
      role: "Financial Administrator",
      institution: "Sunrise Educational Group"
    }
  ]

  return (
    <section id="testimonials" className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trusted by educators worldwide
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Don't just take our word for it. Here's what our users have to say about EduManage.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 flex flex-col h-full"
            >
              <div className="mb-4">
                {/* Quote icon */}
                <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-6 flex-grow">{testimonial.content}</p>
              <div className="mt-auto">
                <p className="text-gray-900 font-medium">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}, {testimonial.institution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats section component
const StatsSection = () => {
  return (
    <section className="bg-primary py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Trusted by schools across the globe
          </h2>
          <p className="mt-3 text-xl text-primary-100">
            Our platform is helping educational institutions modernize their operations
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center">
            <p className="text-4xl font-extrabold text-white">500+</p>
            <p className="mt-2 text-lg font-medium text-primary-100">Schools</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-4xl font-extrabold text-white">25K+</p>
            <p className="mt-2 text-lg font-medium text-primary-100">Teachers</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-4xl font-extrabold text-white">250K+</p>
            <p className="mt-2 text-lg font-medium text-primary-100">Students</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-4xl font-extrabold text-white">15+</p>
            <p className="mt-2 text-lg font-medium text-primary-100">Countries</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const LandingPage = () => {
  // Implement smooth scrolling
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => {
      document.removeEventListener('click', handleSmoothScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  )
}

export default LandingPage
