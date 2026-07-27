import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

let selectedImageIndex = -1;

export default function ChattingImageScreen({ navigation }: any) {

  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [myMessages, setMyMessages] = useState<any[]>([]);
  const [msgController, setMsgController] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isScroll, setIsScroll] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [imageSelected, setImageSelected] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [firstQuestion, setFirstQuestion] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setIsLoading(false);
    // TODO: Initialize OpenAI and auto-send first message
    setShowUI(true);
  }, []);

  const sendMessage = async () => {
    if (!msgController.trim()) return;
    Keyboard.dismiss();
    setShowResponse(true);
    setIsLoading(true);

    const question = selectedText ? selectedText + msgController : msgController;
    setMsgController('');

    const newQA = {
      question,
      imageUri: imageSelected,
      answer: '',
      isLoading: true,
      smartCompose: selectedText,
    };
    setQuestionAnswers((prev) => [newQA, ...prev]);

    const newMsgs = [...myMessages, { role: 'user', content: question }];
    setMyMessages(newMsgs);

    try {
      // TODO: Replace with actual OpenAI API call
      // const stream = await openAI.onChatCompletion(request);
      // Simulate response
      const answer = 'This is a placeholder response. Implement OpenAI integration here.';
      setQuestionAnswers((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0] = { ...updated[0], answer, isLoading: false };
        }
        return updated;
      });
      setMyMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      setImageSelected('');
      selectedImageIndex = -1;
    } catch (error) {
      setQuestionAnswers((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0] = { ...updated[0], answer: 'Too many requests please try again', isLoading: false };
        }
        return updated;
      });
      setImageSelected('');
      selectedImageIndex = -1;
    }

    setIsLoading(false);
    setShowResponse(false);
  };

  const showClearDialog = () => {
    Alert.alert('Clear Chat', 'Are you sure you want to clear the conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          setQuestionAnswers([]);
          setMyMessages([]);
        },
      },
    ]);
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => (
    <View style={styles_local.messageWrap}>
      {/* User message */}
      <View style={styles_local.userMessage}>
        {item.imageUri ? (
          <View style={styles_local.imageThumb}>
            <Ionicons name="image" size={16} color={C.gray40} />
          </View>
        ) : null}
        <Text style={styles_local.userMessageText}>{item.question}</Text>
      </View>

      {/* Bot response */}
      <View style={styles_local.botMessage}>
        <Ionicons name="hardware-chip-outline" size={18} color={C.brand5} />
        {item.isLoading ? (
          <View style={styles_local.loadingRow}>
            <ActivityIndicator size="small" color={C.brand5} />
            <Text style={styles_local.botLoadingText}>Thinking...</Text>
          </View>
        ) : (
          <Text style={styles_local.botMessageText}>{item.answer}</Text>
        )}
      </View>
    </View>
  );

  if (!showUI) {
    return (
      <View style={styles_local.loadingContainer}>
        <ActivityIndicator size="large" color={C.brand5} />
      </View>
    );
  }

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>FitBot</Text>
        {questionAnswers.length > 0 ? (
          <TouchableOpacity style={styles_local.backBtn} onPress={showClearDialog}>
            <Ionicons name="refresh-outline" size={22} color={C.white} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles_local.body}>
        {questionAnswers.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={questionAnswers}
            renderItem={renderMessage}
            keyExtractor={(_, i) => i.toString()}
            inverted
            contentContainerStyle={{ paddingVertical: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        ) : (
          <View style={styles_local.emptyWrap}>
            {/* TODO: Integrate ChatBotEmptyScreen */}
            <Ionicons name="chatbubbles-outline" size={48} color={C.gray60} />
            <Text style={styles_local.emptyTitle}>FitBot Image Chat</Text>
            <Text style={styles_local.emptySubtext}>Send an image and ask a question</Text>
          </View>
        )}
      </View>

      {!showResponse && (
        <View style={styles_local.inputBar}>
          <TextInput
            style={styles_local.textInput}
            placeholder="Type a message..."
            placeholderTextColor={C.gray50}
            value={msgController}
            onChangeText={setMsgController}
            onSubmitEditing={sendMessage}
            multiline
            onFocus={() => setIsScroll(true)}
          />
          <TouchableOpacity
            style={styles_local.sendBtn}
            onPress={sendMessage}
            disabled={!msgController.trim()}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={16} color={C.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles_local = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
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
  body: { flex: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: FONT.semiBold, color: C.gray30 },
  emptySubtext: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50 },
  messageWrap: { paddingHorizontal: 16 },
  userMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.brand6,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    marginLeft: 48,
    marginBottom: 4,
    gap: 8,
  },
  imageThumb: { width: 24, height: 24, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  userMessageText: { flex: 1, fontSize: 14, fontFamily: FONT.regular, color: C.white, lineHeight: 20 },
  botMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginRight: 48,
    gap: 8,
  },
  botMessageText: { flex: 1, fontSize: 14, fontFamily: FONT.regular, color: C.gray10, lineHeight: 20 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botLoadingText: { fontSize: 13, fontFamily: FONT.regular, color: C.gray40 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: C.surface,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: C.surfaceLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: C.white,
    fontFamily: FONT.regular,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: C.brand5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
