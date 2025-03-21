import { useState } from 'react'
import { EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    role: '',
    message: '',
  })
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [showDemo, setShowDemo] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('submitting')
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData)
      setFormStatus('success')
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          institution: '',
          role: '',
          message: '',
        })
        setFormStatus('idle')
      }, 3000)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleDemoForm = () => {
    setShowDemo(!showDemo)
  }

  return (
    <div id="contact" className="bg-gradient-to-b from-white to-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-base font-semibold text-primary tracking-wide uppercase">Contact Us</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Ready to transform your educational institution?
          </h2>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Get in touch with our team to learn how our platform can address your specific needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact information column */}
          <div>
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
              <div className="px-6 py-12 sm:p-12">
                <h3 className="text-2xl font-bold text-gray-900">Contact information</h3>
                <p className="mt-3 text-lg text-gray-500">
                  Have questions or need a personalized demo? Our education specialists are here to help you.
                </p>
                <dl className="mt-8 space-y-6">
                  <dt><span className="sr-only">Phone number</span></dt>
                  <dd className="flex text-base text-gray-500">
                    <PhoneIcon className="flex-shrink-0 h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="ml-3">+1 (555) 123-4567</span>
                  </dd>
                  <dt><span className="sr-only">Email</span></dt>
                  <dd className="flex text-base text-gray-500">
                    <EnvelopeIcon className="flex-shrink-0 h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="ml-3">edu-support@example.com</span>
                  </dd>
                  <dt><span className="sr-only">Address</span></dt>
                  <dd className="flex text-base text-gray-500">
                    <MapPinIcon className="flex-shrink-0 h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="ml-3">123 Education Lane, Suite 500<br />San Francisco, CA 94107</span>
                  </dd>
                </dl>
                
                <div className="mt-12">
                  <button
                    onClick={toggleDemoForm}
                    className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <CalendarDaysIcon className="mr-2 h-5 w-5" />
                    Schedule a Demo
                  </button>
                </div>
                
                <div className="mt-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">Follow us on social media</p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Facebook</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-sm text-gray-500">Trusted by 500+ schools worldwide</span>
                </div>
              </div>
              
              <div className="px-6 py-8 flex justify-between items-center">
                <img className="h-8" src="https://tailwindui.com/img/logos/tuple-logo-gray-400.svg" alt="Tuple" />
                <img className="h-8" src="https://tailwindui.com/img/logos/mirage-logo-gray-400.svg" alt="Mirage" />
                <img className="h-8" src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg" alt="StaticKit" />
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="px-6 py-12 sm:p-12">
              {showDemo ? (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Schedule a Demo</h3>
                  <p className="mt-3 text-lg text-gray-500">
                    Let us show you how our platform can work for your institution.
                  </p>
                  
                  {formStatus === 'success' ? (
                    <div className="mt-8 rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Demo Request Received</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Thank you for your interest! A member of our team will contact you within 24 hours to schedule your personalized demo.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                            Institution Name <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="institution"
                              id="institution"
                              value={formData.institution}
                              onChange={handleChange}
                              required
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Your Role <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              required
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            >
                              <option value="">Select your role</option>
                              <option value="administrator">Administrator</option>
                              <option value="principal">Principal/Head</option>
                              <option value="teacher">Teacher</option>
                              <option value="IT">IT Staff</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                          Additional Information
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            placeholder="Tell us about your institution and specific needs..."
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <input
                            id="privacy"
                            name="privacy"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">
                            By selecting this, you agree to our{' '}
                            <a href="/privacy" className="font-medium text-primary hover:text-primary/90">
                              Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a href="/terms" className="font-medium text-primary hover:text-primary/90">
                              Terms of Service
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={toggleDemoForm}
                          className="flex-1 py-3 px-4 inline-flex justify-center items-center border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Back to Contact
                        </button>
                        <button
                          type="submit"
                          disabled={formStatus === 'submitting'}
                          className="flex-1 py-3 px-4 inline-flex justify-center items-center border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {formStatus === 'submitting' ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            'Request Demo'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Send us a message</h3>
                  <p className="mt-3 text-lg text-gray-500">
                    Have questions? Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                  
                  {formStatus === 'success' ? (
                    <div className="mt-8 rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Message Sent Successfully</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Thank you for contacting us! A member of our team will be in touch with you shortly.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                        <div className="sm:col-span-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                            Institution Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="institution"
                              id="institution"
                              value={formData.institution}
                              onChange={handleChange}
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Your Role
                          </label>
                          <div className="mt-1">
                            <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                            >
                              <option value="">Select your role</option>
                              <option value="administrator">Administrator</option>
                              <option value="principal">Principal/Head</option>
                              <option value="teacher">Teacher</option>
                              <option value="IT">IT Staff</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Message <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="message"
                              name="message"
                              rows={4}
                              value={formData.message}
                              onChange={handleChange}
                              required
                              className="py-3 px-4 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md"
                              placeholder="Tell us how we can help you..."
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <input
                                id="privacy"
                                name="privacy"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-gray-500">
                                By selecting this, you agree to our{' '}
                                <a href="/privacy" className="font-medium text-primary hover:text-primary/90">
                                  Privacy Policy
                                </a>{' '}
                                and{' '}
                                <a href="/terms" className="font-medium text-primary hover:text-primary/90">
                                  Terms of Service
                                </a>
                                .
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {formStatus === 'submitting' ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
