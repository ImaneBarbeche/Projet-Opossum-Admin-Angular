import { Component, OnInit } from '@angular/core';
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

  reportedMessages: ReportedMessage[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  /**
   * 🔄 Charge la liste des messages signalés depuis l’API
   */
  loadMessages(): void {
    this.isLoading = true;
    this.error = null;
    this.messageService.getReportedMessages().subscribe({
      next: (res) => {
        this.reportedMessages = res.content; // si pagination
        this.isLoading = false;
      },
      error: () => {
        this.error = "Erreur lors du chargement des messages.";
        this.isLoading = false;
      }
    });
  }

  /**
   * ✅ Approuver un message
   */
  approve(id: string): void {
    this.success = null;
    this.messageService.approveMessage(id).subscribe({
      next: () => {
        this.success = "Message approuvé avec succès.";
        this.loadMessages();
      },
      error: () => this.error = "Erreur lors de l’approbation du message."
    });
  }

  /**
   * 🗃 Archiver un message
   */
  archive(id: string): void {
    this.success = null;
    this.messageService.archiveMessage(id).subscribe({
      next: () => {
        this.success = "Message archivé.";
        this.loadMessages();
      },
      error: () => this.error = "Erreur lors de l’archivage du message."
    });
  }

  /**
   * 🗑 Rejeter un message
   */
  reject(id: string): void {
    this.success = null;
    this.messageService.rejectMessage(id).subscribe({
      next: () => {
        this.success = "Message supprimé.";
        this.loadMessages();
      },
      error: () => this.error = "Erreur lors de la suppression du message."
    });
  }
  viewConversation(conversationId: string): void {
  this.messageService.getConversation(conversationId).subscribe({
    next: (res) => {
      console.log("Conversation reçue :", res.content); // ou ouvrir une modale plus tard
    },
    error: () => {
      this.error = "Impossible de charger la conversation.";
    }
  });
}

banUser(userId: string): void {
  console.log(`Bannir utilisateur ${userId}`);
  // TODO : Implémenter avec adminUserService.banUser(userId)
}

deleteMessage(id: string): void {
  console.warn("Suppression définitive non encore implémentée.");
  // TODO : ajouter un endpoint DELETE et l'appeler ici
}



}
