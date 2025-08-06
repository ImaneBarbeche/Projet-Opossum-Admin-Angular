import { Component, OnInit, inject, signal } from '@angular/core';
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
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Signals pour la modal de conversation
  selectedConversation = signal<ReportedMessage[] | null>(null);
  selectedConversationId = signal<string | null>(null);
  selectedMessageId = signal<string | null>(null);
  isLoadingConversation = signal(false);

  ngOnInit(): void {
    this.loadMessages();
  }

  /**
   * 🔄 Charge la liste des messages signalés depuis l'API
   */
loadMessages(): void {
  this.isLoading.set(true);
  this.error.set(null);
  this.messageService.getReportedMessages().subscribe({
    next: (res: Page<ReportedMessage>) => {
      console.log('API Response:', res); // Debug complet
      console.log('First message:', res.content[0]); // Debug premier message
      this.reportedMessages.set(res.content);
      this.isLoading.set(false);
    },
    error: () => {
      this.error.set("Erreur lors du chargement des messages.");
      this.isLoading.set(false);
    }
  });
}

  /**
   * ✅ Approuver un message
   */
  approve(id: string): void {
    this.success.set(null);
    this.messageService.approveMessage(id).subscribe({
      next: () => {
        this.success.set("Message approuvé avec succès.");
        this.loadMessages();
      },
      error: () => this.error.set("Erreur lors de l'approbation du message.")
    });
  }

  /**
   * 🗃 Archiver un message
   */
  archive(id: string): void {
    this.success.set(null);
    this.messageService.archiveMessage(id).subscribe({
      next: () => {
        this.success.set("Message archivé.");
        this.loadMessages();
      },
      error: () => this.error.set("Erreur lors de l'archivage du message.")
    });
  }

  /**
   * 🗑 Rejeter un message
   */
  reject(id: string): void {
    this.success.set(null);
    this.messageService.rejectMessage(id).subscribe({
      next: () => {
        this.success.set("Message supprimé.");
        this.loadMessages();
      },
      error: () => this.error.set("Erreur lors de la suppression du message.")
    });
  }

  /**
   * 💬 Voir une conversation complète
   */
  viewConversation(conversationId: string): void {
    console.log('viewConversation appelé avec:', conversationId); // Debug
    
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

    this.messageService.getConversation(conversationId).subscribe({
      next: (res: Page<ReportedMessage>) => {
        this.selectedConversation.set(res.content);
        this.isLoadingConversation.set(false);
      },
      error: (err) => {
        console.error('Erreur conversation:', err); // Debug
        this.error.set("Impossible de charger la conversation.");
        this.isLoadingConversation.set(false);
      }
    });
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
}