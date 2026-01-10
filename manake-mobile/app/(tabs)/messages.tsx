import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../constants";
import { useAuth, useConnectivity } from "../../hooks";
import { useToast } from "../../components";
import {
  messagingApi,
  Message,
  MessagingChannel,
} from "../../services/messaging";

const CHANNELS: { key: MessagingChannel; label: string; icon: string }[] = [
  { key: "inapp", label: "In-App", icon: "inbox" },
  { key: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { key: "instagram", label: "Instagram", icon: "instagram" },
  { key: "facebook", label: "Facebook", icon: "facebook" },
];

export default function MessagesScreen() {
  const { user } = useAuth();
  const { hasInternet } = useConnectivity();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChannel, setSelectedChannel] =
    useState<MessagingChannel>("inapp");

  const markedReadIdsRef = useRef<Set<string>>(new Set());

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const data = await messagingApi.getHistory(selectedChannel);
      setMessages(data);

      if (hasInternet) {
        const unreadInbound = (data || []).filter(
          (m) =>
            m.direction === "inbound" &&
            m.id &&
            !markedReadIdsRef.current.has(m.id) &&
            !m.readAt &&
            m.status !== "read",
        );

        if (unreadInbound.length > 0) {
          await Promise.all(
            unreadInbound.map(async (m) => {
              try {
                markedReadIdsRef.current.add(m.id);
                await messagingApi.markRead(m.id);
              } catch {
                markedReadIdsRef.current.delete(m.id);
              }
            }),
          );

          // Keep local state consistent without requiring a refetch
          setMessages((prev) =>
            prev.map((m) =>
              unreadInbound.some((u) => u.id === m.id)
                ? {
                    ...m,
                    status: "read",
                    readAt: m.readAt || new Date().toISOString(),
                  }
                : m,
            ),
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedChannel, hasInternet]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !hasInternet) return;

    setSending(true);
    try {
      await messagingApi.send({
        channels: [selectedChannel],
        message: newMessage.trim(),
      });
      setNewMessage("");
      showToast("Message sent", "success");
      fetchMessages();
    } catch (err) {
      showToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOutbound = item.direction === "outbound";
    return (
      <View
        style={[
          styles.messageBubble,
          isOutbound ? styles.outbound : styles.inbound,
        ]}
      >
        <Text style={[styles.messageText, isOutbound && styles.outboundText]}>
          {item.content}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <FontAwesome name="lock" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>Please log in to access messages</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Channel selector */}
      <View style={styles.channelBar}>
        {CHANNELS.map((ch) => (
          <TouchableOpacity
            key={ch.key}
            style={[
              styles.channelButton,
              selectedChannel === ch.key && styles.channelButtonActive,
            ]}
            onPress={() => {
              setSelectedChannel(ch.key);
              setLoading(true);
            }}
          >
            <FontAwesome
              name={ch.icon as "inbox"}
              size={18}
              color={
                selectedChannel === ch.key ? "#fff" : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.channelLabel,
                selectedChannel === ch.key && styles.channelLabelActive,
              ]}
            >
              {ch.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.center}>
          <FontAwesome
            name="comments-o"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyText}>No messages yet</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          inverted
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Composer */}
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <FontAwesome name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: { marginTop: 12, fontSize: 16, color: theme.colors.textSecondary },
  channelBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  channelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  channelButtonActive: { backgroundColor: theme.colors.primary },
  channelLabel: {
    marginLeft: 6,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  channelLabelActive: { color: "#fff" },
  list: { paddingHorizontal: 12, paddingVertical: 8 },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  inbound: { alignSelf: "flex-start", backgroundColor: "#e5e5ea" },
  outbound: { alignSelf: "flex-end", backgroundColor: theme.colors.primary },
  messageText: { fontSize: 15, color: theme.colors.text },
  outboundText: { color: "#fff" },
  timestamp: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
  composer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    fontSize: 15,
    color: theme.colors.text,
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { opacity: 0.5 },
});
