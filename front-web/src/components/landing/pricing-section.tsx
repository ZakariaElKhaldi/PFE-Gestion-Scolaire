import { Link } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

interface Testimonial {
  content: string;
  author: string;
  role: string;
  institution: string;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: '29',
    description: 'Perfect for small institutions just getting started',
    buttonText: 'Start with Basic',
    features: [
      'Up to 200 students',
      'Unlimited teachers',
      'Core student management',
      'Basic course management',
      'Attendance tracking',
      'Grade management',
      'Email support',
      'Mobile app access',
    ],
  },
  {
    name: 'Professional',
    price: '99',
    description: 'Ideal for growing schools needing advanced features',
    buttonText: 'Try Professional Free',
    features: [
      'Up to 1000 students',
      'Everything in Basic, plus:',
      'Advanced analytics',
      'Resource library',
      'Parent portal',
      'Financial management',
      'Live chat support',
      'API access',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '299',
    description: 'For large educational institutions with complex needs',
    buttonText: 'Contact Sales',
    features: [
      'Unlimited students',
      'Everything in Professional, plus:',
      'Custom integrations',
      'Advanced security features',
      'Dedicated account manager',
      'White labeling options',
      '24/7 phone support',
      'Onsite training',
    ],
  },
]

const testimonials: Testimonial[] = [
  {
    content: "Implementing this platform has revolutionized how we manage student records and communicate with parents. Our administrative workload has been reduced by at least 30%.",
    author: "Sarah Johnson",
    role: "Principal",
    institution: "Lincoln High School"
  },
  {
    content: "The feedback system has transformed how our teachers provide guidance to students. It's intuitive, easy to use, and has significantly improved student engagement.",
    author: "Michael Chen",
    role: "Department Head",
    institution: "Westfield Academy"
  },
]

const faqs = [
  {
    question: "How long does implementation take?",
    answer: "Most institutions are up and running within 2-4 weeks. Our team provides comprehensive onboarding support to ensure a smooth transition."
  },
  {
    question: "Can I migrate data from my existing system?",
    answer: "Yes, we provide data migration tools and services for all plan tiers. Our team will work with you to ensure all your historical data is properly transferred."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a 30-day free trial of our Professional plan with no credit card required. You can experience all features before making a decision."
  },
  {
    question: "What kind of support is included?",
    answer: "All plans include some level of support, ranging from email support in the Basic plan to 24/7 dedicated support in the Enterprise plan."
  },
]

export const PricingSection = () => {
  return (
    <div id="pricing" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Choose the right plan for your institution
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            All plans include our core features. Start with our 30-day free trial and upgrade anytime as your institution grows.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-16 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white ${
                plan.popular ? 'border-2 border-primary' : ''
              }`}
            >
              <div className="p-6 relative">
                {plan.popular && (
                  <span className="absolute top-0 right-0 -translate-y-1/2 transform px-4 py-1 rounded-full bg-primary text-white text-sm font-semibold">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <Link
                  to={plan.name === 'Enterprise' ? '/contact' : '/auth/sign-up'}
                  className={`mt-8 block w-full rounded-md py-3 px-5 text-center text-base font-medium md:py-4 md:text-lg ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </Link>
                {plan.name !== 'Enterprise' && (
                  <p className="mt-2 text-xs text-center text-gray-400">
                    No credit card required for trial
                  </p>
                )}
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide mb-4">Features included</h4>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-24">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center">
            What our customers are saying
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 relative"
              >
                <div className="absolute top-0 right-0 -mt-3 -mr-3 h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.content}"
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}, {testimonial.institution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-base text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-base text-gray-500">
              Have more questions? We're here to help.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              Contact our team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}