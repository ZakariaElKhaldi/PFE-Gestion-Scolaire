import { UserGroupIcon, BookOpenIcon, ChatBubbleBottomCenterTextIcon, CreditCardIcon, AcademicCapIcon, ClockIcon, ChartBarIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Student Management',
    description: 'Efficiently track enrollment, attendance, and academic progress with comprehensive student profiles and analytics.',
    icon: <UserGroupIcon className="h-6 w-6" />,
  },
  {
    title: 'Course Management',
    description: 'Create, organize, and manage courses with built-in lesson planning, assignments, and educational resources.',
    icon: <BookOpenIcon className="h-6 w-6" />,
  },
  {
    title: 'Communication Hub',
    description: 'Connect teachers, students, and parents through integrated messaging, announcements, and real-time feedback.',
    icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />,
  },
  {
    title: 'Financial Tracking',
    description: 'Simplify fee collection, manage budgets, and generate detailed financial reports with secure payment processing.',
    icon: <CreditCardIcon className="h-6 w-6" />,
  },
  {
    title: 'Attendance System',
    description: 'Automate attendance tracking with QR codes, biometrics, or manual entry, plus absence notifications and reports.',
    icon: <ClockIcon className="h-6 w-6" />,
  },
  {
    title: 'Data Analytics',
    description: 'Gain actionable insights with data visualization tools covering student performance, attendance, and institutional metrics.',
    icon: <ChartBarIcon className="h-6 w-6" />,
  },
  {
    title: 'Curriculum Builder',
    description: 'Design and share curriculum with collaborative tools that support educational standards and learning outcomes.',
    icon: <AcademicCapIcon className="h-6 w-6" />,
  },
  {
    title: 'Assessment Tools',
    description: 'Create digital assessments, automate grading, and provide personalized feedback to students efficiently.',
    icon: <DocumentCheckIcon className="h-6 w-6" />,
  },
]

export const FeaturesSection = () => {
  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <p className="text-base font-semibold text-primary tracking-wide uppercase">Comprehensive Features</p>
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to transform education management
          </h2>
          <p className="mt-4 max-w-3xl text-xl text-gray-500 lg:mx-auto">
            Our platform provides powerful tools for administrators, teachers, students, and parents to streamline workflows and improve educational outcomes.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={feature.title} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
              <div className="relative p-6 bg-white ring-1 ring-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div>
                  <div className="p-3 rounded-md bg-primary/10 inline-flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                </div>
                <p className="mt-2 text-base text-gray-500 flex-grow">{feature.description}</p>
                <a href="#" className="mt-4 text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center">
                  Learn more
                  <svg className="ml-1 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlight section */}
        <div className="mt-32">
          <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
            <div className="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2">
              <div>
                <div>
                  <span className="h-12 w-12 rounded-md flex items-center justify-center bg-primary">
                    <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    Real-time Communication & Feedback System
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Our integrated platform creates a collaborative environment where teachers, students, and parents can stay connected and engaged throughout the learning journey.
                  </p>
                  <div className="mt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Instant messaging for teachers, students, and parents</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Automated notifications for grades, assignments, and events</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Detailed feedback tools with audio, video, and text options</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Data-driven insights on student engagement and participation</p>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <a href="#" className="text-base font-medium text-primary hover:text-primary/80 inline-flex items-center">
                        See how schools improve communication
                        <svg className="ml-1 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-start-1">
              <div className="pr-4 -ml-48 sm:pr-6 md:-ml-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Communication dashboard showing teacher-student interactions"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Second feature highlight - reversed */}
        <div className="mt-32">
          <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
            <div className="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0">
              <div>
                <div>
                  <span className="h-12 w-12 rounded-md flex items-center justify-center bg-primary">
                    <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    Data-Driven Analytics Dashboard
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Turn your education data into actionable insights with powerful visualizations that help you make informed decisions to improve student outcomes.
                  </p>
                  <div className="mt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Customizable dashboards for administrators, teachers, and parents</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Visual reporting tools for tracking progress and performance</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">AI-powered insights and recommendations for improvement</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-500">Exportable reports for accreditation and compliance</p>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <a href="#" className="text-base font-medium text-primary hover:text-primary/80 inline-flex items-center">
                        Explore analytics capabilities
                        <svg className="ml-1 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0">
              <div className="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Analytics dashboard with charts and data visualizations"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
