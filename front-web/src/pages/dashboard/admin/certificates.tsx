import { Award, Download, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import jsPDF from 'jspdf';
import { User } from "@/types/auth";
import { Toaster } from "sonner";

interface Certificate {
  id: string;
  code: string;
  uploadDate: string;
  firstName: string;
  lastName: string;
  class: string;
  type: string;
}

interface Props {
  user: User;
}

export default function Certificates({ user }: Props) {    
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    class: "",
    type: "scolarite",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const storedCertificates = localStorage.getItem("certificates");
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("certificates", JSON.stringify(certificates));
  }, [certificates]);

  const generateUniqueCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const createCertificate = () => {
    if (!formData.firstName || !formData.lastName || !formData.class) {
      toast.error("Veuillez remplir tous les champs obligatoires", {
        description: "Le prénom, le nom et la classe sont requis",
        duration: 3000,
      });
      return;
    }

    const newCertificate: Certificate = {
      id: Date.now().toString(),
      code: generateUniqueCode(),
      uploadDate: new Date().toLocaleDateString(),
      ...formData
    };

    setCertificates([...certificates, newCertificate]);
    toast.success("Certificat créé avec succès", {
      description: `Pour ${formData.firstName} ${formData.lastName}`,
      duration: 3000,
    });
    
    setFormData({
      firstName: "",
      lastName: "",
      class: "",
      type: "scolarite"
    });
  };

  const removeCertificate = (id: string) => {
    const certificatToDelete = certificates.find(cert => cert.id === id);
    setCertificates(certificates.filter(cert => cert.id !== id));
    toast.success("Certificat supprimé", {
      description: `Pour ${certificatToDelete?.firstName} ${certificatToDelete?.lastName}`,
      duration: 3000,
    });
  };

  const verifyCode = () => {
    const certificate = certificates.find(cert => cert.code === verificationCode);
    if (certificate) {
      setVerifiedCertificate(certificate);
      toast.success("Certificat authentifié avec succès");
    } else {
      toast.error("Code invalide");
      setVerifiedCertificate(null);
    }
  };

  const downloadCertificate = (certificate: Certificate) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set page background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, 'F'); // A4 landscape dimensions
    
    // Add black border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, 277, 190); // Outer border
    pdf.rect(15, 15, 267, 180); // Inner decorative border
    
    // Header
    pdf.setFontSize(28);
    pdf.setTextColor(0, 0, 0);
    pdf.text("CERTIFICAT", 148.5, 35, { align: "center" });
    
    // Decorative line under header
    pdf.setLineWidth(0.5);
    pdf.line(50, 45, 247, 45);
    
    // Content
    const typeTexts = {
      scolarite: "CERTIFICAT DE SCOLARITÉ",
      reussite: "CERTIFICAT DE RÉUSSITE",
      presence: "ATTESTATION DE PRÉSENCE"
    };
    
    // Title of certificate type
    pdf.setFontSize(22);
    pdf.text(typeTexts[certificate.type as keyof typeof typeTexts], 148.5, 65, { align: "center" });
    
    // Certificate information
    pdf.setFontSize(14);
    const content = [
      `Nous certifions que :`,
      ``,
      `${certificate.firstName} ${certificate.lastName}`,
      ``,
      `Classe : ${certificate.class}`,
      ``,
      `Est inscrit(e) dans notre établissement pour l'année scolaire en cours.`,
      ``,
      `Date de création : ${certificate.uploadDate}`,
      ``,
      `Code de vérification : ${certificate.code}`
    ];
    
    content.forEach((line, index) => {
      pdf.text(line, 40, 85 + (index * 10));
    });
    
    // QR Code section at the bottom
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(118.5, 140, 60, 60); // QR Code placeholder
    pdf.setFontSize(10);
    pdf.text("Code QR de vérification", 148.5, 170, { align: "center" });
    
    // Signature section
    pdf.setFontSize(12);
    pdf.text("Signature et cachet de l'établissement", 230, 180);
    
    // Footer with verification text
    pdf.setFontSize(8);
    pdf.text("Ce document peut être vérifié en ligne sur notre plateforme avec le code de vérification.", 148.5, 190, { align: "center" });

    // Download the PDF
    pdf.save(`certificat-${certificate.code}.pdf`);
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case "scolarite":
        return "Certificat de scolarité";
      case "reussite":
        return "Certificat de réussite";
      case "presence":
        return "Attestation de présence";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Certificats et Attestations</h1>
        </div>
        <Link to="/">
          <Button variant="outline">
            Retour à l'accueil
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">Créer un Certificat</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="grid gap-4">
                <Input
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="border-2 focus:border-primary"
                />
                <Input
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="border-2 focus:border-primary"
                />
                <Input
                  placeholder="Classe"
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="border-2 focus:border-primary"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-3 rounded border-2 border-primary/20 focus:border-primary focus:outline-none"
                >
                  <option value="scolarite">Certificat de scolarité</option>
                  <option value="reussite">Certificat de réussite</option>
                  <option value="presence">Attestation de présence</option>
                </select>
                <Button 
                  onClick={createCertificate}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Créer le certificat
                </Button>
              </div>
              
              <div className="space-y-4 mt-6">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg border-2 border-primary/10 hover:border-primary/20 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-primary">{certificate.firstName} {certificate.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        Classe: {certificate.class}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Type: {getCertificateTypeLabel(certificate.type)}
                      </p>
                      <p className="text-sm font-mono bg-primary/5 px-2 py-1 rounded mt-1 inline-block">
                        Code: {certificate.code}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Créé le {certificate.uploadDate}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => downloadCertificate(certificate)}
                        className="hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => removeCertificate(certificate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">Vérifier un Certificat</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Entrez le code du certificat"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="border-2 focus:border-primary"
                />
                <Button 
                  onClick={verifyCode} 
                  variant="outline"
                  className="hover:bg-primary/10"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {verifiedCertificate ? (
                <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <p className="font-medium text-primary mb-4">✓ Certificat authentique</p>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {verifiedCertificate.firstName} {verifiedCertificate.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Classe: {verifiedCertificate.class}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type: {getCertificateTypeLabel(verifiedCertificate.type)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Créé le: {verifiedCertificate.uploadDate}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-muted rounded-lg border-2 border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    Entrez le code unique de votre certificat pour en vérifier
                    l'authenticité
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
