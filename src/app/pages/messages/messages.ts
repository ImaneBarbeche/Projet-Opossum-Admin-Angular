import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'src/app/core/services/message.service';
import { ReportedMessage } from 'src/app/core/models/message.model';
import { Page } from 'src/app/core/models/page.model';

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
    } catch (err) {
      this.error.set('Erreur lors du chargement des messages signalés');
      console.error(err);
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
    } catch (err) {
      this.error.set('Erreur lors du chargement des messages archivés');
      console.error(err);
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
      await this.loadArchivedMessages();
      await this.loadReportedMessages();
    } catch (err) {
      this.error.set('Erreur lors du désarchivage');
      console.error(err);
    }
  }

  /**
   * ✅ Approuver un message
   */
  async approve(id: string): Promise<void> {
    this.success.set(null);
    try {
      await this.messageService.approveMessage(id);
      this.showSuccess("Message approuvé avec succès.");
      await this.loadReportedMessages();
    } catch (err) {
      this.error.set("Erreur lors de l'approbation du message.");
      console.error(err);
    }
  }

  /**
   * 🗃 Archiver un message
   */
  async archive(id: string): Promise<void> {
    this.success.set(null);
    try {
      await this.messageService.archiveMessage(id);
      this.showSuccess("Message archivé.");
      await this.loadReportedMessages();
    } catch (err) {
      this.error.set("Erreur lors de l'archivage du message.");
      console.error(err);
    }
  }

  /**
   * 🗑 Rejeter un message
   */
  async reject(id: string): Promise<void> {
    this.success.set(null);
    try {
      await this.messageService.rejectMessage(id);
      this.showSuccess("Message supprimé.");
      await this.loadReportedMessages();
    } catch (err) {
      this.error.set("Erreur lors de la suppression du message.");
      console.error(err);
    }
  }

  /**
   * 💬 Voir une conversation complète
   */
  async viewConversation(conversationId: string): Promise<void> {
    console.log('viewConversation appelé avec:', conversationId);
    
    if (!conversationId) {
      this.error.set('ID de conversation manquant');
      return;
    }

    this.isLoadingConversation.set(true);
    this.error.set(null);
    this.selectedConversationId.set(conversationId);

    // Identifier le message signalé
    const reportedMsg = this.reportedMessages().find(rm => rm.conversationId === conversationId);
    if (reportedMsg) {
      this.selectedMessageId.set(reportedMsg.id);
    }

    try {
      const messages = await this.messageService.getConversation(conversationId);
      this.selectedConversation.set(messages);
    } catch (err) {
      console.error('Erreur conversation:', err);
      this.error.set("Impossible de charger la conversation.");
    } finally {
      this.isLoadingConversation.set(false);
    }
  }

  /**
   * 🔒 Fermer la modal de conversation
   */
  closeConversation(): void {
    this.selectedConversation.set(null);
    this.selectedConversationId.set(null);
    this.selectedMessageId.set(null);
  }

  /**
   * 🚫 Bannir un utilisateur
   */
  banUser(userId: string): void {
    console.log(`Bannir utilisateur ${userId}`);
    // TODO : Implémenter avec adminUserService.banUser(userId)
  }

  /**
   * ❌ Supprimer définitivement un message
   */
  deleteMessage(id: string): void {
    console.warn("Suppression définitive non encore implémentée.");
    // TODO : ajouter un endpoint DELETE et l'appeler ici
  }

  private clearMessages() {
    this.success.set(null);
    this.error.set(null);
  }

  private showSuccess(message: string) {
    this.success.set(message);
    setTimeout(() => this.success.set(null), 3000);
  }
}