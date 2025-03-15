import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className={`ml-3 text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-gray-900 dark:text-white'}`}>
              EduManage
            </span>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className={`${scrolled ? 'text-gray-700' : 'text-gray-700 dark:text-gray-200'} hover:text-primary font-medium transition-colors duration-300`}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className={`${scrolled ? 'text-gray-700' : 'text-gray-700 dark:text-gray-200'} hover:text-primary font-medium transition-colors duration-300`}
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              className={`${scrolled ? 'text-gray-700' : 'text-gray-700 dark:text-gray-200'} hover:text-primary font-medium transition-colors duration-300`}
            >
              Contact
            </a>
            <Link
              to="/auth/sign-in"
              className={`${scrolled ? 'text-gray-700' : 'text-gray-700 dark:text-gray-200'} hover:text-primary font-medium transition-colors duration-300`}
            >
              Sign In
            </Link>
            <Link
              to="/auth/sign-up"
              className="ml-3 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary`}
              aria-expanded="false"
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div
        className={`md:hidden absolute w-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 invisible'
        } overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a
            href="#features"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors duration-300"
          >
            Pricing
          </a>
          <a
            href="#contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors duration-300"
          >
            Contact
          </a>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-5">
            <Link
              to="/auth/sign-in"
              className="block w-full px-5 py-3 text-center font-medium text-primary bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <Link
              to="/auth/sign-up"
              className="block w-full px-5 py-3 text-center font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-300 rounded-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
