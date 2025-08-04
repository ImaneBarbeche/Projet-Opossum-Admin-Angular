import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ReportedMessage } from '../models/message.model';
import { Page } from '../models/page.model'; // si tu veux gérer la pagination proprement

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = `${environment.apiUrl}/admin/messages`;

  constructor(private http: HttpClient) {}

  /**
   * 📩 Liste des messages signalés
   */
  getReportedMessages(): Observable<Page<ReportedMessage>> {
    return this.http.get<Page<ReportedMessage>>(
      `${this.baseUrl}/moderation/reported`,
      { withCredentials: true }
    );
  }

  /**
   * ✅ Approuver un message (ignorer le signalement)
   */
  approveMessage(messageId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${messageId}/moderate/approve`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * 🗃 Archiver un message
   */
  archiveMessage(messageId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${messageId}/moderate/archive`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * 🗑 Rejeter un message (suppression)
   */
  rejectMessage(messageId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${messageId}/moderate/reject`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * 💬 Voir une conversation complète
   */
  getConversation(conversationId: string): Observable<Page<ReportedMessage>> {
    return this.http.get<Page<ReportedMessage>>(
      `${this.baseUrl}/conversations/${conversationId}`,
      { withCredentials: true }
    );
  }
}
