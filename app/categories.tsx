import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
  useWindowDimensions,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { mockCategories, Category } from "@/mocks/dashboard";
import {
  Plus,
  Edit,
  Trash2,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Upload,
  X,
} from "lucide-react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function CategoriesScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1200;
  const insets = useSafeAreaInsets();
  const columns = isMobile ? 1 : isTablet ? 2 : 3;
  const gridGap = isMobile ? 12 : 20;
  const horizontalPadding = isMobile ? 16 : 32;
  const sidebarWidth = isMobile ? 0 : 260;
  const contentWidth = width - sidebarWidth - horizontalPadding * 2;
  const cardWidth = Math.max(
    260,
    Math.floor((contentWidth - gridGap * (columns - 1)) / columns)
  );
  
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "wrench",
    iconUri: "",
    active: true,
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "wrench",
      iconUri: "",
      active: true,
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      iconUri: category.iconUri || "",
      active: category.active,
    });
    setShowModal(true);
  };

  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    if (editingCategory) {
      console.log(`Updating category ${editingCategory.id}: ${formData.name}`);
      Alert.alert("Category Updated", `${formData.name} has been updated.`);
    } else {
      console.log(`Creating new category: ${formData.name}`);
      Alert.alert("Category Created", `${formData.name} has been created.`);
    }

    setShowModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log(`Deleting category ${category.id}: ${category.name}`);
            Alert.alert("Category Deleted", `${category.name} has been deleted.`);
          },
        },
      ]
    );
  };

  const handleToggleActive = (category: Category) => {
    console.log(
      `Toggling category ${category.id} active status: ${!category.active}`
    );
    const updatedCategories = categories.map((c) =>
      c.id === category.id ? { ...c, active: !c.active } : c
    );
    setCategories(updatedCategories);
  };

  const handlePickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant access to your photo library to upload an icon."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log("Image selected:", result.assets[0].uri);
        setFormData({ ...formData, iconUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleRemoveIcon = () => {
    console.log("Removing icon");
    setFormData({ ...formData, iconUri: "" });
  };

  return (
    <View style={styles.container}>
      <Sidebar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isMobile && {
            ...styles.contentContainerMobile,
            paddingTop: 60 + insets.top + 16,
          },
        ]}
      >
        <SafeAreaView edges={["top", "right"]} style={[styles.safeArea, isMobile && styles.safeAreaMobile]}>
          <View style={[styles.header, isMobile && styles.headerMobile]}>
            <View>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>Content & Category Management</Text>
              <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                Manage service categories and featured providers
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, isMobile && styles.addButtonMobile]}
              onPress={handleAddCategory}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.categoriesGrid,
              { gap: gridGap },
              isMobile && styles.categoriesGridMobile,
            ]}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onToggleActive={handleToggleActive}
                isMobile={isMobile}
                cardWidth={isMobile ? undefined : cardWidth}
              />
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Plumbing"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconUploadContainer}>
                {formData.iconUri ? (
                  <View style={styles.iconPreviewContainer}>
                    <Image
                      source={{ uri: formData.iconUri }}
                      style={styles.iconPreview}
                    />
                    <TouchableOpacity
                      style={styles.removeIconButton}
                      onPress={handleRemoveIcon}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.iconPlaceholder}>
                    <Upload size={32} color={Colors.light.textSecondary} />
                  </View>
                )}
                <View style={styles.iconUploadActions}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handlePickImage}
                  >
                    <Upload size={18} color={Colors.light.primary} />
                    <Text style={styles.uploadButtonText}>
                      {formData.iconUri ? "Change Icon" : "Upload Icon"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.uploadHint}>
                    Recommended: Square image, 512x512px or larger
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description of the category"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={formData.active}
                  onValueChange={(value) =>
                    setFormData({ ...formData, active: value })
                  }
                  trackColor={{
                    false: Colors.light.border,
                    true: Colors.light.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveCategory}
              >
                <Text style={styles.modalButtonText}>
                  {editingCategory ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
  onToggleActive,
  isMobile,
  cardWidth,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  isMobile: boolean;
  cardWidth?: number;
}) {
  const getIcon = () => {
    if (category.iconUri) {
      return (
        <Image
          source={{ uri: category.iconUri }}
          style={styles.categoryIconImage}
        />
      );
    }

    const iconProps = { size: 28, color: Colors.light.primary };
    switch (category.icon) {
      case "wrench":
        return <Wrench {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      case "hammer":
        return <Hammer {...iconProps} />;
      case "paintbrush":
        return <Paintbrush {...iconProps} />;
      case "sparkles":
        return <Sparkles {...iconProps} />;
      default:
        return <Wrench {...iconProps} />;
    }
  };

  return (
    <View
      style={[
        styles.categoryCard,
        !category.active && styles.categoryCardInactive,
        isMobile && styles.categoryCardMobile,
        !isMobile && cardWidth ? { width: cardWidth } : null,
      ]}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIcon}>{getIcon()}</View>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onEdit(category)}
          >
            <Edit size={18} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onDelete(category)}
          >
            <Trash2 size={18} color={Colors.light.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.categoryName}>{category.name}</Text>
      {isMobile ? (
        <Text style={styles.categoryDescription}>{category.description}</Text>
      ) : (
        <Text
          style={[styles.categoryDescription, styles.categoryDescriptionDesktop]}
          numberOfLines={2}
        >
          {category.description}
        </Text>
      )}

      <View style={styles.categoryStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{category.providerCount}</Text>
          <Text style={styles.statLabel}>Providers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{category.bookingsCount}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
      </View>

      <View style={styles.categoryFooter}>
        <Text style={styles.statusLabel}>
          {category.active ? "Active" : "Inactive"}
        </Text>
        <Switch
          value={category.active}
          onValueChange={() => onToggleActive(category)}
          trackColor={{
            false: Colors.light.border,
            true: Colors.light.primary,
          }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 32,
  },
  contentContainerMobile: {
    padding: 16,
    paddingTop: 92,
  },
  safeArea: {
    flex: 1,
  },
  safeAreaMobile: {
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 12,
  },
  headerMobile: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  titleMobile: {
    fontSize: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  subtitleMobile: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonMobile: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  categoriesGridMobile: {
    flexDirection: "column",
    gap: 12,
  },
  categoryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexGrow: 0,
  },
  categoryCardMobile: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    flex: 0,
  },
  categoryCardInactive: {
    opacity: 0.6,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  categoryDescriptionDesktop: {
    minHeight: 40,
  },
  categoryStats: {
    flexDirection: "row",
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 16,
  },
  statItem: {
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  categoryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    outlineStyle: "none",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  iconUploadContainer: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  iconPreviewContainer: {
    position: "relative",
    width: 80,
    height: 80,
  },
  iconPreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  removeIconButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.error,
    alignItems: "center",
    justifyContent: "center",
  },
  iconUploadActions: {
    flex: 1,
    gap: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  uploadHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  categoryIconImage: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
});
