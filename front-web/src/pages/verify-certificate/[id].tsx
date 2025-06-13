import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { certificateService, VerificationResult } from '../../services/certificate.service';
import { CheckCircle, XCircle, Clock, AlertTriangle, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';

export default function VerifyCertificate() {
  const router = useRouter();
  const { id } = router.query;
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyCertificate = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const result = await certificateService.verifyCertificate(id as string);
        setVerificationResult(result);
      } catch (err) {
        console.error('Error verifying certificate:', err);
        setError('Failed to verify certificate. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      verifyCertificate();
    }
  }, [id]);
  
  const handleDownload = (certificateId: string) => {
    try {
      const url = certificateService.getDownloadUrl(certificateId);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Failed to download certificate:", error);
      toast.error("Failed to download certificate. Please try again later.");
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'revoked':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-8 w-8" />;
      case 'expired':
        return <XCircle className="h-8 w-8" />;
      case 'pending':
        return <Clock className="h-8 w-8" />;
      case 'revoked':
        return <AlertTriangle className="h-8 w-8" />;
      default:
        return <AlertTriangle className="h-8 w-8" />;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Verifying certificate...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <XCircle className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center">
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!verificationResult?.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <XCircle className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-center text-gray-600 mb-6">
            The certificate you are looking for could not be found or is invalid.
          </p>
          <div className="flex justify-center">
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const certificate = verificationResult.certificate;
  
  return (
    <>
      <Head>
        <title>Certificate Verification | School Management System</title>
        <meta name="description" content="Verify the authenticity of a certificate" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
            <p className="mt-2 text-gray-600">
              Verify the authenticity of certificates issued by our institution
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className={`p-4 ${verificationResult.isValid ? 'bg-green-50' : 'bg-red-50'} flex items-center justify-between`}>
              <div className="flex items-center">
                {verificationResult.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                )}
                <span className={verificationResult.isValid ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                  {verificationResult.message}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(certificate.id)}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Verification link copied to clipboard');
                  }}
                  className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${getStatusColor(certificate.status)}`}>
                    {getStatusIcon(certificate.status)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{certificate.title}</h2>
                    <p className="text-gray-600">{certificate.issuer}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  ID: {certificate.verificationId}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Certificate Details</h3>
                <p className="text-gray-700 mb-4">{certificate.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Issue Date</h4>
                    <p className="mt-1">{format(new Date(certificate.issueDate), 'MMMM d, yyyy')}</p>
                  </div>
                  {certificate.expiryDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Expiry Date</h4>
                      <p className="mt-1">{format(new Date(certificate.expiryDate), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Type</h4>
                    <p className="mt-1">{certificate.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className="mt-1 flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        certificate.status === 'valid' ? 'bg-green-500' : 
                        certificate.status === 'expired' ? 'bg-red-500' : 
                        certificate.status === 'pending' ? 'bg-yellow-500' : 
                        'bg-gray-500'
                      }`}></span>
                      {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                    </p>
                  </div>
                </div>
                
                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 