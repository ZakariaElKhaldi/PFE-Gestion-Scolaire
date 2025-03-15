import { UserGroupIcon, BookOpenIcon, ChatBubbleBottomCenterTextIcon, CreditCardIcon, AcademicCapIcon, ClockIcon, ChartBarIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Student Management',
    description: 'Efficiently manage student records, attendance, and academic progress with powerful filtering and reporting.',
    icon: <UserGroupIcon className="h-6 w-6" />,
  },
  {
    title: 'Course Management',
    description: 'Create and organize courses, assignments, and educational materials in one centralized platform.',
    icon: <BookOpenIcon className="h-6 w-6" />,
  },
  {
    title: 'Real-time Feedback',
    description: 'Enable seamless communication between teachers, students, and parents with our integrated feedback system.',
    icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />,
  },
  {
    title: 'Financial Management',
    description: 'Streamline fee collection, track expenses, and generate financial reports with our secure payment system.',
    icon: <CreditCardIcon className="h-6 w-6" />,
  },
  {
    title: 'Attendance Tracking',
    description: 'Monitor and analyze attendance patterns with automated tracking and notifications for absences.',
    icon: <ClockIcon className="h-6 w-6" />,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Make data-driven decisions with comprehensive analytics on student performance, attendance, and more.',
    icon: <ChartBarIcon className="h-6 w-6" />,
  },
  {
    title: 'Curriculum Planning',
    description: 'Design, share, and adapt curriculum with collaborative tools that support educational standards.',
    icon: <AcademicCapIcon className="h-6 w-6" />,
  },
  {
    title: 'Assessment & Grading',
    description: 'Create assessments, grade assignments, and provide detailed feedback to students efficiently.',
    icon: <DocumentCheckIcon className="h-6 w-6" />,
  },
]

export const FeaturesSection = () => {
  return (
    <div id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to transform your institution
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our comprehensive suite of tools helps educational institutions streamline administrative tasks, improve communication, and enhance learning outcomes.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative p-6 bg-white ring-1 ring-gray-200 rounded-lg hover:shadow-lg transition-all duration-300">
                <div className="p-3 rounded-md bg-primary/10 inline-flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlight */}
        <div className="mt-24">
          <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
            <div className="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0">
              <div>
                <div className="mt-6">
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    Feedback System: Enhancing Teacher-Student Communication
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Our integrated feedback system creates a collaborative environment where teachers can provide detailed feedback to students, and students can share their thoughts with teachers.
                  </p>
                  <div className="mt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Teacher and student feedback in one unified platform</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Real-time notifications and rating system</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Organized by course, with filtering and search capabilities</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0">
              <div className="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Teacher feedback interface screenshot"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Social proof section */}
        <div className="mt-24 bg-gray-50 rounded-xl overflow-hidden">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Trusted by educational institutions worldwide
              </h2>
              <p className="mt-3 text-xl text-gray-500 sm:mt-4">
                Thousands of schools rely on our platform every day
              </p>
            </div>
            <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
              <div className="flex flex-col">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                  Institutions
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-primary">
                  500+
                </dd>
              </div>
              <div className="flex flex-col mt-10 sm:mt-0">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                  Users
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-primary">
                  100k+
                </dd>
              </div>
              <div className="flex flex-col mt-10 sm:mt-0">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                  Countries
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-primary">
                  25+
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
