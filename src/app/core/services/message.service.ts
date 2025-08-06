import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
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
    const url = `${this.baseUrl}/archived`;
    
    try {
      const response = await firstValueFrom(
        this.http.get<Page<ReportedMessage>>(url, {
          withCredentials: true
        })
      );
      
      return response?.content || [];
    } catch (error) {
      console.error('❌ Erreur getArchivedMessages:', error);
      throw error;
    }
  }

  /**
   * 📤 Désarchiver un message 
   */
  async unarchiveMessage(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/${messageId}/moderate/unarchive`;

    return firstValueFrom(
      this.http.post<void>(url, {}, {
        withCredentials: true
      })
    );
  }

  /**
   * 📩 Liste des messages signalés 
   */
  async getReportedMessages(): Promise<ReportedMessage[]> {
    const url = `${this.baseUrl}/moderation/reported`;
    
    try {
      const response = await firstValueFrom(
        this.http.get<Page<ReportedMessage>>(url, {
          withCredentials: true
        })
      );
          return response?.content || [];
    } catch (error) {
      console.error('❌ Erreur getReportedMessages:', error);
      throw error;
    }
  }

  /**
   * ✅ Approuver un message 
   */
  async approveMessage(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/${messageId}/moderate/approved`;
    
    return firstValueFrom(
      this.http.post<void>(url, {}, {
        withCredentials: true
      })
    );
  }

   /**
   * 🗃 Archiver un message 
   */
  async archiveMessage(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/${messageId}/moderate/archived`;
    
    return firstValueFrom(
      this.http.post<void>(url, {}, {
        withCredentials: true
      })
    );
  }

   /**
   * 🗑 Supprimer un message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/${messageId}/moderate/delete`;
    return firstValueFrom(
      this.http.delete<void>(url, {
        withCredentials: true
      })
    );
  }

  /**
   * 💬 Voir une conversation complète 
   */
  async getConversation(conversationId: string): Promise<any[]> {
    const url = `${this.baseUrl}/conversations/${conversationId}`;
    
    try {
      const response = await firstValueFrom(
        this.http.get<Page<any>>(url, {
          withCredentials: true
        })
      );
      
      // Vérifier si c'est une Page ou un array direct
      if (response && typeof response === 'object' && 'content' in response) {
        return response.content || [];
      }
      // Si c'est déjà un array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('❌ Erreur getConversation:', error);
      throw error;
    }
  }

}
