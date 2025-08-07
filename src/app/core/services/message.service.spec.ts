import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from './message.service';
import { ReportedMessage } from '../models/message.model';
import { environment } from 'src/environments/environment';
import { Page } from '../models/page.model';

const mockMessage: ReportedMessage = {
  id: 'm1',
  content: 'Test message',
  authorId: 'u1',
  authorUsername: 'alice',
  createdAt: new Date().toISOString(),
  status: 'REPORTED',
  conversationId: 'c1',
  reports: [],
  moderationHistory: []
};

const mockPage: Page<ReportedMessage> = {
  content: [mockMessage],
  totalElements: 1,
  totalPages: 1,
  number: 0
};

describe('MessageService', () => {
  let service: MessageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MessageService]
    });
    service = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get archived messages', async () => {
    const promise = service.getArchivedMessages();
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/messages/archived`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
    const result = await promise;
    expect(result).toEqual([mockMessage]);
  });

  it('should unarchive a message', async () => {
    const promise = service.unarchiveMessage('m1');
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/messages/m1/moderate/unarchive`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await expectAsync(promise).toBeResolved();
  });

  it('should get reported messages', async () => {
    const promise = service.getReportedMessages();
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/messages/moderation/reported`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
    const result = await promise;
    expect(result).toEqual([mockMessage]);
  });

  it('should approve a message', async () => {
    const promise = service.approveMessage('m1');
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/messages/m1/moderate/approved`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await expectAsync(promise).toBeResolved();
  });

  it('should archive a message', async () => {
    const promise = service.archiveMessage('m1');
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/messages/m1/moderate/archived`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await expectAsync(promise).toBeResolved();
  });

  it('should delete a message', async () => {
    const promise = service.deleteMessage('m1');
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/messages/m1/moderate/delete`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await expectAsync(promise).toBeResolved();
  });

  it('should get conversation', async () => {
    const mockConvPage: Page<any> = { content: [{ id: 'msg1' }], totalElements: 1, totalPages: 1, number: 0 };
    const promise = service.getConversation('c1');
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/messages/conversations/c1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockConvPage);
    const result = await promise;
    expect(result).toEqual([{ id: 'msg1' }]);
  });
});
