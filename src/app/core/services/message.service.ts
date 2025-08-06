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
    console.log('🔍 API Call: GET', url);
    
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
   * 📤 Désarchiver un message - FONCTIONNALITÉ NON DISPONIBLE
   */
  async unarchiveMessage(messageId: string): Promise<void> {
    throw new Error('Fonctionnalité non disponible : désarchiver un message n\'existe pas dans l\'API backend');
  }
  /**
   * 📩 Liste des messages signalés 
   */
  async getReportedMessages(): Promise<ReportedMessage[]> {
    const url = `${this.baseUrl}/moderation/reported`;
    console.log('🔍 API Call: GET', url);
    
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
    console.log('🔍 API Call: POST', url);
    
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
    console.log('🔍 API Call: POST', url);
    
    return firstValueFrom(
      this.http.post<void>(url, {}, {
        withCredentials: true
      })
    );
  }

   /**
   * 🗑 Supprimer un message 
   */
  async deleteMessage(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/${messageId}/moderate/delete`;
    console.log('🔍 API Call: POST', url);
    
    return firstValueFrom(
      this.http.post<void>(url, {}, {
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

    /**
   * 🚫 Bannir un utilisateur
   */
  async banUser(userId: string, duration?: number): Promise<void> {
    console.log('🔍 API Call: POST', `${environment.apiUrl}/admin/users/${userId}/ban`);
    
    const body = duration ? { duration } : {};
    
    return firstValueFrom(
      this.http.post<void>(`${environment.apiUrl}/admin/users/${userId}/ban`, body, {
        withCredentials: true
      })
    );
  }
}
