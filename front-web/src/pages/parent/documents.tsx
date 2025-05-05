import { useState, useEffect } from "react"
import { User } from "../../types/auth"
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import { FileText, Download, Search, File, FilePlus2 } from "lucide-react"
import { parentService } from "../../services/parent-service"
import { toast } from "react-hot-toast"

interface ParentDocumentsProps {
  user: User
}

export default function ParentDocuments({ user }: ParentDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Helper function for consistent error handling in component
   */
  const handleError = (context: string, error: any) => {
    // Log the error with context
    console.error(`[PARENT-DOCUMENTS] ${context} - Error:`, error);
    
    // Log additional details if available
    if (error.response) {
      console.error(`[PARENT-DOCUMENTS] ${context} - Status:`, error.response.status);
      console.error(`[PARENT-DOCUMENTS] ${context} - Data:`, error.response.data);
    } else if (error.request) {
      console.error(`[PARENT-DOCUMENTS] ${context} - No Response:`, error.request);
    } else {
      console.error(`[PARENT-DOCUMENTS] ${context} - Message:`, error.message);
    }
    
    // Set component error state
    setError(`Failed to ${context.toLowerCase()}. Please try again later.`);
    
    // Show toast notification
    toast.error(`Error: ${context}`);
  };

  const getDocumentIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "doc":
      case "docx":
        return <File className="h-5 w-5 text-purple-600" />
      default:
        return <File className="h-5 w-5 text-gray-600" />
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    console.log('[PARENT-DOCUMENTS] handleSearchChange - Filtering documents with query:', query)
    
    if (query.trim() === "") {
      setFilteredDocuments(documents)
    } else {
      const filtered = documents.filter(doc => 
        doc.name.toLowerCase().includes(query.toLowerCase()) || 
        doc.type.toLowerCase().includes(query.toLowerCase()) ||
        doc.category.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredDocuments(filtered)
      console.log('[PARENT-DOCUMENTS] handleSearchChange - Found', filtered.length, 'matching documents')
    }
  }

  const handleDownload = async (documentId: string) => {
    console.log('[PARENT-DOCUMENTS] handleDownload - Downloading document:', documentId)
    try {
      setLoading(true)
      const blob = await parentService.downloadDocument(documentId)
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${documentId}.pdf` // Default filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      
      console.log('[PARENT-DOCUMENTS] handleDownload - Document downloaded successfully')
      toast.success("Document downloaded successfully")
    } catch (err) {
      handleError('download document', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignDocument = async (documentId: string) => {
    console.log('[PARENT-DOCUMENTS] handleSignDocument - Signing document:', documentId)
    try {
      setLoading(true)
      const signatureData = {
        signatureData: "electronic-signature",
        signatureDate: new Date().toISOString()
      }
      await parentService.signDocument(documentId, signatureData)
      console.log('[PARENT-DOCUMENTS] handleSignDocument - Document signed successfully')
      toast.success("Document signed successfully")
      
      // Refresh documents to update UI
      console.log('[PARENT-DOCUMENTS] handleSignDocument - Refreshing documents')
      const updatedDocs = await parentService.getDocuments()
      setDocuments(updatedDocs)
      setFilteredDocuments(updatedDocs)
      console.log('[PARENT-DOCUMENTS] handleSignDocument - Documents refreshed:', updatedDocs.length)
    } catch (err) {
      handleError('sign document', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchDocuments = async () => {
      console.log('[PARENT-DOCUMENTS] fetchDocuments - Starting document fetch')
      setLoading(true)
      setError(null)
      try {
        console.log('[PARENT-DOCUMENTS] fetchDocuments - Fetching documents from API')
        const docs = await parentService.getDocuments()
        setDocuments(docs)
        setFilteredDocuments(docs)
        console.log('[PARENT-DOCUMENTS] fetchDocuments - Retrieved', docs.length, 'documents')
      } catch (err) {
        handleError('fetch documents', err)
        
        // Add mock data if needed
        console.log('[PARENT-DOCUMENTS] fetchDocuments - Using mock document data')
        const mockDocs = [
          {
            id: "d1",
            name: "Report Card Q1",
            type: "pdf",
            category: "academic",
            studentName: "Emma Johnson",
            size: 2458000,
            uploadDate: new Date().toISOString(),
            downloads: 0
          },
          {
            id: "d2",
            name: "Permission Slip - Field Trip",
            type: "pdf",
            category: "administrative",
            studentName: "Emma Johnson",
            size: 1240000,
            uploadDate: new Date().toISOString(),
            downloads: 0,
            requiresSignature: true,
            signed: false
          }
        ]
        setDocuments(mockDocs)
        setFilteredDocuments(mockDocs)
      } finally {
        setLoading(false)
        console.log('[PARENT-DOCUMENTS] fetchDocuments - Completed')
      }
    }

    fetchDocuments()
  }, [])

  const documentStats = {
    total: documents.length,
    recent: documents.filter(doc => {
      const uploadDate = new Date(doc.uploadDate)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return uploadDate >= sevenDaysAgo
    }).length,
    downloads: documents.reduce((total, doc) => total + (doc.downloads || 0), 0),
    storageUsed: documents.reduce((total, doc) => total + (doc.size || 0), 0) / (1024 * 1024) // Convert to MB
  }

  if (loading && !documents.length) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and download important documents
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <FilePlus2 className="h-4 w-4" />
            Upload Document
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Document Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{documentStats.total}</p>
            <p className="mt-1 text-sm text-gray-500">All documents</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Recent Uploads</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">{documentStats.recent}</p>
            <p className="mt-1 text-sm text-gray-500">Last 7 days</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-600">{documentStats.downloads}</p>
            <p className="mt-1 text-sm text-gray-500">Total downloads</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">{documentStats.storageUsed.toFixed(1)}MB</p>
            <p className="mt-1 text-sm text-gray-500">Of 1GB limit</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="rounded-lg border bg-white">
          <div className="divide-y">
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <div key={doc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{doc.type.toUpperCase()} Document</span>
                          <span>{(doc.size / 1024 / 1024).toFixed(1)} MB</span>
                          <span>Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</span>
                          {doc.studentName && <span>Student: {doc.studentName}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {doc.requiresSignature && !doc.signed && (
                        <button 
                          onClick={() => handleSignDocument(doc.id)}
                          className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-100"
                          disabled={loading}
                        >
                          Sign
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownload(doc.id)}
                        className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        disabled={loading}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 