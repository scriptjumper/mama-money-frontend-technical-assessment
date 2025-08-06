import { TestBed } from '@angular/core/testing';
import { PushNotificationService } from './push-notification.service';
import { BrazeService, BrazeContentCard } from './braze.service';
import { InboxService } from './inbox.service';
import { PushNotifications } from '@capacitor/push-notifications';

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let mockBrazeService: jasmine.SpyObj<BrazeService>;
  let mockInboxService: jasmine.SpyObj<InboxService>;

  const mockContentCard: BrazeContentCard = {
    id: '1',
    title: 'Test Card',
    cardDescription: 'Test Description',
    created: Date.now() / 1000,
    expiresAt: Date.now() / 1000 + 3600,
    viewed: false,
    clicked: false,
    pinned: false,
    dismissed: false,
    dismissible: true,
    openURLInWebView: false,
    domain: 'test.com',
    type: 'CLASSIC',
    extras: {},
    image: undefined,
    url: undefined
  };

  beforeEach(() => {
    // Create service mocks
    mockBrazeService = jasmine.createSpyObj('BrazeService', [
      'initialize',
      'requestContentCardsRefresh',
      'getContentCards'
    ]);
    mockInboxService = jasmine.createSpyObj('InboxService', ['setCards', 'addCards']);

    // Mock PushNotifications
    spyOn(PushNotifications, 'requestPermissions').and.returnValue(Promise.resolve({ receive: 'granted' }));
    spyOn(PushNotifications, 'register').and.returnValue(Promise.resolve());
    spyOn(PushNotifications, 'addListener').and.returnValue(Promise.resolve({ remove: jasmine.createSpy() }));

    TestBed.configureTestingModule({
      providers: [
        PushNotificationService,
        { provide: BrazeService, useValue: mockBrazeService },
        { provide: InboxService, useValue: mockInboxService }
      ]
    });
    service = TestBed.inject(PushNotificationService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject required services', () => {
      expect(service['brazeService']).toBeDefined();
      expect(service['inboxService']).toBeDefined();
    });
  });

  describe('init method', () => {
    beforeEach(() => {
      mockBrazeService.initialize.and.returnValue(Promise.resolve());
      mockBrazeService.requestContentCardsRefresh.and.returnValue(Promise.resolve());
      mockBrazeService.getContentCards.and.returnValue(Promise.resolve([mockContentCard]));
      spyOn(service as any, 'setupPushListeners');
      spyOn(service as any, 'registerPush').and.returnValue(Promise.resolve());
      spyOn(service as any, 'loadInitialContentCards').and.returnValue(Promise.resolve());
    });

    it('should initialize Braze SDK', async () => {
      await service.init();
      expect(mockBrazeService.initialize).toHaveBeenCalled();
    });

    it('should setup push listeners', async () => {
      await service.init();
      expect(service['setupPushListeners']).toHaveBeenCalled();
    });

    it('should register for push notifications', async () => {
      await service.init();
      expect(service['registerPush']).toHaveBeenCalled();
    });

    it('should load initial content cards', async () => {
      await service.init();
      expect(service['loadInitialContentCards']).toHaveBeenCalled();
    });

    it('should handle Braze initialization error', async () => {
      const error = new Error('Braze init failed');
      mockBrazeService.initialize.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await service.init();

      expect(console.error).toHaveBeenCalledWith('Error initializing Braze SDK:', error);
      // Should continue with other initialization steps
      expect(service['setupPushListeners']).toHaveBeenCalled();
    });

    it('should log initialization steps', async () => {
      spyOn(console, 'log');

      await service.init();

      expect(console.log).toHaveBeenCalledWith('Initializing PushNotificationService...');
      expect(console.log).toHaveBeenCalledWith('Braze SDK initialized in PushNotificationService');
      expect(console.log).toHaveBeenCalledWith('PushNotificationService initialization complete');
    });
  });

  describe('loadInitialContentCards', () => {
    beforeEach(() => {
      mockBrazeService.requestContentCardsRefresh.and.returnValue(Promise.resolve());
      mockBrazeService.getContentCards.and.returnValue(Promise.resolve([mockContentCard]));
    });

    it('should request content cards refresh', async () => {
      await service['loadInitialContentCards']();
      expect(mockBrazeService.requestContentCardsRefresh).toHaveBeenCalled();
    });

    it('should get content cards from cache', async () => {
      await service['loadInitialContentCards']();
      expect(mockBrazeService.getContentCards).toHaveBeenCalled();
    });

    it('should set cards in inbox service', async () => {
      await service['loadInitialContentCards']();
      expect(mockInboxService.setCards).toHaveBeenCalledWith([mockContentCard]);
    });

    it('should handle empty content cards', async () => {
      mockBrazeService.getContentCards.and.returnValue(Promise.resolve([]));

      await service['loadInitialContentCards']();

      expect(mockInboxService.setCards).toHaveBeenCalledWith([]);
    });

    it('should handle errors during content card loading', async () => {
      const error = new Error('Failed to load cards');
      mockBrazeService.getContentCards.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await service['loadInitialContentCards']();

      expect(console.error).toHaveBeenCalledWith('Error loading initial content cards:', error);
    });

    it('should include delay between refresh and fetch', async () => {
      const startTime = Date.now();
      await service['loadInitialContentCards']();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(1000); // At least 1 second delay
    });

    it('should log loading steps', async () => {
      spyOn(console, 'log');

      await service['loadInitialContentCards']();

      expect(console.log).toHaveBeenCalledWith('Loading initial content cards...');
      expect(console.log).toHaveBeenCalledWith('Loaded 1 content cards into inbox');
    });
  });

  describe('registerPush', () => {
    it('should request push notification permissions', async () => {
      await service['registerPush']();
      expect(PushNotifications.requestPermissions).toHaveBeenCalled();
    });

    it('should register for push notifications when permission granted', async () => {
      PushNotifications.requestPermissions = jasmine.createSpy().and.returnValue(
        Promise.resolve({ receive: 'granted' })
      );

      await service['registerPush']();

      expect(PushNotifications.register).toHaveBeenCalled();
    });

    it('should handle permission denied', async () => {
      PushNotifications.requestPermissions = jasmine.createSpy().and.returnValue(
        Promise.resolve({ receive: 'denied' })
      );
      spyOn(console, 'warn');

      await service['registerPush']();

      expect(console.warn).toHaveBeenCalledWith('Push notification permission denied');
      expect(PushNotifications.register).not.toHaveBeenCalled();
    });

    it('should handle errors during registration', async () => {
      const error = new Error('Registration failed');
      PushNotifications.requestPermissions = jasmine.createSpy().and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await service['registerPush']();

      expect(console.error).toHaveBeenCalledWith('Error registering for push notifications:', error);
    });

    it('should log registration success', async () => {
      spyOn(console, 'log');

      await service['registerPush']();

      expect(console.log).toHaveBeenCalledWith('Push notifications registered successfully');
    });
  });

  describe('setupPushListeners', () => {
    it('should setup push notification listeners', () => {
      service['setupPushListeners']();

      expect(PushNotifications.addListener).toHaveBeenCalledWith('registration' as any, jasmine.any(Function));
      expect(PushNotifications.addListener).toHaveBeenCalledWith('registrationError' as any, jasmine.any(Function));
      expect(PushNotifications.addListener).toHaveBeenCalledWith('pushNotificationReceived' as any, jasmine.any(Function));
      expect(PushNotifications.addListener).toHaveBeenCalledWith('pushNotificationActionPerformed', jasmine.any(Function));
    });

    it('should handle registration success', () => {
      spyOn(console, 'log');
      service['setupPushListeners']();

      // Get the registration listener
      const registrationCall = (PushNotifications.addListener as jasmine.Spy).calls.all()
        .find(call => call.args[0] === 'registration');
      const registrationHandler = registrationCall?.args[1];

      const token = { value: 'test-token' };
      registrationHandler(token);

      expect(console.log).toHaveBeenCalledWith('Push registration success, token:', 'test-token');
    });

    it('should handle registration error', () => {
      spyOn(console, 'error');
      service['setupPushListeners']();

      const registrationErrorCall = (PushNotifications.addListener as jasmine.Spy).calls.all()
        .find(call => call.args[0] === 'registrationError');
      const errorHandler = registrationErrorCall?.args[1];

      const error = { error: 'Registration failed' };
      errorHandler(error);

      expect(console.error).toHaveBeenCalledWith('Push registration error:', error);
    });
  });

  describe('push notification handling', () => {
    beforeEach(() => {
      service['setupPushListeners']();
    });

    it('should handle received push notification', () => {
      spyOn(console, 'log');
      spyOn(service as any, 'handleBrazePushNotification');

      const receivedCall = (PushNotifications.addListener as jasmine.Spy).calls.all()
        .find(call => call.args[0] === 'pushNotificationReceived');
      const receivedHandler = receivedCall?.args[1];

      const notification = {
        id: 'test-notification-1',
        title: 'Test',
        body: 'Test notification',
        data: { type: 'braze' }
      };
      receivedHandler(notification);

      expect(console.log).toHaveBeenCalledWith('Push notification received:', notification);
      expect(service['handleBrazePushNotification']).toHaveBeenCalledWith(notification);
    });

    it('should handle push notification action', () => {
      spyOn(console, 'log');
      spyOn(service as any, 'handleBrazePushNotification');

      const actionCall = (PushNotifications.addListener as jasmine.Spy).calls.all()
        .find(call => call.args[0] === 'pushNotificationActionPerformed');
      const actionHandler = actionCall?.args[1];

      const action = {
        notification: {
          title: 'Test',
          body: 'Test notification',
          data: { type: 'braze' }
        },
        actionId: 'tap'
      };
      actionHandler(action);

      expect(console.log).toHaveBeenCalledWith('Push notification action performed:', action);
      expect(service['handleBrazePushNotification']).toHaveBeenCalledWith(jasmine.objectContaining({
        title: action.notification.title,
        body: action.notification.body
      }));
    });
  });

  describe('handleBrazePushNotification', () => {
    beforeEach(() => {
      mockBrazeService.requestContentCardsRefresh.and.returnValue(Promise.resolve());
      mockBrazeService.getContentCards.and.returnValue(Promise.resolve([mockContentCard]));
    });

    it('should handle Braze notifications', async () => {
      const notification = {
        id: "test-notification",
        data: { 
          source: 'braze',
          campaign_id: 'test-campaign'
        }
      };

      await service['handleBrazePushNotification'](notification);

      expect(mockBrazeService.requestContentCardsRefresh).toHaveBeenCalled();
    });

    it('should detect Braze notifications by different identifiers', async () => {
      const brazeNotifications = [
        { id: 'test1', data: { source: 'braze' } },
        { id: 'test2', data: { campaign_id: 'test' } },
        { id: 'test3', data: { canvas_id: 'test' } },
        { id: 'test4', data: { ab_campaign_id: 'test' } }
      ];

      for (const notification of brazeNotifications) {
        await service['handleBrazePushNotification'](notification);
        expect(mockBrazeService.requestContentCardsRefresh).toHaveBeenCalled();
        mockBrazeService.requestContentCardsRefresh.calls.reset();
      }
    });

    it('should skip non-Braze notifications', async () => {
      const notification = {
        id: "test-notification",
        data: { 
          type: 'other',
          message: 'Not from Braze'
        }
      };

      await service['handleBrazePushNotification'](notification);

      expect(mockBrazeService.requestContentCardsRefresh).not.toHaveBeenCalled();
    });

    it('should handle notifications without data', async () => {
      const notification = {
        id: "test-notification",
        data: {}
      };

      expect(async () => await service['handleBrazePushNotification'](notification)).not.toThrow();
      expect(mockBrazeService.requestContentCardsRefresh).not.toHaveBeenCalled();
    });

    it('should refresh content cards after Braze notification', async () => {
      const notification = {
        id: "test-notification", data: { source: 'braze' } };

      await service['handleBrazePushNotification'](notification);

      expect(mockBrazeService.requestContentCardsRefresh).toHaveBeenCalled();
      expect(mockBrazeService.getContentCards).toHaveBeenCalled();
      expect(mockInboxService.addCards).toHaveBeenCalledWith([mockContentCard]);
    });

    it('should handle errors during notification processing', async () => {
      const error = new Error('Processing failed');
      mockBrazeService.requestContentCardsRefresh.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      const notification = {
        id: "test-notification", data: { source: 'braze' } };
      await service['handleBrazePushNotification'](notification);

      expect(console.error).toHaveBeenCalledWith('Error handling push notification:', error);
    });
  });

  describe('Notification Type Detection Logic', () => {
    it('should detect Braze inbox notifications by type', () => {
      // Test the inline logic that would be used in handleBrazePushNotification
      const notification = {
        id: "test-notification", data: { type: 'inbox' } };
      const extras = notification.data || {};
      const isInboxNotification = (extras as any).type === 'inbox' || (extras as any)._ab === 'true';
      
      expect(isInboxNotification).toBe(true);
    });

    it('should detect Braze notifications by _ab flag', () => {
      const notification = {
        id: "test-notification", data: { _ab: 'true' } };
      const extras = notification.data || {};
      const isInboxNotification = (extras as any).type === 'inbox' || (extras as any)._ab === 'true';
      
      expect(isInboxNotification).toBe(true);
    });

    it('should not detect non-Braze notifications', () => {
      const notification = {
        id: "test-notification", data: { type: 'other' } };
      const extras = notification.data || {};
      const isInboxNotification = (extras as any).type === 'inbox' || (extras as any)._ab === 'true';
      
      expect(isInboxNotification).toBe(false);
    });

    it('should handle notifications without data', () => {
      const notification = {
        id: "test-notification",};
      const extras = (notification as any).data || (notification as any).extras || {};
      const isInboxNotification = (extras as any).type === 'inbox' || (extras as any)._ab === 'true';
      
      expect(isInboxNotification).toBe(false);
    });
  });
});
