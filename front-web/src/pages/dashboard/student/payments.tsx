import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, FileText, AlertCircle, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentLayout } from '../../../components/dashboard/layout/student-layout';
import { User } from '../../../types/auth';
import { paymentService, Payment, Invoice, PaymentMethod, PaymentSummary, ProcessPaymentRequest } from '../../../services/payment-service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface StudentPaymentsProps {
  user: User;
}

export function StudentPayments({ user }: StudentPaymentsProps) {
  const [activeTab, setActiveTab] = useState('history');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Fetch payment data
  useEffect(() => {
    const fetchPaymentData = async () => {
      setIsLoading(true);
      try {
        // Fetch payment summary
        const summary = await paymentService.getPaymentSummary();
        setPaymentSummary(summary);

        // Fetch payment history - using the new method name
        const paymentHistory = await paymentService.getPayments({
          studentId: user.id
        });
        setPayments(paymentHistory);

        // Fetch invoices
        const invoiceList = await paymentService.getInvoices(user.id);
        setInvoices(invoiceList);

        // Fetch payment methods
        const methods = await paymentService.getPaymentMethods(user.id);
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error fetching payment data:', error);
        toast.error('Failed to load payment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, [user.id]);

  const handlePaymentComplete = async (paymentData: ProcessPaymentRequest) => {
    try {
      // Add student ID to payment data
      const paymentRequest = {
        ...paymentData,
        studentId: user.id
      };
      
      await paymentService.processPayment(paymentRequest);
      
      toast.success('Payment processed successfully');
      
      // Refresh payment data
      const summary = await paymentService.getPaymentSummary();
      setPaymentSummary(summary);
      
      const paymentHistory = await paymentService.getPayments({
        studentId: user.id
      });
      setPayments(paymentHistory);
      
      const invoiceList = await paymentService.getInvoices(user.id);
      setInvoices(invoiceList);
      
      setShowPaymentForm(false);
      setActiveTab('history');
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Payment processing failed. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const blob = await paymentService.downloadInvoice(invoiceId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  // Add payment method handler
  const handleAddPaymentMethod = async (methodData: any) => {
    try {
      await paymentService.addPaymentMethod({
        ...methodData,
        studentId: user.id
      });
      
      toast.success('Payment method added successfully');
      
      // Refresh payment methods
      const methods = await paymentService.getPaymentMethods(user.id);
      setPaymentMethods(methods);
      
      setActiveTab('methods');
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method. Please try again.');
    }
  };

  // Delete payment method handler
  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      await paymentService.deletePaymentMethod(methodId);
      
      toast.success('Payment method deleted successfully');
      
      // Refresh payment methods
      const methods = await paymentService.getPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method. Please try again.');
    }
  };

  // Set default payment method handler
  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      await paymentService.setDefaultPaymentMethod(methodId);
      
      toast.success('Default payment method updated');
      
      // Refresh payment methods
      const methods = await paymentService.getPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method. Please try again.');
    }
  };

  // Use a fallback if data is still loading
  const summaryData = paymentSummary || {
    totalPaid: 0,
    pendingPayments: 0,
    nextPaymentDue: null,
    overduePayments: 0
  };

  return (
    <StudentLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your payments and view invoices
            </p>
          </div>
        </div>
        
        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold">${summaryData.totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">${summaryData.pendingPayments.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <FileText className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Next Payment</p>
                  <p className="text-2xl font-bold">
                    {summaryData.nextPaymentDue 
                      ? format(new Date(summaryData.nextPaymentDue), 'MMM d')
                      : 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold">{summaryData.overduePayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="history">Payment History</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            </TabsList>
            
            <Button 
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="flex items-center"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {showPaymentForm ? 'Cancel' : 'Make a Payment'}
            </Button>
          </div>

          {showPaymentForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>
                  Complete your payment securely using your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Payment form would go here */}
                <div className="space-y-4">
                  {/* This would be replaced with a real payment form */}
                  <Button onClick={() => handlePaymentComplete({
                    amount: 50.00, 
                    description: 'Tuition payment',
                    paymentMethod: 'credit_card',
                    studentId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : undefined,
                    cardDetails: {
                      cardNumber: '4242424242424242',
                      expiryDate: '12/25',
                      cvv: '123',
                      cardholderName: 'John Doe'
                    }
                  })}>
                    Process Demo Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      View your recent payment transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading payment history...</p>
                    ) : payments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Date</th>
                              <th className="text-left py-3 px-4">Description</th>
                              <th className="text-left py-3 px-4">Amount</th>
                              <th className="text-left py-3 px-4">Status</th>
                              <th className="text-left py-3 px-4">Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment) => (
                              <tr key={payment.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                                </td>
                                <td className="py-3 px-4">{payment.description}</td>
                                <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    payment.status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">{payment.paymentMethod || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                    ) : (
                      <p>No payment history found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="invoices" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>
                      View and download your invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading invoices...</p>
                    ) : invoices.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Invoice #</th>
                              <th className="text-left py-3 px-4">Issue Date</th>
                              <th className="text-left py-3 px-4">Due Date</th>
                              <th className="text-left py-3 px-4">Amount</th>
                              <th className="text-left py-3 px-4">Status</th>
                              <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{invoice.invoiceNumber}</td>
                                <td className="py-3 px-4">
                                  {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                                </td>
                                <td className="py-3 px-4">
                                  {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                                </td>
                                <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    invoice.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    invoice.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    invoice.status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownloadInvoice(invoice.id)}
                                  >
                                    <Receipt className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                                </td>
                              </tr>
                      ))}
                          </tbody>
                        </table>
                    </div>
                    ) : (
                      <p>No invoices found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="methods" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your saved payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading payment methods...</p>
                    ) : paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div 
                            key={method.id} 
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <CreditCard className="h-6 w-6" />
                              <div>
                                <p className="font-medium">
                                  {method.type === 'credit_card' ? 'Credit Card' : 
                                   method.type === 'paypal' ? 'PayPal' : 'Bank Account'}
                                  {method.lastFour ? ` ending in ${method.lastFour}` : ''}
                                </p>
                                {method.expiryDate && (
                                  <p className="text-sm text-muted-foreground">
                                    Expires {method.expiryDate}
                                  </p>
                                )}
                                {method.isDefault && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!method.isDefault && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeletePaymentMethod(method.id)}
                              >
                                Delete
                              </Button>
                          </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="mb-4">No payment methods found</p>
                        <Button onClick={() => {
                          // This would open a form to add a payment method
                          toast.error('Payment method form not implemented in this demo');
                        }}>
                        Add Payment Method
                      </Button>
                    </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </StudentLayout>
  );
} 

// Only use default export, not both
export default StudentPayments;