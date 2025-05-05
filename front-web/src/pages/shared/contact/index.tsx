import { useState } from 'react';
import { User } from '../../../types/auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Upload, 
  Send,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { toast } from 'sonner';
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout';

interface ContactPageProps {
  user: User;
}

export const ContactPage = ({ user }: ContactPageProps) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'normal',
    attachments: null as File[] | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev: typeof formData) => ({ ...prev, attachments: Array.from(e.target.files || []) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Your message has been sent successfully!');
      resetForm();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      category: '',
      message: '',
      priority: 'normal',
      attachments: null,
    });
    
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Contact & Support</h1>
            <p className="text-sm text-gray-500">
              Send a message to the administration or request support
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>
                  Fill out the form below to send a message to the administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <Send className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Message Sent</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your message has been sent successfully. We'll get back to you as soon as possible.
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        placeholder="Enter the subject of your message" 
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="academic">Academic Inquiry</SelectItem>
                          <SelectItem value="administrative">Administrative</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Type your message here..." 
                      value={formData.message}
                      onChange={handleInputChange}
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value) => handleSelectChange('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Attachments (Optional)</Label>
                      <div className="flex items-center">
                        <label 
                          htmlFor="file-upload" 
                          className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Files</span>
                        </label>
                        <Input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange}
                          multiple
                        />
                        {formData.attachments && (
                          <span className="ml-2 text-sm text-gray-500">
                            {formData.attachments.length} file(s) selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button type="button" variant="outline" className="mr-2" onClick={resetForm}>
                      Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Other ways to reach us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-500">support@academy.edu</p>
                    <p className="text-sm text-gray-500">admin@academy.edu</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 mr-3 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-gray-500">Available during business hours</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">How long does it take to get a response?</h3>
                  <p className="text-sm text-gray-500">We typically respond within 24-48 hours on business days.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Who will see my message?</h3>
                  <p className="text-sm text-gray-500">Your message will be directed to the appropriate department based on the category you select.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Can I attach files?</h3>
                  <p className="text-sm text-gray-500">Yes, you can attach multiple files to your message. Supported formats include PDF, DOC, JPG, and PNG.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}; 