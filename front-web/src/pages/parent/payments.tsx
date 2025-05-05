import { useState, useEffect } from "react";
import { User } from "../../types/auth";
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { CreditCard, Download, Search, DollarSign, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { parentService } from "../../services/parent-service";
import { toast } from "react-hot-toast";

interface ParentPaymentsProps {
  user: User;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  balance: number;
  tuition: number;
  dueDate: string;
}

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  type: "tuition" | "fees" | "other";
  description: string;
  reference: string;
}

// Add this utility function at the top of the file, after imports
function parseDate(dateString: string): Date {
  // Check if we have a valid date string format
  if (!dateString) {
    console.log('[PARENT-PAYMENTS] parseDate - Empty date string provided');
    return new Date(); // Return current date as fallback
  }

  try {
    // Handle different formats and make sure we're using ISO format
    if (dateString.includes('T')) {
      // Already in ISO format
      return new Date(dateString);
    } else {
      // YYYY-MM-DD format, convert to ISO
      return new Date(dateString + 'T00:00:00Z');
    }
  } catch (err) {
    console.error('[PARENT-PAYMENTS] parseDate - Error parsing date:', err);
    return new Date(); // Return current date as fallback
  }
}

// Simple ErrorBoundary Component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('[PARENT-PAYMENTS] Window Error:', error);
      setHasError(true);
      setError(error.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p>An error occurred while displaying the payments page. Please refresh the page or try again later.</p>
          {error && <p className="mt-2 text-sm">{error.message}</p>}
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ParentPayments({ user }: ParentPaymentsProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");

  /**
   * Helper function for consistent error handling in component
   */
  const handleError = (context: string, error: any) => {
    // Log the error with context
    console.error(`[PARENT-PAYMENTS] ${context} - Error:`, error);
    
    // Log additional details if available
    if (error.response) {
      console.error(`[PARENT-PAYMENTS] ${context} - Status:`, error.response.status);
      console.error(`[PARENT-PAYMENTS] ${context} - Data:`, error.response.data);
    } else if (error.request) {
      console.error(`[PARENT-PAYMENTS] ${context} - No Response:`, error.request);
    } else {
      console.error(`[PARENT-PAYMENTS] ${context} - Message:`, error.message);
    }
    
    // Set component error state
    setError(`Failed to ${context.toLowerCase()}. Please try again later.`);
    
    // Show toast notification
    toast.error(`Error: ${context}`);
  };

  useEffect(() => {
    // Fetch children data when component mounts
    const fetchData = async () => {
      console.log('[PARENT-PAYMENTS] fetchData - Starting data fetch');
      setLoading(true);
      setError(null);
      try {
        // Fetch payments from the backend
        console.log('[PARENT-PAYMENTS] fetchData - Fetching payments');
        const paymentsData = await parentService.getPayments();
        setPayments(paymentsData);
        console.log('[PARENT-PAYMENTS] fetchData - Received payments:', paymentsData.length);
        
        // Get children information (we would normally have this from another API call)
        console.log('[PARENT-PAYMENTS] fetchData - Extracting children data');
        const childrenData = paymentsData.reduce((acc: any, payment: any) => {
          if (!acc.find((s: any) => s.id === payment.studentId)) {
            acc.push({
              id: payment.studentId,
              name: payment.studentName,
              grade: payment.grade || "Not specified",
              balance: payment.balance || 0,
              tuition: payment.amount || 0,
              dueDate: payment.dueDate || new Date().toISOString()
            });
          }
          return acc;
        }, []);
        
        setStudents(childrenData);
        console.log('[PARENT-PAYMENTS] fetchData - Extracted children:', childrenData.length);
      } catch (err) {
        handleError('fetch payments', err);
        
        // Fallback to mock data
        console.log('[PARENT-PAYMENTS] fetchData - Using mock student data');
        const now = new Date();
        
        // Create dates in ISO format for different timestamps
        const date1 = new Date(now.getFullYear(), now.getMonth(), 10).toISOString();
        const date2 = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();
        const date3 = new Date(now.getFullYear(), now.getMonth(), 5).toISOString();
        
        setStudents([
          {
            id: "s1",
            name: "John Smith",
            grade: "10th Grade",
            balance: 1500,
            tuition: 5000,
            dueDate: date1
          },
          {
            id: "s2",
            name: "Emma Johnson",
            grade: "8th Grade",
            balance: 750,
            tuition: 4500,
            dueDate: date2
          }
        ]);
        
        console.log('[PARENT-PAYMENTS] fetchData - Using mock payment data');
        setPayments([
          {
            id: "p1",
            studentId: "s1",
            studentName: "John Smith",
            amount: 500,
            date: date1,
            status: "completed",
            type: "tuition",
            description: "March Tuition Payment",
            reference: "TUI-2025-001"
          },
          {
            id: "p2",
            studentId: "s2",
            studentName: "Emma Johnson",
            amount: 250,
            date: date2,
            status: "completed",
            type: "fees",
            description: "Lab Fees",
            reference: "FEE-2025-001"
          },
          {
            id: "p3",
            studentId: "s1",
            studentName: "John Smith",
            amount: 1000,
            date: date3,
            status: "completed",
            type: "tuition",
            description: "February Tuition Payment",
            reference: "TUI-2025-002"
          }
        ]);
      } finally {
        setLoading(false);
        console.log('[PARENT-PAYMENTS] fetchData - Completed');
      }
    };

    fetchData();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesStudent = selectedStudent === "all" || payment.studentId === selectedStudent;
    const matchesSearch = 
      payment.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStudent && matchesSearch;
  });

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleMakePayment = (payment?: any) => {
    console.log('[PARENT-PAYMENTS] handleMakePayment - Setting up payment form', payment?.id);
    if (payment) {
      setSelectedPayment(payment);
      setPaymentAmount(payment.balance?.toString() || "");
    } else {
      setSelectedPayment(null);
      setPaymentAmount("");
    }
    setShowPaymentForm(true);
  };

  const handleDownloadReport = () => {
    // In a real application, this would generate and download a PDF report
    console.log('[PARENT-PAYMENTS] handleDownloadReport - Downloading payment report');
    toast.success("Generating payment report...");
  };

  const handleProcessPayment = async () => {
    console.log('[PARENT-PAYMENTS] handleProcessPayment - Processing payment');
    setLoading(true);
    try {
      if (!paymentAmount || isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
        console.error('[PARENT-PAYMENTS] handleProcessPayment - Invalid payment amount:', paymentAmount);
        toast.error("Please enter a valid amount");
        return;
      }

      if (selectedPayment) {
        console.log('[PARENT-PAYMENTS] handleProcessPayment - Processing existing payment:', selectedPayment.id);
        await parentService.makePayment(selectedPayment.id, {
          amount: parseFloat(paymentAmount),
          paymentMethod: paymentMethod,
        });
      } else {
        console.log('[PARENT-PAYMENTS] handleProcessPayment - Creating new payment for student');
        // Logic for creating a new payment would go here
      }

      toast.success("Payment successfully processed");
      console.log('[PARENT-PAYMENTS] handleProcessPayment - Payment processed successfully');
      
      // Refresh the payments list
      const updatedPayments = await parentService.getPayments();
      setPayments(updatedPayments);
      console.log('[PARENT-PAYMENTS] handleProcessPayment - Payment list refreshed:', updatedPayments.length);
      
      // Close the payment form
      setShowPaymentForm(false);
      setSelectedPayment(null);
      setPaymentAmount("");
    } catch (err) {
      console.error('[PARENT-PAYMENTS] handleProcessPayment - Error:', err);
      toast.error("An error occurred while processing the payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !payments.length) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout user={user}>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payments & Billing</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage payments and view billing history
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleMakePayment()}
                className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <CreditCard className="h-4 w-4" />
                Make Payment
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download Report
              </button>
            </div>
          </div>

          {/* Student Balances */}
          <div className="grid gap-6 md:grid-cols-2">
            {students.map(student => (
              <div key={student.id} className="rounded-lg border bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{student.name}</h2>
                    <p className="text-sm text-gray-500">{student.grade}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                      student.balance > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}>
                      Balance: ${student.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tuition</p>
                      <p className="text-lg font-semibold text-gray-900">${student.tuition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Due Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(() => {
                          try {
                            return format(parseDate(student.dueDate), "MMM d");
                          } catch (err) {
                            console.error(`[PARENT-PAYMENTS] Error formatting due date for student ${student.id}:`, err);
                            return 'Date unavailable';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {student.balance > 0 ? "Due" : "Paid"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="all">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            <div className="space-y-4">
              {filteredPayments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No payment records found.</p>
                </div>
              ) : (
                filteredPayments.map((payment) => {
                  const student = students.find(s => s.id === payment.studentId);
                  return (
                    <div key={payment.id} className="rounded-lg border bg-white p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`rounded-lg p-3 ${getStatusColor(payment.status)}`}>
                            {payment.status === "completed" ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : payment.status === "pending" ? (
                              <Clock className="h-5 w-5" />
                            ) : (
                              <AlertCircle className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{payment.description}</h3>
                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {(() => {
                                  try {
                                    // Use our robust date parsing function
                                    return format(parseDate(payment.date), "MMM d, yyyy");
                                  } catch (err) {
                                    console.error(`[PARENT-PAYMENTS] Error formatting date for payment ${payment.id}:`, err);
                                    return 'Date unavailable';
                                  }
                                })()}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${payment.amount.toFixed(2)}
                              </span>
                              {payment.studentName && (
                                <span className="text-gray-500">
                                  {payment.studentName}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              Reference: {payment.reference}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                          {payment.status === "pending" && (
                            <button
                              onClick={() => handleMakePayment(payment)}
                              className="ml-2 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment Form Modal */}
          {showPaymentForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedPayment ? `Pay ${selectedPayment.description}` : "Make a Payment"}
                </h2>
                
                <div className="space-y-4">
                  {!selectedPayment && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {students.map(student => (
                          <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Process Payment"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}