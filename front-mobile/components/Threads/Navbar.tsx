import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, Platform, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Feather";  // For icons (you can install it via npm or yarn)
import { currentUser } from "@/types/lib/data";  // Assuming the currentUser object exists

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (Platform.OS === 'web') {
        if (window.scrollY > 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    };

    if (Platform.OS === 'web') {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingVertical: isScrolled ? 10 : 20,
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.8)" : "transparent",
        borderBottomWidth: isScrolled ? 1 : 0,
        borderColor: isScrolled ? "#E5E7EB" : "transparent",
        shadowColor: isScrolled ? "rgba(0, 0, 0, 0.1)" : "transparent",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1D4ED8" }}>SchoolHub</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 24 }}>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Text style={{ color: "#374151", fontSize: 16 }}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Text style={{ color: "#374151", fontSize: 16 }}>Announcements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Text style={{ color: "#374151", fontSize: 16 }}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ color: "#374151", fontSize: 16 }}>Resources</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ position: "relative", marginRight: 16 }}>
            <TextInput
              style={{
                backgroundColor: "#F3F4F6",
                paddingVertical: 8,
                paddingLeft: 36,
                paddingRight: 12,
                borderRadius: 20,
                width: 150,
                fontSize: 14,
              }}
              placeholder="Search..."
            />
            <Icon name="search" style={{ position: "absolute", left: 12, top: 10, color: "#9CA3AF", fontSize: 16 }} />
          </View>

          <TouchableOpacity style={{ position: "relative", marginRight: 16 }}>
            <Icon name="bell" size={20} color="#374151" />
            <View style={{
              position: "absolute",
              top: -4,
              right: -4,
              backgroundColor: "#F59E0B",
              width: 16,
              height: 16,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Text style={{ color: "#FFFFFF", fontSize: 10 }}>3</Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ marginRight: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "500" }}>{currentUser.name}</Text>
              <Text style={{ fontSize: 10, color: "#6B7280" }}>{currentUser.role}</Text>
            </View>
            <Image source={{ uri: currentUser.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
          </View>

          <TouchableOpacity
            style={{ display: Platform.OS === "web" ? "none" : "flex" }}
            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon name={isMobileMenuOpen ? "x" : "menu"} size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <View style={{
          backgroundColor: "#FFFFFF",
          shadowColor: "#000000",
          shadowOpacity: 0.1,
          paddingVertical: 16,
          paddingHorizontal: 16,
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          zIndex: 100,
        }}>
          <View style={{ flexDirection: "row", marginBottom: 16, borderBottomWidth: 1, paddingBottom: 8 }}>
            <Image source={{ uri: currentUser.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
            <View>
              <Text style={{ fontWeight: "500" }}>{currentUser.name}</Text>
              <Text style={{ fontSize: 10, color: "#6B7280" }}>{currentUser.role}</Text>
            </View>
          </View>

          <TouchableOpacity style={{ marginBottom: 16 }}>
            <Text style={{ color: "#374151", fontSize: 16 }}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginBottom: 16 }}>
            <Text style={{ color: "#374151", fontSize: 16 }}>Announcements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginBottom: 16 }}>
            <Text style={{ color: "#374151", fontSize: 16 }}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginBottom: 16 }}>
            <Text style={{ color: "#374151", fontSize: 16 }}>Resources</Text>
          </TouchableOpacity>

          <TextInput
            style={{
              backgroundColor: "#F3F4F6",
              paddingVertical: 8,
              paddingLeft: 36,
              paddingRight: 12,
              borderRadius: 20,
              marginBottom: 16,
              fontSize: 14,
            }}
            placeholder="Search..."
          />
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="log-out" size={20} color="#374151" />
            <Text style={{ marginLeft: 8 }}>Sign out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Navbar;
