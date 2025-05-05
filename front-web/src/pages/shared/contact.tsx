import React from 'react';
import { UserResponse } from '@/types/auth';

interface ContactPageProps {
  user: UserResponse;
}

export const ContactPage: React.FC<ContactPageProps> = ({ user }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
      <div className="max-w-2xl">
        <form className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              id="subject"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};
