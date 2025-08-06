export interface ReportedMessage {
  id: string;
  content: string;
  createdAt: string;
  status: MessageStatus;
  authorUsername: string;
  authorId: string;
  conversationId: string;
  reports: ReportDTO[];
  moderationHistory: ModerationAction[];
}

export interface ReportDTO {
  id: number;
  reason: string;
  reportedByUsername: string;
  createdAt: string;
}

export interface ModerationAction {
  action: 'REPORTED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  by: string;
  at: string;
}

export type MessageStatus = 'REPORTED' | 'ARCHIVED' | 'ACTIVE' | 'DELETED';

export interface Message {
  id: string;
  content: string;
  senderUsername: string;
  sentAt: string;
  isRead: boolean;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  listingId: string;
  listingTitle: string;
  lastMessage?: Message;
  lastMessageAt: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  username: string;
  role: 'OWNER' | 'INTERESTED_USER';
  joinedAt: string;
}

export type ConversationStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

// Étendre le modèle Message existant si nécessaire
export interface ConversationMessage extends Message {
  conversationId: string;
  senderId: string;
}