import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { postsApi, PickedPostMedia } from '../../api/posts';
import logger from '@helper/logger';

function assetToPickedMedia(asset: ImagePicker.ImagePickerAsset): PickedPostMedia {
  const isVideo = asset.type === 'video';
  const extFromUri = asset.uri.split('.').pop()?.split('?')[0]?.toLowerCase();
  const ext = extFromUri && extFromUri.length <= 4 ? extFromUri : isVideo ? 'mp4' : 'jpg';
  return {
    uri: asset.uri,
    name: asset.fileName || `post-media-${Date.now()}.${ext}`,
    type: asset.mimeType || (isVideo ? `video/${ext}` : `image/${ext}`),
  };
}

export default function AddPostScreen({ navigation, route }: any) {
  const flow = route?.params?.flow;
  const postData = route?.params?.postData;

  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flow === 'EditFlow' && postData) {
      setDescription(postData.description ?? '');
      const mediaUrls = (postData.postingMediaArray ?? []).map((e: any) => e.media_url ?? e.url);
      setExistingImages(mediaUrls);
    }
  }, []);

  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);

  const removeExistingImage = (index: number) => {
    const media = (postData?.postingMediaArray ?? [])[index];
    if (media?.id) setRemovedMediaIds((prev) => [...prev, media.id]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para añadir fotos/vídeos al post.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 4 - selectedImages.length - existingImages.length,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setSelectedImages((prev) => [...prev, ...result.assets].slice(0, 4));
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para hacer una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setSelectedImages((prev) => [...prev, ...result.assets].slice(0, 4));
    }
  };

  const pickMedia = () => {
    if (selectedImages.length + existingImages.length >= 4) {
      Alert.alert('Límite alcanzado', 'Puedes añadir un máximo de 4 fotos/vídeos por publicación.');
      return;
    }
    Alert.alert('Añadir foto/vídeo', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Elegir de la galería', onPress: pickFromLibrary },
      { text: 'Hacer una foto', onPress: pickFromCamera },
    ]);
  };

  const submitPost = async () => {
    if (!description.trim() && selectedImages.length === 0 && existingImages.length === 0) {
      Alert.alert('Error', 'Please enter some text or select images');
      return;
    }
    setLoading(true);
    try {
      const media: PickedPostMedia[] = selectedImages.map(assetToPickedMedia);
      await postsApi.create(description.trim(), media);
      setLoading(false);
      navigation.goBack();
    } catch (e) {
      logger.error('Error submitting post', e);
      setLoading(false);
      Alert.alert('Error', 'Failed to submit post');
    }
  };

  const editPost = async () => {
    if (!description.trim() && selectedImages.length === 0 && existingImages.length === 0) {
      Alert.alert('Error', 'Please enter some text or select images');
      return;
    }
    setLoading(true);
    try {
      if (removedMediaIds.length > 0 && postData?.id) {
        await postsApi.removeMedia(postData.id, removedMediaIds);
      }
      const media: PickedPostMedia[] = selectedImages.map(assetToPickedMedia);
      await postsApi.update(postData?.id, description.trim(), media);
      setLoading(false);
      navigation.goBack();
    } catch (e) {
      logger.error('Error editing post', e);
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
          <ActivityIndicator size="large" color={C.orange} />
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
