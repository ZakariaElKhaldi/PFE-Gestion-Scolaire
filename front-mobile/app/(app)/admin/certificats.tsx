import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useToast } from "react-native-toast-notifications"; // Optional: for notifications
import { User } from "@/types/auth";

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

const Certificates = ({ user }: Props) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    class: "",
    type: "scolarite",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null);
  const toast = useToast();

  useEffect(() => {
    const storedCertificates = localStorage.getItem("certificates");
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates));
    }
  }, []);

  const generateUniqueCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const createCertificate = () => {
    if (!formData.firstName || !formData.lastName || !formData.class) {
      toast.show("Veuillez remplir tous les champs obligatoires", {
        duration: 3000,
      });
      return;
    }

    const newCertificate: Certificate = {
      id: Date.now().toString(),
      code: generateUniqueCode(),
      uploadDate: new Date().toLocaleDateString(),
      ...formData,
    };

    setCertificates([...certificates, newCertificate]);
    toast.show("Certificat créé avec succès", {
      duration: 3000,
    });

    setFormData({
      firstName: "",
      lastName: "",
      class: "",
      type: "scolarite",
    });
  };

  const verifyCode = () => {
    const certificate = certificates.find((cert) => cert.code === verificationCode);
    if (certificate) {
      setVerifiedCertificate(certificate);
      toast.show("Certificat authentifié avec succès", { type: "success" });
    } else {
      toast.show("Code invalide", { type: "error" });
      setVerifiedCertificate(null);
    }
  };

  const removeCertificate = (id: string) => {
    const certificateToDelete = certificates.find((cert) => cert.id === id);
    setCertificates(certificates.filter((cert) => cert.id !== id));
    toast.show(`Certificat supprimé pour ${certificateToDelete?.firstName} ${certificateToDelete?.lastName}`, { type: "success" });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Certificats et Attestations</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Créer un Certificat</Text>
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Classe"
          value={formData.class}
          onChangeText={(text) => setFormData({ ...formData, class: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Type"
          value={formData.type}
          onChangeText={(text) => setFormData({ ...formData, type: text })}
        />
        <Button title="Créer le Certificat" onPress={createCertificate} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vérifier un Certificat</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le code du certificat"
          value={verificationCode}
          onChangeText={setVerificationCode}
        />
        <Button title="Vérifier" onPress={verifyCode} />
        {verifiedCertificate ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Certificat Authentique</Text>
            <Text>{verifiedCertificate.firstName} {verifiedCertificate.lastName}</Text>
            <Text>{verifiedCertificate.class}</Text>
            <QRCode value={verifiedCertificate.code} size={150} />
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Certificats Créés</Text>
        {certificates.map((certificate) => (
          <View key={certificate.id} style={styles.certificate}>
            <Text>{certificate.firstName} {certificate.lastName}</Text>
            <Text>{certificate.class}</Text>
            <QRCode value={certificate.code} size={50} />
            <Button title="Supprimer" onPress={() => removeCertificate(certificate.id)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: { padding: 20, backgroundColor: "#f4f4f4", marginBottom: 20, borderRadius: 10 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  certificate: { marginBottom: 10 },
});

export default Certificates;
