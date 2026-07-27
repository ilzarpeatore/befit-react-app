import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

export default function AddPostScreen({ navigation, route }: any) {
  const flow = route?.params?.flow;
  const postData = route?.params?.postData;

  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flow === 'EditFlow' && postData) {
      setDescription(postData.description ?? '');
      const mediaUrls = (postData.postingMediaArray ?? []).map((e: any) => e.url);
      setExistingImages(mediaUrls);
    }
  }, []);

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const pickMedia = async () => {
    // TODO: Implement image picker using expo-image-picker
    Alert.alert('Image Picker', 'Implement expo-image-picker here');
  };

  const submitPost = async () => {
    if (!description.trim() && selectedImages.length === 0 && existingImages.length === 0) {
      Alert.alert('Error', 'Please enter some text or select images');
      return;
    }
    setLoading(true);
    try {
      // TODO: Implement multipart upload
      // await submitPostApi(description, selectedImages);
      setLoading(false);
      navigation.goBack();
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to submit post');
    }
  };

  const editPost = async () => {
    if (!description.trim() && selectedImages.length === 0 && existingImages.length > 0) {
      Alert.alert('Error', 'Please enter some text or select images');
      return;
    }
    setLoading(true);
    try {
      // TODO: Implement edit post API
      // await editPostApi(postData?.id, description, selectedImages, existingImages);
      setLoading(false);
      navigation.goBack();
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to edit post');
    }
  };

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>{flow === 'EditFlow' ? 'Edit Post' : 'New Post'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles_local.body} showsVerticalScrollIndicator={false}>
        {/* Description field */}
        <TextInput
          style={styles_local.descriptionInput}
          placeholder="What's on your mind?"
          placeholderTextColor={C.gray50}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Existing images (edit mode) */}
        {existingImages.length > 0 && (
          <View style={styles_local.imageGrid}>
            {existingImages.map((uri, index) => (
              <View key={index} style={styles_local.imageWrap}>
                <Image source={{ uri }} style={styles_local.image} />
                <TouchableOpacity
                  style={styles_local.removeBtn}
                  onPress={() => removeExistingImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={C.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Selected new images */}
        {selectedImages.length > 0 && (
          <View style={styles_local.imageGrid}>
            {selectedImages.map((img, index) => (
              <View key={index} style={styles_local.imageWrap}>
                <Image source={{ uri: img.uri }} style={styles_local.image} />
                <TouchableOpacity
                  style={styles_local.removeBtn}
                  onPress={() => setSelectedImages((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close-circle" size={24} color={C.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Upload button */}
        <TouchableOpacity style={styles_local.uploadBtn} onPress={pickMedia} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={28} color={C.gray30} />
          <Text style={styles_local.uploadText}>Add Photos/Videos</Text>
        </TouchableOpacity>

        {/* Submit button */}
        <TouchableOpacity style={styles_local.submitBtn} onPress={flow === 'EditFlow' ? editPost : submitPost} activeOpacity={0.8}>
          <Text style={styles_local.submitText}>{flow === 'EditFlow' ? 'Edit Post' : 'Share Post'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles_local.loadingOverlay}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
    </View>
  );
}

const styles_local = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: C.surface,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  body: { flex: 1, paddingHorizontal: 16 },
  descriptionInput: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 14,
    color: C.white,
    fontFamily: FONT.regular,
    fontSize: 15,
    minHeight: 140,
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 8 },
  imageWrap: { position: 'relative', width: '48%', aspectRatio: 1 },
  image: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: C.surfaceLight },
  removeBtn: { position: 'absolute', top: -6, right: -6 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadText: { fontSize: 14, fontFamily: FONT.medium, color: C.gray30 },
  submitBtn: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  submitText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
