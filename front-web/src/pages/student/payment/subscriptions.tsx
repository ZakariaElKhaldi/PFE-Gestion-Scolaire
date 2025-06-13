import React from 'react';
import { SubscriptionManager } from '../../../components/payment/SubscriptionManager';

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Subscriptions</h1>
        <p className="text-gray-600">
          View and manage your recurring payments and subscriptions.
        </p>
      </div>
      
      <SubscriptionManager />
    </div>
  );
} 