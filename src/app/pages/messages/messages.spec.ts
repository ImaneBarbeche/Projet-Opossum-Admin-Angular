import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'src/app/core/services/message.service';
import { UserService } from 'src/app/core/services/user.service';

import { MessagesComponent } from './messages.component';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;

let messageServiceSpy: jasmine.SpyObj<MessageService> = jasmine.createSpyObj('MessageService', [
  'getReportedMessages',
  'getArchivedMessages',
  'unarchiveMessage',
  'approveMessage',
  'archiveMessage',
  'deleteMessage',
  'getConversation'
]);
let userServiceSpy: jasmine.SpyObj<UserService> = jasmine.createSpyObj('UserService', ['blockUser']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should load reported messages on init', async () => {
    const mockMessages = [{
      id: '1',
      content: 'test',
      createdAt: new Date().toISOString(),
      status: 'REPORTED' as import('src/app/core/models/message.model').MessageStatus,
      authorUsername: 'user',
      authorId: 'u1',
      conversationId: 'c1',
      reports: [],
      moderationHistory: []
    }];
    messageServiceSpy.getReportedMessages.and.returnValue(Promise.resolve(mockMessages));
    await component.loadReportedMessages();
    expect(component.reportedMessages()).toEqual(mockMessages as any);
    expect(component.isLoading()).toBeFalse();
  });

  it('should handle error when loading reported messages', async () => {
    messageServiceSpy.getReportedMessages.and.returnValue(Promise.reject({ message: 'fail' }));
    await component.loadReportedMessages();
    expect(component.error()).toContain('fail');
    expect(component.isLoading()).toBeFalse();
  });

  it('should toggle archived and call correct loader', async () => {
    const archived = [{
      id: '2',
      content: 'archived',
      createdAt: new Date().toISOString(),
      status: 'ARCHIVED' as import('src/app/core/models/message.model').MessageStatus,
      authorUsername: 'user2',
      authorId: 'u2',
      conversationId: 'c2',
      reports: [],
      moderationHistory: []
    }];
    messageServiceSpy.getArchivedMessages.and.returnValue(Promise.resolve(archived));
    component.toggleArchived(true);
    await fixture.whenStable();
    expect(component.showArchived()).toBeTrue();
  });

  it('should call approveMessage and reload', async () => {
    messageServiceSpy.approveMessage.and.returnValue(Promise.resolve());
    messageServiceSpy.getReportedMessages.and.returnValue(Promise.resolve([]));
    await component.approve('1');
    expect(messageServiceSpy.approveMessage).toHaveBeenCalledWith('1');
    expect(component.success()).toContain('approuvé');
  });

  it('should call archiveMessage and reload', async () => {
    messageServiceSpy.archiveMessage.and.returnValue(Promise.resolve());
    messageServiceSpy.getReportedMessages.and.returnValue(Promise.resolve([]));
    await component.archive('1');
    expect(messageServiceSpy.archiveMessage).toHaveBeenCalledWith('1');
    expect(component.success()).toContain('archivé');
  });

  it('should call deleteMessage and reload', async () => {
    messageServiceSpy.deleteMessage.and.returnValue(Promise.resolve());
    messageServiceSpy.getReportedMessages.and.returnValue(Promise.resolve([]));
    await component.delete('1');
    expect(messageServiceSpy.deleteMessage).toHaveBeenCalledWith('1');
    expect(component.success()).toContain('supprimé');
  });

  it('should handle error on approve', async () => {
    messageServiceSpy.approveMessage.and.returnValue(Promise.reject({ message: 'fail' }));
    await component.approve('1');
    expect(component.error()).toContain('fail');
  });

  it('should handle error on archive', async () => {
    messageServiceSpy.archiveMessage.and.returnValue(Promise.reject({ message: 'fail' }));
    await component.archive('1');
    expect(component.error()).toContain('fail');
  });

  it('should handle error on delete', async () => {
    messageServiceSpy.deleteMessage.and.returnValue(Promise.reject({ message: 'fail' }));
    await component.delete('1');
    expect(component.error()).toContain('fail');
  });
});
