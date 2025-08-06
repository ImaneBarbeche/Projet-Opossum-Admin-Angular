import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, firstValueFrom } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { ReportedMessage } from '../models/message.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/messages`;


  /**
   * 🗃️ Récupérer les messages archivés
   */
  async getArchivedMessages(): Promise<ReportedMessage[]> {
    return firstValueFrom(
      this.http.get<ReportedMessage[]>(`${this.baseUrl}/archived`, {
        withCredentials: true
      })
    );
  }

  /**
   * 📤 Désarchiver un message
   */
  async unarchiveMessage(messageId: string): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${this.baseUrl}/${messageId}/unarchive`, {}, {
        withCredentials: true
      })
    );
  }
  /**
   * 📩 Liste des messages signalés
   */
  async getReportedMessages(): Promise<ReportedMessage[]> {
    const page = await firstValueFrom(
      this.http.get<Page<ReportedMessage>>(
        `${this.baseUrl}/moderation/reported`,
        { withCredentials: true }
      )
    );
    return page.content || [];
  }

  /**
   * ✅ Approuver un message (ignorer le signalement)
   */
  async approveMessage(messageId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.baseUrl}/${messageId}/moderate/approve`,
        {},
        { withCredentials: true }
      )
    );
  }

  /**
   * 🗃 Archiver un message
   */
  async archiveMessage(messageId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.baseUrl}/${messageId}/moderate/archive`,
        {},
        { withCredentials: true }
      )
    );
  }

  /**
   * 🗑 Rejeter un message (suppression)
   */
  async rejectMessage(messageId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.baseUrl}/${messageId}/moderate/reject`,
        {},
        { withCredentials: true }
      )
    );
  }

  /**
   * 💬 Voir une conversation complète
   */
  async getConversation(conversationId: string): Promise<ReportedMessage[]> {
    const page = await firstValueFrom(
      this.http.get<Page<ReportedMessage>>(
        `${this.baseUrl}/conversations/${conversationId}`,
        { withCredentials: true }
      )
    );
    return page.content || [];
  }
}
