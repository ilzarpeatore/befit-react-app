import React, { useState, useEffect } from 'react';
import { ScrollView, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Box } from '@components/ui/box';
import { Textarea, TextareaInput } from '@components/ui/textarea';
import { VStack } from '@components/ui/vstack';
import { Text } from '@components/ui/text';
import { Button, ButtonText } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import ScreenHeader from '@components/ScreenHeader';
import { C } from './theme';
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
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 40 }}>
        <ScreenHeader title={flow === 'EditFlow' ? 'Edit Post' : 'New Post'} onBack={() => navigation.goBack()} />
      </Box>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={{ paddingTop: 16, paddingBottom: 32 }}>
          {/* Description field */}
          <Textarea className="bg-card rounded-sm border-border h-auto" style={{ minHeight: 140 }}>
            <TextareaInput
              className="p-3.5 font-gilroy-regular text-sm"
              placeholder="What's on your mind?"
              placeholderTextColor="rgb(var(--muted-foreground))"
              value={description}
              onChangeText={setDescription}
              numberOfLines={6}
            />
          </Textarea>

          {/* Existing images (edit mode) */}
          {existingImages.length > 0 && (
            <Box className="flex-row flex-wrap gap-2">
              {existingImages.map((uri, index) => (
                <Box key={index} className="relative" style={{ width: '48%', aspectRatio: 1 }}>
                  <Image source={{ uri }} className="w-full h-full rounded-sm bg-secondary" />
                  <Pressable
                    style={{ position: 'absolute', top: -6, right: -6 }}
                    onPress={() => removeExistingImage(index)}
                  >
                    <Icon name="close-circle" size={24} className="text-destructive" />
                  </Pressable>
                </Box>
              ))}
            </Box>
          )}

          {/* Selected new images */}
          {selectedImages.length > 0 && (
            <Box className="flex-row flex-wrap gap-2">
              {selectedImages.map((img, index) => (
                <Box key={index} className="relative" style={{ width: '48%', aspectRatio: 1 }}>
                  <Image source={{ uri: img.uri }} className="w-full h-full rounded-sm bg-secondary" />
                  <Pressable
                    style={{ position: 'absolute', top: -6, right: -6 }}
                    onPress={() => setSelectedImages((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Icon name="close-circle" size={24} className="text-destructive" />
                  </Pressable>
                </Box>
              ))}
            </Box>
          )}

          {/* Upload button */}
          <Pressable
            className="flex-row items-center justify-center bg-card rounded-sm border border-border border-dashed py-4 gap-2"
            onPress={pickMedia}
          >
            <Icon name="camera-outline" size={28} className="text-muted-foreground" />
            <Text weight="medium" size="sm" className="text-muted-foreground">Add Photos/Videos</Text>
          </Pressable>

          {/* Submit button */}
          <Button onPress={flow === 'EditFlow' ? editPost : submitPost} radius="pill" className="w-full">
            <ButtonText>{flow === 'EditFlow' ? 'Edit Post' : 'Share Post'}</ButtonText>
          </Button>
        </VStack>
      </ScrollView>

      {loading && (
        <Box style={StyleSheet.absoluteFill} className="bg-black/50 items-center justify-center">
          <Spinner size="large" color={C.orange} />
        </Box>
      )}
    </Box>
  );
}
