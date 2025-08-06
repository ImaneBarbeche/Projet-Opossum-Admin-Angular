import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageService } from 'src/app/core/services/message.service';
import { ReportedMessage } from 'src/app/core/models/message.model';


@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class MessagesComponent implements OnInit {
  private readonly messageService = inject(MessageService);

  // Signals pour l'état principal
  reportedMessages = signal<ReportedMessage[]>([]);
  archivedMessages = signal<ReportedMessage[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Signals pour la modal de conversation
    showArchived = signal(false);
  selectedConversation = signal<any[] | null>(null);
  selectedConversationId = signal<string | null>(null);
  selectedMessageId = signal<string | null>(null);
  isLoadingConversation = signal(false);

   // Messages actuellement affichés
  currentMessages = computed(() => 
    this.showArchived() ? this.archivedMessages() : this.reportedMessages()
  );

  ngOnInit(): void {
    this.loadReportedMessages();
  }

  // Basculer entre signalés et archivés
  toggleArchived(showArchived: boolean) {
    this.showArchived.set(showArchived);
    this.clearMessages();
    
    if (showArchived) {
      this.loadArchivedMessages();
    } else {
      this.loadReportedMessages();
    }
  }

  // Charger les messages signalés
  async loadReportedMessages() {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const messages = await this.messageService.getReportedMessages();
      this.reportedMessages.set(messages);
      console.log('📩 Messages signalés chargés:', messages.length);
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || 'Erreur lors du chargement des messages signalés';
      this.error.set(errorMessage);
      console.error('❌ Erreur loadReportedMessages:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Charger les messages archivés
  async loadArchivedMessages() {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const messages = await this.messageService.getArchivedMessages();
      this.archivedMessages.set(messages);
      console.log('🗃️ Messages archivés chargés:', messages.length);
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || 'Erreur lors du chargement des messages archivés';
      this.error.set(errorMessage);
      console.error('❌ Erreur loadArchivedMessages:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Désarchiver un message
  async unarchive(messageId: string) {
    try {
      await this.messageService.unarchiveMessage(messageId);
      this.showSuccess('Message désarchivé avec succès');
      
      // Mettre à jour les listes
      await Promise.all([
        this.loadArchivedMessages(),
        this.loadReportedMessages()
      ]);
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || 'Erreur lors du désarchivage';
      this.error.set(errorMessage);
      console.error('❌ Erreur unarchive:', err);
    }
  }

  /**
   * ✅ Approuver un message
   */
  async approve(id: string): Promise<void> {
    this.clearMessages();
    try {
      await this.messageService.approveMessage(id);
      this.showSuccess("Message approuvé avec succès.");
      await this.loadReportedMessages();
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || "Erreur lors de l'approbation du message.";
      this.error.set(errorMessage);
      console.error('❌ Erreur approve:', err);
    }
  }

  /**
   * 🗃 Archiver un message
   */
  async archive(id: string): Promise<void> {
    this.clearMessages();
    try {
      await this.messageService.archiveMessage(id);
      this.showSuccess("Message archivé.");
      await this.loadReportedMessages();
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || "Erreur lors de l'archivage du message.";
      this.error.set(errorMessage);
      console.error('❌ Erreur archive:', err);
    }
  }

  /**
   * 🗑 Supprimer un message (soft delete)
   */
  async delete(id: string): Promise<void> {
    this.clearMessages();
    try {
      await this.messageService.deleteMessage(id);
      this.showSuccess("Message supprimé.");
      await this.loadReportedMessages();
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || "Erreur lors de la suppression du message.";
      this.error.set(errorMessage);
      console.error('❌ Erreur reject:', err);
    }
  }

  /**
   * 💬 Voir une conversation complète
   */
  async viewConversation(conversationId: string): Promise<void> {
    
    if (!conversationId) {
      this.error.set('ID de conversation manquant');
      return;
    }

    this.isLoadingConversation.set(true);
    this.error.set(null);
    this.selectedConversationId.set(conversationId);

    try {
      const messages = await this.messageService.getConversation(conversationId);
      
      // Debug des senderId uniques
      const uniqueUserIds = [...new Set(messages.map(m => m.senderId).filter(Boolean))];
      
      this.selectedConversation.set(messages);
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || "Impossible de charger la conversation.";
      this.error.set(errorMessage);
      console.error('❌ Erreur viewConversation:', err);
    } finally {
      this.isLoadingConversation.set(false);
    }
  }

   /**
   * 🚫 Bannir un utilisateur
   */
  async banUser(userId: string): Promise<void> {
    try {
      await this.messageService.banUser(userId);
      this.showSuccess("Utilisateur banni avec succès.");
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || "Erreur lors du bannissement.";
      this.error.set(errorMessage);
      console.error('❌ Erreur banUser:', err);
    }
  }

/**
   * ❌ Supprimer définitivement un message (hard delete)
   */
  async deleteMessage(id: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce message ?')) {
      return;
    }

    this.clearMessages();
    try {
      await this.messageService.deleteMessage(id);
      this.showSuccess("Message supprimé définitivement.");
      
      // Recharger la liste appropriée
      if (this.showArchived()) {
        await this.loadArchivedMessages();
      } else {
        await this.loadReportedMessages();
      }
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || "Erreur lors de la suppression définitive.";
      this.error.set(errorMessage);
      console.error('❌ Erreur deleteMessage:', err);
    }
  }

  private clearMessages() {
    this.success.set(null);
    this.error.set(null);
  }

  private showSuccess(message: string) {
    this.success.set(message);
    setTimeout(() => this.success.set(null), 3000);
  }

  /**
   * 📊 Obtenir les statistiques de la conversation
   */
  getConversationStats(): { participants: number; totalMessages: number } {
    const conversation = this.selectedConversation() || [];
    const uniqueUserIds = [...new Set(conversation.map(m => m.senderId).filter(Boolean))];
    
    return {
      participants: uniqueUserIds.length,
      totalMessages: conversation.length
    };
  }

  /**
   * 🏷️ Obtenir un nom d'utilisateur lisible
   */
  getUserDisplayName(message: any, index: number): string {
    if (message.authorUsername) {
      return message.authorUsername;
    }
    
    if (message.senderId) {
      // Identifier l'utilisateur unique basé sur le senderId
      const conversation = this.selectedConversation() || [];
      const uniqueUserIds = [...new Set(conversation.map(m => m.senderId).filter(Boolean))];
      const userIndex = uniqueUserIds.indexOf(message.senderId);
      
      if (userIndex !== -1) {
        return `Utilisateur ${userIndex + 1}`;
      }
    }
    
    return 'Utilisateur anonyme';
  }

  /**
   * 🔍 Identifier le message signalé par son contenu
   */
  isReportedMessage(message: any): boolean {
    // Si on a un messageId spécifique du message signalé
    if (this.selectedMessageId() && message.messageId === this.selectedMessageId()) {
      return true;
    }
    
    // Sinon, on peut identifier par le contenu si c'est le même que le message original
    const originalMessage = this.currentMessages().find(m => m.conversationId === this.selectedConversationId());
    return !!(originalMessage && message.content === originalMessage.content);
  }

    /**
   * 🔒 Fermer la modal de conversation
   */
  closeConversation(): void {
    this.selectedConversation.set(null);
    this.selectedConversationId.set(null);
    this.selectedMessageId.set(null);
  }


}
