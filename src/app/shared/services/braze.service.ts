import { Injectable } from '@angular/core';

export interface BrazeContentCard {
  id: string;
  title?: string;
  cardDescription?: string;
  image?: string;
  url?: string;
  extras: { [key: string]: any };
  created: number;
  expiresAt: number;
  viewed: boolean;
  clicked: boolean;
  pinned: boolean;
  dismissed: boolean;
  dismissible: boolean;
  openURLInWebView: boolean;
  domain: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrazeService {

  constructor() { }

  /**
   * Initialize Braze SDK
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const plugin = (window as any).cordova?.plugins?.brazePlugin;
      
      if (!plugin) {
        console.log('BrazePlugin not available - running in browser?');
        resolve();
        return;
      }

      try {
        console.log('Initializing Braze SDK...');
        // Braze SDK should auto-initialize based on capacitor.config.ts settings
        resolve();
      } catch (error) {
        console.error('Error initializing Braze:', error);
        reject(error);
      }
    });
  }

  /**
   * Log a custom event to Braze
   */
  async logCustomEvent(eventName: string, properties?: { [key: string]: any }): Promise<void> {
    return new Promise((resolve, reject) => {
      const plugin = (window as any).cordova?.plugins?.brazePlugin;
      
      if (!plugin) {
        console.log('BrazePlugin not available - event:', eventName);
        resolve();
        return;
      }

      try {
        console.log('Logging custom event to Braze:', eventName, properties);
        
        plugin.logCustomEvent(
          eventName,
          properties || {},
          () => {
            console.log('Braze custom event sent successfully:', eventName);
            // Request immediate data flush to ensure event is sent
            plugin.requestImmediateDataFlush();
            resolve();
          },
          (error: any) => {
            console.error('Error logging custom event:', error);
            reject(error);
          }
        );
      } catch (error) {
        console.error('Error logging custom event:', error);
        reject(error);
      }
    });
  }

  /**
   * Request fresh content cards from Braze
   */
  async requestContentCardsRefresh(): Promise<void> {
    const plugin = (window as any).cordova?.plugins?.brazePlugin;
    
    if (!plugin) {
      console.log('BrazePlugin not available - request content cards refresh');
      return;
    }

    try {
      console.log('Requesting content cards refresh from Braze...');
      plugin.requestContentCardsRefresh();
      console.log('Content cards refresh requested');
    } catch (error) {
      console.error('Error requesting content cards refresh:', error);
      throw error;
    }
  }

  /**
   * Get cached content cards from Braze
   */
  async getContentCards(): Promise<BrazeContentCard[]> {
    return new Promise((resolve, reject) => {
      const plugin = (window as any).cordova?.plugins?.brazePlugin;
      
      if (!plugin) {
        console.log('BrazePlugin not available - returning empty content cards');
        resolve([]);
        return;
      }

      try {
        console.log('Getting content cards from Braze cache...');
        plugin.getContentCardsFromCache(
          (contentCards: BrazeContentCard[]) => {
            console.log('Retrieved content cards from cache:', contentCards?.length || 0);
            resolve(contentCards || []);
          },
          (error: any) => {
            console.error('Error getting content cards from cache:', error);
            reject(error);
          }
        );
      } catch (error) {
        console.error('Error getting content cards:', error);
        reject(error);
      }
    });
  }

  /**
   * Log content card impression
   */
  async logContentCardImpression(cardId: string): Promise<void> {
    const plugin = (window as any).cordova?.plugins?.brazePlugin;
    
    if (!plugin) {
      console.log('BrazePlugin not available for card:', cardId);
      return;
    }

    try {
      console.log('Content card impression:', cardId);
      plugin.logContentCardImpression(cardId);
      console.log('Content card impression logged');
    } catch (error) {
      console.error('Error logging content card impression:', error);
      throw error;
    }
  }

  /**
   * Log content card click
   */
  async logContentCardClicked(cardId: string): Promise<void> {
    const plugin = (window as any).cordova?.plugins?.brazePlugin;
    
    if (!plugin) {
      console.log('BrazePlugin not available - card:', cardId);
      return;
    }

    try {
      console.log('Logging content card click:', cardId);
      plugin.logContentCardClicked(cardId);
      console.log('Content card click logged');
    } catch (error) {
      console.error('Error logging content card click:', error);
      throw error;
    }
  }

  /**
   * Log content card dismissal
   */
  async logContentCardDismissed(cardId: string): Promise<void> {
    const plugin = (window as any).cordova?.plugins?.brazePlugin;
    
    if (!plugin) {
      console.log('BrazePlugin not available - log dismissal for card:', cardId);
      return;
    }

    try {
      console.log('Logging content card dismissal:', cardId);
      plugin.logContentCardDismissed(cardId);
      console.log('Content card dismissal logged');
    } catch (error) {
      console.error('Error logging content card dismissal:', error);
      throw error;
    }
  }
}
