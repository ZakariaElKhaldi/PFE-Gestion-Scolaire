import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CreditCard, Receipt, CalendarClock, History, CreditCardIcon } from 'lucide-react';

export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Center</h1>
        <p className="text-gray-600">
          Manage your payments, invoices, and subscriptions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Make a Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Make a Payment
            </CardTitle>
            <CardDescription>
              Pay tuition fees and other expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Process one-time payments for tuition, books, activities, and other school expenses.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/student/payment/make-payment">Make Payment</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Payment History
            </CardTitle>
            <CardDescription>
              View your past payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Access your payment history, download receipts, and view transaction details.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/payment/history">View History</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Invoices
            </CardTitle>
            <CardDescription>
              View and download invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Access all your invoices, check payment status, and download for your records.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/payment/invoices">View Invoices</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="h-5 w-5 mr-2" />
              Subscriptions
            </CardTitle>
            <CardDescription>
              Manage recurring payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Set up and manage recurring payments for tuition plans, meal plans, and other subscriptions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/payment/subscriptions">Manage Subscriptions</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Add, remove, or update your payment methods. Set default payment options.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/payment/methods">Manage Methods</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 