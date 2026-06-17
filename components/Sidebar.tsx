import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { PressableOpacity as TouchableOpacity } from "@/components/PressableOpacity";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  AlertCircle,
  DollarSign,
  Layers,
  Headphones,
  Bell,
  FileText,
  BarChart2,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react-native";
import { useState } from "react";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: any;
}

const navItems: NavItem[] = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Users", path: "/users", icon: UserCheck },
  { label: "Provider Approvals", path: "/providers", icon: UserCheck },
  { label: "All Providers", path: "/providers/manage", icon: UserCheck },
  { label: "Bookings", path: "/bookings", icon: Calendar },
  { label: "Analytics", path: "/analytics", icon: BarChart2 },
  { label: "Disputes", path: "/disputes", icon: AlertCircle },
  { label: "Earnings & Payouts", path: "/earnings", icon: DollarSign },
  { label: "Categories", path: "/categories", icon: Layers },
  { label: "Support Center", path: "/support", icon: Headphones },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Audit Logs", path: "/audit", icon: FileText },
  { label: "System Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.path;
    const Icon = item.icon;

    return (
      <TouchableOpacity
        key={item.path}
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => {
          router.push(item.path as any);
          if (isMobile) setIsOpen(false);
        }}
      >
        <Icon
          size={20}
          color={isActive ? Colors.light.primary : Colors.light.textSecondary}
        />
        <Text
          style={[
            styles.navLabel,
            isActive && styles.navLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isMobile) {
    return (
      <>
        <View style={[styles.mobileTopBar, { paddingTop: insets.top, height: 60 + insets.top }]}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        {isOpen && (
          <>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setIsOpen(false)}
            />
            <View style={[styles.sidebar, styles.sidebarMobile, { paddingTop: insets.top + 16 }]}>
              <View style={styles.mobileHeader}>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                  <X size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.nav}>{navItems.map(renderNavItem)}</View>
              <View style={styles.footer}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitials}>
                      {(user?.name || "Admin")
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user?.name || "Admin"}</Text>
                    <Text style={styles.userEmail}>{user?.email || ""}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <LogOut size={18} color={Colors.light.error} />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </>
    );
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.nav}>{navItems.map(renderNavItem)}</View>
      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>
              {(user?.name || "Admin")
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || "Admin"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color={Colors.light.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: Colors.light.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
    paddingVertical: 24,
  },
  sidebarMobile: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  mobileTopBar: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  mobileHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  nav: {
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  navItemActive: {
    backgroundColor: `${Colors.light.primary}08`,
    borderLeftColor: Colors.light.primary,
  },
  navLabel: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  navLabelActive: {
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  closeButton: {
    padding: 4,
  },
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 999,
  },
  footer: {
    marginTop: "auto" as const,
    paddingHorizontal: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userInitials: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: `${Colors.light.error}08`,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.error,
  },
});
