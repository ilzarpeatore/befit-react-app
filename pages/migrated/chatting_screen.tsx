import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { chatApi, ChatMessage } from '../../api/chat';

interface DisplayMessage {
  id: string;
  question: string;
  answer: string;
  isLoading: boolean;
  time?: string;
}

export default function ChattingScreen({ navigation }: any) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [msgController, setMsgController] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await chatApi.getList();
      const items: DisplayMessage[] = (res.data.data ?? []).map((m: ChatMessage) => ({
        id: m.id.toString(),
        question: m.question,
        answer: m.answer,
        isLoading: false,
        time: m.created_at,
      }));
      setMessages(items);
    } catch {
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const sendMessage = async () => {
    if (!msgController.trim()) return;
    Keyboard.dismiss();

    const question = msgController.trim();
    setMsgController('');

    const tempId = `temp_${Date.now()}`;
    const newMsg: DisplayMessage = {
      id: tempId,
      question,
      answer: '',
      isLoading: true,
    };
    setMessages(prev => [newMsg, ...prev]);

    try {
      const answer = 'FitBot está disponible para consultas básicas. Para asesoría personalizada, contacta a tu entrenador.';

      await chatApi.save(question, answer);

      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, answer, isLoading: false } : m
        )
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, answer: 'Error al enviar. Intenta de nuevo.', isLoading: false } : m
        )
      );
    }
  };

  const showClearDialog = () => {
    Alert.alert('Limpiar Chat', '¿Estás seguro de que quieres borrar toda la conversación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          try {
            await chatApi.deleteAll();
            setMessages([]);
          } catch {
          }
        },
      },
    ]);
  };

  const renderMessage = ({ item }: { item: DisplayMessage }) => (
    <View style={styles_local.messageWrap}>
      <View style={styles_local.userMessage}>
        <Text style={styles_local.userMessageText}>{item.question}</Text>
      </View>

      <View style={styles_local.botMessage}>
        <Ionicons name="hardware-chip-outline" size={18} color={C.textPrimary} />
        {item.isLoading ? (
          <View style={styles_local.loadingRow}>
            <ActivityIndicator size="small" color={C.orange} />
            <Text style={styles_local.botLoadingText}>Pensando...</Text>
          </View>
        ) : (
          <Text style={styles_local.botMessageText}>{item.answer}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>FitBot</Text>
        {messages.length > 0 ? (
          <TouchableOpacity style={styles_local.backBtn} onPress={showClearDialog}>
            <Ionicons name="refresh-outline" size={22} color={C.white} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles_local.body}>
            {isLoadingHistory ? (
              <View style={styles_local.emptyWrap}>
                <ActivityIndicator size="large" color={C.orange} />
              </View>
            ) : messages.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                inverted
                contentContainerStyle={{ paddingVertical: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              />
            ) : (
              <View style={styles_local.emptyWrap}>
                <Ionicons name="chatbubbles-outline" size={48} color={C.gray60} />
                <Text style={styles_local.emptyTitle}>FitBot</Text>
                <Text style={styles_local.emptySubtext}>Pregúntame sobre fitness y nutrición</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>

        <View style={styles_local.inputBar}>
          <TextInput
            style={styles_local.textInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={C.gray50}
            value={msgController}
            onChangeText={setMsgController}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles_local.sendBtn, !msgController.trim() && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={!msgController.trim()}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={16} color={C.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  body: { flex: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: FONT.semiBold, color: C.gray30 },
  emptySubtext: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50 },
  messageWrap: { paddingHorizontal: 16 },
  userMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.brand60,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    marginLeft: 48,
    marginBottom: 4,
  },
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
  botMessageText: { flex: 1, fontSize: 14, fontFamily: FONT.regular, color: C.gray50, lineHeight: 20 },
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
