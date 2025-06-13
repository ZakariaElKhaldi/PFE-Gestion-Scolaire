import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, CreditCard, AlertCircle, CheckCircle, PlusCircle } from 'lucide-react';
import { paymentService, Subscription, PaymentMethod, CreateSubscriptionRequest } from '../../services/payment-service';
import { Textarea } from '../ui/textarea';

// Subscription form schema
const subscriptionSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  description: z.string().optional(),
  amount: z.number().min(1, 'Amount must be at least 1'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  paymentMethodId: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionManagerProps {
  onSubscriptionCreated?: (subscription: Subscription) => void;
}

export function SubscriptionManager({ onSubscriptionCreated }: SubscriptionManagerProps) {
  const [activeTab, setActiveTab] = useState('current');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: 0,
      frequency: 'monthly',
      startDate: new Date(),
    },
  });

  // Fetch subscriptions and payment methods
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [subscriptionsData, paymentMethodsData] = await Promise.all([
          paymentService.getSubscriptions(),
          paymentService.getPaymentMethods(),
        ]);
        setSubscriptions(subscriptionsData);
        setPaymentMethods(paymentMethodsData);
      } catch (err) {
        setError('Failed to load subscription data');
        console.error('Error loading subscription data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: SubscriptionFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const subscriptionData: CreateSubscriptionRequest = {
        name: data.name,
        description: data.description,
        amount: data.amount,
        frequency: data.frequency,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        paymentMethodId: data.paymentMethodId,
      };

      const newSubscription = await paymentService.createSubscription(subscriptionData);
      
      setSubscriptions([...subscriptions, newSubscription]);
      setSuccess('Subscription created successfully');
      form.reset();
      
      if (onSubscriptionCreated) {
        onSubscriptionCreated(newSubscription);
      }
      
      // Switch to current subscriptions tab
      setActiveTab('current');
    } catch (err) {
      setError('Failed to create subscription');
      console.error('Error creating subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async (subscriptionId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await paymentService.cancelSubscription(subscriptionId);
      
      // Update the subscription in the list
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: 'cancelled' } : sub
      ));
      
      setSuccess('Subscription cancelled successfully');
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error('Error cancelling subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Manage your recurring payments and subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Subscriptions</TabsTrigger>
            <TabsTrigger value="new">New Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {isLoading ? (
              <div className="text-center py-8">Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You don't have any active subscriptions.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('new')}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{subscription.name}</h3>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">${subscription.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Next Billing</p>
                          <p>{new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {subscription.description && (
                        <p className="mt-2 text-sm text-gray-600">{subscription.description}</p>
                      )}
                      {subscription.status === 'active' && (
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            disabled={isLoading}
                          >
                            Cancel Subscription
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="new">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Monthly Premium Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Subscription details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {paymentMethods.length > 0 && (
                  <FormField
                    control={form.control}
                    name="paymentMethodId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.type === 'credit_card' && (
                                  <div className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    {method.cardBrand} •••• {method.lastFour}
                                    {method.isDefault && " (Default)"}
                                  </div>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Subscription'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 