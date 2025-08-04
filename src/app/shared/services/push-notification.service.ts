import { Injectable, inject } from '@angular/core';
import { BrazePushNotification } from '@models/braze/braze-push-notification';
import { PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { BrazeService } from './braze.service';
import { InboxService } from './inbox.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly brazeService = inject(BrazeService);
  private readonly inboxService = inject(InboxService);

  constructor() {}

  async init(): Promise<void> {
    console.log('Initializing PushNotificationService...');
    
    // Initialize Braze SDK first
    try {
      await this.brazeService.initialize();
      console.log('Braze SDK initialized in PushNotificationService');
    } catch (error) {
      console.error('Error initializing Braze SDK:', error);
    }

    // Set up push notification listeners
    this.setupPushListeners();
    
    // Register for push notifications
    await this.registerPush();
    
    // Load initial content cards
    await this.loadInitialContentCards();
    
    console.log('PushNotificationService initialization complete');
  }

  private async loadInitialContentCards(): Promise<void> {
    try {
      console.log('Loading initial content cards...');
      
      // Request fresh content cards from server
      await this.brazeService.requestContentCardsRefresh();
      
      // Small delay to allow server response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get content cards from cache
      const contentCards = await this.brazeService.getContentCards();
      console.log('Initial content cards retrieved:', contentCards.length);
      
      // Filter for inbox cards
      const inboxCards = contentCards.filter(card => card.extras?.['type'] === 'inbox');
      console.log('Initial inbox cards found:', inboxCards.length);
      
      if (inboxCards.length > 0) {
        this.inboxService.setCards(inboxCards);
        console.log('Initial inbox cards loaded');
      }
    } catch (error) {
      console.error('Error loading initial content cards:', error);
    }
  }

  private setupPushListeners(): void {
    // Listen for push registration token
    PushNotifications.addListener('registration', (token) => {
      console.log('FCM Registration token received:', token.value);
    });

    // Listen for incoming push notifications
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema | BrazePushNotification) => {
        console.log('Push notification received:', notification);
        
        // Check if this is a Braze notification with inbox type
        await this.handleBrazePushNotification(notification);
      }
    );

    // Listen for notification tap/click
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification) => {
        console.log('Push notification tapped:', notification);
        
        // Handle notification tap if needed
        await this.handleBrazePushNotification(notification.notification);
      }
    );
  }

  private async handleBrazePushNotification(
    notification: PushNotificationSchema | BrazePushNotification
  ): Promise<void> {
    try {
      console.log('Checking if notification is from Braze...');
      
      // Check if notification has Braze extras indicating it's an inbox notification
      const extras = (notification as any).data || (notification as any).extras || {};
      console.log('Notification extras:', extras);
      
      // Check for Braze inbox notification
      if (extras.type === 'inbox' || extras._ab === 'true') {
        console.log('Detected Braze inbox notification - refreshing content cards...');

        // Request fresh content cards from Braze
        await this.brazeService.requestContentCardsRefresh();
        
        // Get the latest content cards
        const contentCards = await this.brazeService.getContentCards();
        console.log('Retrieved content cards:', contentCards.length);
        
        // Filter for inbox cards
        const inboxCards = contentCards.filter(card => card.extras?.['type'] === 'inbox');
        console.log('Inbox cards found:', inboxCards.length);

        if (inboxCards.length > 0) {
          // Add new cards to inbox service
          this.inboxService.addCards(inboxCards);
          console.log('Added new inbox cards to service');
        }
        
      } else {
        console.log('Non-inbox push notification received');
      }
      
    } catch (error) {
      console.error('Error handling Braze push notification:', error);
    }
  }

  async registerPush(): Promise<void> {
    let pushReq = await PushNotifications.checkPermissions();

    if (pushReq.receive === 'prompt') {
      pushReq = await PushNotifications.requestPermissions();
    }

    if (pushReq.receive) {
      // Ask iOS user for permission/auto grant android permission
      await PushNotifications.register();
    }
  }
}
