import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'src/app/core/services/message.service';
import { ReportedMessage } from 'src/app/core/models/message.model';


@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
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
  selectedConversation = signal<ReportedMessage[] | null>(null);
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
   * 🗑 Rejeter un message
   */
  async reject(id: string): Promise<void> {
    this.clearMessages();
    try {
      await this.messageService.rejectMessage(id);
      this.showSuccess("Message rejeté.");
      await this.loadReportedMessages();
    } catch (err: any) {
      const errorMessage = err?.error?.message || err?.message || "Erreur lors du rejet du message.";
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
   * ❌ Supprimer définitivement un message
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
   * 🔒 Fermer la modal de conversation
   */
  closeConversation(): void {
    this.selectedConversation.set(null);
    this.selectedConversationId.set(null);
    this.selectedMessageId.set(null);
  }


}
