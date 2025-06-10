import { useState } from 'react';
import { User } from '@/types/auth';
import styles from './ContactPage.module.css';

interface ContactPageProps {
  user: User;
}

export const ContactPage = ({ user }: ContactPageProps) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'tickets' | 'faq'>('contact');
  const [formData, setFormData] = useState({
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    department: '',
    urgency: 'medium',
    title: '',
    description: '',
    attachments: [] as File[]
  });
  const [tickets] = useState([
    { id: '001', title: 'Login Issues', status: 'Open', date: '2024-01-15', priority: 'High' },
    { id: '002', title: 'Grade Question', status: 'Resolved', date: '2024-01-10', priority: 'Medium' },
    { id: '003', title: 'Schedule Update', status: 'In Progress', date: '2024-01-08', priority: 'Low' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ 
        ...prev, 
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    // Handle form submission
  };

  const faqData = [
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email."
    },
    {
      question: "How can I view my child's grades?",
      answer: "Navigate to the 'Progress' section in your dashboard to view detailed grade reports."
    },
    {
      question: "Who can I contact for technical issues?",
      answer: "Use this contact form and select 'Technical Support' as the department for fastest response."
    },
    {
      question: "How do I update my contact information?",
      answer: "Go to 'Profile Settings' in your account menu to update your personal information."
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Help & Support Center
          </h1>
          <p className={styles.subtitle}>
            We're here to help you with any questions or concerns
                    </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {[
            { key: 'contact', label: 'New Request', icon: '📝' },
            { key: 'tickets', label: 'My Tickets', icon: '🎫' },
            { key: 'faq', label: 'FAQ', icon: '❓' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ''}`}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contact Form Tab */}
        {activeTab === 'contact' && (
          <div className={styles.contactGrid}>
            {/* Form */}
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>
                Submit a New Request
              </h2>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                      aria-describedby="name-help"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${styles.input} ${styles.readOnly}`}
                      readOnly
                      aria-describedby="email-help"
                    />
                  </div>
                </div>

                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="department" className={styles.label}>
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                      aria-describedby="department-help"
                    >
                      <option value="">Select Department</option>
                      <option value="academic">📚 Academic Affairs</option>
                      <option value="technical">💻 Technical Support</option>
                      <option value="financial">💰 Financial Services</option>
                      <option value="administrative">📋 Administration</option>
                      <option value="counseling">🧠 Student Counseling</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="urgency" className={styles.label}>
                      Urgency Level
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className={styles.input}
                      aria-describedby="urgency-help"
                    >
                      <option value="low">🟢 Low - General inquiry</option>
                      <option value="medium">🟡 Medium - Need assistance</option>
                      <option value="high">🟠 High - Urgent issue</option>
                      <option value="critical">🔴 Critical - Emergency</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="title" className={styles.label}>
                    Request Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief description of your request"
                    required
                    className={styles.input}
                    aria-describedby="title-help"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="description" className={styles.label}>
                    Detailed Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Please provide as much detail as possible..."
                    required
                    rows={6}
                    className={styles.textarea}
                    aria-describedby="description-help"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="file-upload" className={styles.label}>
                    Attachments (Optional)
                  </label>
                  <div className={styles.fileUploadArea}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className={styles.fileInput}
                      id="file-upload"
                      aria-describedby="file-help"
                    />
                    <label htmlFor="file-upload">
                      <div className={styles.fileIcon}>📎</div>
                      <p className={styles.fileText}>
                        Click to upload files or drag and drop
                      </p>
                      <p className={styles.fileSubtext}>
                        PNG, JPG, PDF up to 10MB each
                      </p>
                    </label>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div className={styles.attachmentList}>
                      {formData.attachments.map((file, index) => (
                        <div key={index} className={styles.attachmentItem}>
                          <span className={styles.attachmentName}>📄 {file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className={styles.removeButton}
                            aria-label={`Remove ${file.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  🚀 Submit Request
                </button>
              </form>
            </div>

            {/* Quick Help Sidebar */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>
                  🚀 Quick Actions
                </h3>
                <div className={styles.quickActions}>
                  <button className={`${styles.quickActionButton} ${styles.reset}`}>
                    🔑 Reset Password
                  </button>
                  <button className={`${styles.quickActionButton} ${styles.grades}`}>
                    📊 View Grades
                  </button>
                  <button className={`${styles.quickActionButton} ${styles.schedule}`}>
                    📅 Schedule Help
                  </button>
                  <button className={`${styles.quickActionButton} ${styles.chat}`}>
                    💬 Live Chat
                  </button>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>
                  📞 Contact Info
                </h3>
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <div className={styles.contactHeader}>
                      <span className={styles.contactIcon}>📧</span>
                      <strong className={styles.contactTitle}>Email Support</strong>
                    </div>
                    <div className={styles.contactDetails}>
                      support@academy.edu<br />
                      Response within 24 hours
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <div className={styles.contactHeader}>
                      <span className={styles.contactIcon}>📱</span>
                      <strong className={styles.contactTitle}>Phone Support</strong>
                    </div>
                    <div className={styles.contactDetails}>
                      +1 (555) 123-4567<br />
                      Mon-Fri: 8AM - 6PM
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <div className={styles.contactHeader}>
                      <span className={styles.contactIcon}>🏢</span>
                      <strong className={styles.contactTitle}>Office Hours</strong>
                    </div>
                    <div className={styles.contactDetails}>
                      Building A, Room 101<br />
                      Mon-Fri: 9AM - 5PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className={styles.fullWidthCard}>
            <h2 className={styles.formTitle}>
              📋 My Support Tickets
            </h2>
            
            <div className={styles.ticketList}>
              {tickets.map(ticket => (
                <div key={ticket.id} className={styles.ticketItem}>
                  <div className={styles.ticketHeader}>
                    <div className={styles.ticketInfo}>
                      <h3>
                        #{ticket.id} - {ticket.title}
                      </h3>
                      <p className={styles.ticketDate}>
                        Created on {ticket.date}
                      </p>
                    </div>
                    <div className={styles.ticketBadges}>
                      <span className={`${styles.badge} ${
                        ticket.status === 'Open' ? styles.open : 
                        ticket.status === 'In Progress' ? styles.inProgress : styles.resolved
                      }`}>
                        {ticket.status}
                      </span>
                      <span className={`${styles.badge} ${
                        ticket.priority === 'High' ? styles.high : 
                        ticket.priority === 'Medium' ? styles.medium : styles.low
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <div className={styles.ticketFooter}>
                    <button className={styles.viewButton}>
                      View Details
                    </button>
                    <span className={styles.lastUpdated}>
                      Last updated 2 hours ago
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className={styles.fullWidthCard}>
            <h2 className={styles.formTitle}>
              ❓ Frequently Asked Questions
            </h2>
            
            <div className={styles.faqList}>
              {faqData.map((faq, index) => (
                <div key={index} className={styles.faqItem}>
                  <div className={styles.faqQuestion}>
                    <h3>{faq.question}</h3>
                  </div>
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.faqCta}>
              <h3>Can't find what you're looking for?</h3>
              <p>Our support team is here to help you with any questions.</p>
              <button
                onClick={() => setActiveTab('contact')}
                className={styles.ctaButton}
              >
                Submit a Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;

