import { useState, useEffect } from "react";
import { User } from "../../types/auth";
import { StudentLayout } from "../../components/dashboard/layout/student-layout";
import { Award, Search, Download, CheckCircle, AlertCircle, Calendar, Clock, X } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { certificateService, Certificate } from "../../services/certificate.service";
import { toast } from "react-hot-toast";

interface StudentCertificatesProps {
  user: User;
}

export default function StudentCertificates({ user }: StudentCertificatesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Fetch certificates when component mounts
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const data = await certificateService.getStudentCertificates();
        setCertificates(data);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
        toast.error("Failed to load certificates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates based on search and type
  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = 
      certificate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || certificate.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Get unique certificate types
  const certificateTypes = Array.from(new Set(certificates.map(cert => cert.type)));

  // Handle certificate sharing
  const handleShare = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowShareModal(true);
  };

  // Handle certificate verification
  const handleVerify = async (verificationId: string) => {
    try {
      const result = await certificateService.verifyCertificate(verificationId);
      
      if (result.isValid) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to verify certificate:", error);
      toast.error("Failed to verify certificate. Please try again later.");
    }
  };

  // Handle certificate download
  const handleDownload = (id: string) => {
    try {
      // Get the download URL
      const url = certificateService.getDownloadUrl(id);
      
      // Create an anchor element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to the document and click
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      toast.success("Downloading certificate...");
    } catch (error) {
      console.error("Failed to download certificate:", error);
      toast.error("Failed to download certificate. Please try again later.");
    }
  };

  // Get status color
  const getStatusColor = (status: Certificate["status"]) => {
    switch (status) {
      case "valid":
        return "text-green-600 bg-green-100";
      case "expired":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "revoked":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status: Certificate["status"]) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-5 w-5" />;
      case "expired":
        return <AlertCircle className="h-5 w-5" />;
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "revoked":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  // Check if certificate is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  // Generate verification URL for QR code
  const getVerificationUrl = (verificationId: string) => {
    return `${window.location.origin}/verify-certificate/${verificationId}`;
  };

  // Copy verification URL to clipboard
  const copyVerificationUrl = (verificationId: string) => {
    const url = getVerificationUrl(verificationId);
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied to clipboard");
  };

  if (loading) {
    return (
      <StudentLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your certificates and achievements
            </p>
          </div>
        </div>

        {/* Certificate Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Certificates</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{certificates.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Valid Certificates</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {certificates.filter(c => c.status === "valid").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Expiring Soon</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">
              {certificates.filter(c => isExpiringSoon(c.expiryDate)).length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Expired</h3>
            <p className="mt-2 text-3xl font-semibold text-red-600">
              {certificates.filter(c => c.status === "expired").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            {certificateTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Certificates List */}
        <div className="space-y-4">
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <div key={certificate.id} className="rounded-lg border bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-3 ${getStatusColor(certificate.status)}`}>
                      {getStatusIcon(certificate.status)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{certificate.title}</h3>
                      <p className="text-sm text-gray-500">{certificate.issuer}</p>
                      <p className="mt-1 text-sm text-gray-600">{certificate.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {certificate.skills && certificate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Issued: {format(new Date(certificate.issueDate), "MMM d, yyyy")}
                        </span>
                        {certificate.expiryDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Expires: {format(new Date(certificate.expiryDate), "MMM d, yyyy")}
                            {isExpiringSoon(certificate.expiryDate) && (
                              <span className="ml-2 text-xs font-medium text-yellow-600">
                                Expiring Soon
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(certificate.verificationId)}
                      className="rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-100"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleShare(certificate)}
                      className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => handleDownload(certificate.id)}
                      className="rounded-md bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border bg-white p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No certificates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedType !== "all"
                ? "Try adjusting your filters to find your certificates."
                : "You don't have any certificates yet. Complete courses to earn certificates!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Share Certificate Modal */}
      {showShareModal && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Share Certificate</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-gray-900">{selectedCertificate.title}</h4>
                <p className="text-sm text-gray-500">{selectedCertificate.issuer}</p>
              </div>
              
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {selectedCertificate.qrCodeUrl ? (
                  <img 
                    src={`http://localhost:3001/api${selectedCertificate.qrCodeUrl}`}
                    alt="Certificate QR Code"
                    className="w-48 h-48 border border-gray-200 rounded-md"
                  />
                ) : (
                  <div className="w-48 h-48 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50">
                    <p className="text-gray-500 text-sm text-center p-4">
                      QR code not available. Please regenerate the certificate.
                    </p>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-500 text-center mb-4">
                Scan this QR code to verify the certificate or share the link below:
              </p>
              
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={getVerificationUrl(selectedCertificate.verificationId)}
                  className="flex-grow rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                />
                <button
                  onClick={() => copyVerificationUrl(selectedCertificate.verificationId)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(selectedCertificate.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}