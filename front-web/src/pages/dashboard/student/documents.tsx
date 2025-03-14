import { useState, useEffect, useRef } from "react"
import { User } from "../../../types/auth"
import { StudentLayout } from "../../../components/dashboard/layout/student-layout"
import { FileText, Download, Search, File, FilePlus2, X, Upload, Loader2, Wifi, WifiOff, RefreshCw, Trash } from "lucide-react"
import { documentService, Document } from "../../../services/document.service"
import { toast } from "react-hot-toast"
import { format, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../components/ui/select"

interface StudentDocumentsProps {
  user: User
}

export default function StudentDocuments({ user }: StudentDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOffline, setIsOffline] = useState(false)
  const [storageUsage, setStorageUsage] = useState({ used: 0, documentCount: 0 })
  const [showStorageDialog, setShowStorageDialog] = useState(false)
  
  // State for upload modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadType, setUploadType] = useState("")
  const [uploading, setUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    fetchDocuments()
    updateStorageUsage()
    
    // Monitor online/offline status
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
      if (navigator.onLine) {
        toast.success('Back online')
      } else {
        toast.error('You are offline. Some features may be limited')
      }
    }
    
    // Set initial online status
    setIsOffline(!navigator.onLine)
    
    // Add event listeners
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])
  
  const fetchDocuments = async (forceRefresh = false) => {
    try {
      setLoading(true)
      const docs = await documentService.getDocuments(undefined, { forceRefresh })
      setDocuments(docs)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      toast.error("Failed to load documents. Please try again later.")
    } finally {
      setLoading(false)
    }
  }
  
  const updateStorageUsage = () => {
    const usage = documentService.getDocumentStorageUsage()
    setStorageUsage(usage)
  }
  
  const handleRefresh = async () => {
    if (isOffline) {
      toast.error("Cannot refresh while offline")
      return
    }
    
    await fetchDocuments(true)
    updateStorageUsage()
    toast.success("Documents refreshed")
  }
  
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0])
    }
  }
  
  const handleUpload = async () => {
    if (isOffline) {
      toast.error("Cannot upload documents while offline")
      return
    }
    
    if (!uploadFile || !uploadTitle || !uploadType) {
      toast.error("Please fill all required fields")
      return
    }
    
    try {
      setUploading(true)
      
      console.log('Starting document upload:', {
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        fileType: uploadFile.type,
        title: uploadTitle,
        description: uploadDescription,
        type: uploadType
      })
      
      const document = await documentService.uploadDocument(uploadFile, {
        title: uploadTitle,
        description: uploadDescription,
        type: uploadType
      })
      
      console.log('Document uploaded successfully:', document)
      
      // Add the new document to the list
      setDocuments(prev => [document, ...prev])
      
      // Reset form
      setUploadFile(null)
      setUploadTitle("")
      setUploadDescription("")
      setUploadType("")
      setShowUploadModal(false)
      
      // Update storage usage
      updateStorageUsage()
      
      toast.success("Document uploaded successfully")
    } catch (error) {
      console.error("Failed to upload document:", error)
      toast.error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }
  
  const handleDownload = async (id: string, title: string) => {
    try {
      if (isOffline) {
        // Try to get from local storage if offline
        const blob = await documentService.getStoredDocument(id)
        if (blob) {
          // Create download from blob
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = title
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          return
        }
        toast.error("Document not available offline")
        return
      }
      
      // If online, download and store for future offline use
      const blob = await documentService.downloadAndStoreDocument(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Refresh document list to show offline status
      fetchDocuments()
      // Update storage usage
      updateStorageUsage()
    } catch (error) {
      console.error("Failed to download document:", error)
      toast.error("Failed to download document. Please try again later.")
    }
  }
  
  const handleToggleOfflineAvailability = async (document: Document) => {
    try {
      if (document.isAvailableOffline) {
        // Remove from offline storage
        documentService.removeStoredDocument(document.id)
        toast.success(`"${document.title}" removed from offline storage`)
      } else {
        if (isOffline) {
          toast.error("Cannot save for offline while offline")
          return
        }
        
        // Download and store for offline
        await documentService.downloadAndStoreDocument(document.id)
        toast.success(`"${document.title}" saved for offline use`)
      }
      
      // Refresh document list to show offline status
      fetchDocuments()
      // Update storage usage
      updateStorageUsage()
    } catch (error) {
      console.error("Failed to toggle offline availability:", error)
      toast.error("Failed to update offline availability")
    }
  }
  
  const handleClearAllOfflineDocuments = () => {
    documentService.clearStoredDocuments()
    // Refresh document list to show offline status
    fetchDocuments()
    // Update storage usage
    updateStorageUsage()
    setShowStorageDialog(false)
  }
  
  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Format date safely (handle both string and Date objects)
  const formatDateSafe = (date: string | Date | undefined) => {
    if (!date) return 'Unknown date';
    try {
      if (typeof date === 'string') {
        return format(parseISO(date), 'MMM d, yyyy');
      } else if (date instanceof Date) {
        return format(date, 'MMM d, yyyy');
      }
      return 'Invalid date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Compute stats
  const totalDocuments = documents.length
  const pendingDocuments = documents.filter(doc => doc.status === "pending").length
  const offlineDocuments = documents.filter(doc => doc.isAvailableOffline).length
  const recentDocuments = documents.filter(doc => {
    try {
      const date = typeof doc.createdAt === 'string' ? new Date(doc.createdAt) : doc.createdAt;
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date > thirtyDaysAgo;
    } catch (error) {
      console.error('Error filtering recent documents:', error);
      return false;
    }
  }).length
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return <File className="h-6 w-6 text-purple-600" />
    } else if (type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-600" />
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-600" />
    } else {
      return <FileText className="h-6 w-6 text-gray-600" />
    }
  }
  
  if (loading) {
    return (
      <StudentLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your academic documents and records
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOffline && (
              <div className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-md mr-2">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Offline Mode</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStorageDialog(true)}
              title="Storage Management"
            >
              <Wifi className="h-4 w-4 mr-1" />
              {offlineDocuments} Offline
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isOffline}
              title="Refresh Documents"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowUploadModal(true)}
              disabled={isOffline}
            >
              <FilePlus2 className="h-4 w-4 mr-1" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Document Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{totalDocuments}</p>
            <p className="mt-1 text-sm text-gray-500">All documents</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Recent Uploads</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">{recentDocuments}</p>
            <p className="mt-1 text-sm text-gray-500">Last 30 days</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">{pendingDocuments}</p>
            <p className="mt-1 text-sm text-gray-500">Awaiting verification</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Offline Available</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">{offlineDocuments}</p>
            <p className="mt-1 text-sm text-gray-500">{formatBytes(storageUsage.used)} used</p>
          </div>
        </div>

        {/* Documents List */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Documents</h2>
          {filteredDocuments.length > 0 ? (
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="divide-y">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        {getFileIcon(document.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {document.title}
                          {document.isAvailableOffline && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <Wifi className="h-3 w-3 mr-1" />
                              Offline
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{document.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {formatDateSafe(document.createdAt)}
                          </span>
                          {document.status === 'pending' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">
                              Pending
                            </span>
                          )}
                          {document.status === 'approved' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                              Approved
                            </span>
                          )}
                          {document.status === 'rejected' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {document.type.split('/').pop()} • {formatBytes(document.size)}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleOfflineAvailability(document)}
                        className={document.isAvailableOffline ? "text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50" : "text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"}
                        title={document.isAvailableOffline ? "Remove from offline storage" : "Save for offline use"}
                      >
                        {document.isAvailableOffline ? (
                          <>
                            <WifiOff className="h-4 w-4 mr-1" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Wifi className="h-4 w-4 mr-1" />
                            Save Offline
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(document.id, document.title)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? "Try adjusting your search query." : "Upload your first document to get started."}
              </p>
              {!searchQuery && !isOffline && (
                <button 
                  className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => setShowUploadModal(true)}
                >
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Upload Document
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Upload Document Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to your student records
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={uploadTitle} 
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={uploadDescription} 
                onChange={e => setUploadDescription(e.target.value)}
                placeholder="Enter document description"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Document Type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Academic</SelectLabel>
                    <SelectItem value="transcript">Transcript</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="enrollment">Enrollment Proof</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Personal</SelectLabel>
                    <SelectItem value="id">ID Document</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              {uploadFile ? (
                <div className="flex items-center justify-between rounded-md border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">{uploadFile.name}</span>
                    <span className="text-xs text-gray-500">({formatBytes(uploadFile.size)})</span>
                  </div>
                  <button 
                    type="button" 
                    className="rounded-full p-1 hover:bg-gray-100"
                    onClick={() => setUploadFile(null)}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-700">Click to upload a file</p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOCX, JPG, PNG up to 10MB</p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadFile || !uploadTitle || !uploadType || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Storage Management Dialog */}
      <Dialog open={showStorageDialog} onOpenChange={setShowStorageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offline Storage Management</DialogTitle>
            <DialogDescription>
              Manage your offline documents and storage usage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Storage Used</h3>
                <p className="text-sm text-gray-500">{offlineDocuments} documents saved offline</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatBytes(storageUsage.used)}</p>
                <p className="text-xs text-gray-500">of ~5MB available</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  storageUsage.used / (5 * 1024 * 1024) > 0.8 ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ 
                  width: `${Math.min(100, (storageUsage.used / (5 * 1024 * 1024)) * 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-700">Documents saved for offline access:</p>
              
              {documents.filter(doc => doc.isAvailableOffline).length > 0 ? (
                <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                  {documents.filter(doc => doc.isAvailableOffline).map(doc => (
                    <div key={doc.id} className="p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        {getFileIcon(doc.type)}
                        <span className="ml-2 text-sm font-medium">{doc.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleOfflineAvailability(doc)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">No documents saved for offline use</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowStorageDialog(false)}
            >
              Close
            </Button>
            <Button 
              variant="destructive"
              onClick={handleClearAllOfflineDocuments}
              disabled={offlineDocuments === 0}
            >
              <Trash className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  )
} 