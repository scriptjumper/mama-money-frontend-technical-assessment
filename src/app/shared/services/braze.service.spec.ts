import { TestBed } from '@angular/core/testing';
import { BrazeService, BrazeContentCard } from './braze.service';

describe('BrazeService', () => {
  let service: BrazeService;
  let mockPlugin: jasmine.SpyObj<any>;

  beforeEach(() => {
    // Create mock plugin with all necessary methods
    mockPlugin = jasmine.createSpyObj('brazePlugin', [
      'logCustomEvent',
      'requestImmediateDataFlush',
      'requestContentCardsRefresh',
      'getContentCardsFromCache',
      'logContentCardImpression',
      'logContentCardClicked',
      'logContentCardDismissed'
    ]);

    // Mock window.cordova.plugins.brazePlugin
    (window as any).cordova = {
      plugins: {
        brazePlugin: mockPlugin
      }
    };

    TestBed.configureTestingModule({
      providers: [BrazeService]
    });
    service = TestBed.inject(BrazeService);
  });

  afterEach(() => {
    // Clean up window mock
    delete (window as any).cordova;
  });

  describe('initialize', () => {
    it('should resolve successfully when plugin is available', async () => {
      await expectAsync(service.initialize()).toBeResolved();
    });

    it('should resolve successfully when plugin is not available', async () => {
      delete (window as any).cordova;
      await expectAsync(service.initialize()).toBeResolved();
    });
  });

  describe('logCustomEvent', () => {
    it('should log custom event successfully', async () => {
      const eventName = 'TEST_EVENT';
      const properties = { test: 'value' };
      
      // Setup mock to call success callback
      mockPlugin.logCustomEvent.and.callFake((name: string, props: any, success: Function) => {
        success();
      });

      await expectAsync(service.logCustomEvent(eventName, properties)).toBeResolved();
      
      expect(mockPlugin.logCustomEvent).toHaveBeenCalledWith(
        eventName,
        properties,
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(mockPlugin.requestImmediateDataFlush).toHaveBeenCalled();
    });

    it('should handle error when logging custom event fails', async () => {
      const eventName = 'TEST_EVENT';
      const error = 'Failed to log event';
      
      // Setup mock to call error callback
      mockPlugin.logCustomEvent.and.callFake((name: string, props: any, success: Function, failure: Function) => {
        failure(error);
      });

      await expectAsync(service.logCustomEvent(eventName)).toBeRejected();
      expect(mockPlugin.logCustomEvent).toHaveBeenCalled();
    });

    it('should resolve when plugin is not available', async () => {
      delete (window as any).cordova;
      
      await expectAsync(service.logCustomEvent('TEST_EVENT')).toBeResolved();
    });

    it('should use empty object for properties when not provided', async () => {
      mockPlugin.logCustomEvent.and.callFake((name: string, props: any, success: Function) => {
        success();
      });

      await service.logCustomEvent('TEST_EVENT');
      
      expect(mockPlugin.logCustomEvent).toHaveBeenCalledWith(
        'TEST_EVENT',
        {},
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });
  });

  describe('requestContentCardsRefresh', () => {
    it('should request content cards refresh successfully', async () => {
      await service.requestContentCardsRefresh();
      expect(mockPlugin.requestContentCardsRefresh).toHaveBeenCalled();
    });

    it('should handle case when plugin is not available', async () => {
      delete (window as any).cordova;
      
      await expectAsync(service.requestContentCardsRefresh()).toBeResolved();
    });

    it('should throw error when refresh fails', async () => {
      mockPlugin.requestContentCardsRefresh.and.throwError('Network error');
      
      await expectAsync(service.requestContentCardsRefresh()).toBeRejected();
    });
  });

  describe('getContentCards', () => {
    it('should get content cards successfully', async () => {
      const mockCards: BrazeContentCard[] = [
        {
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
          extras: {}
        }
      ];

      mockPlugin.getContentCardsFromCache.and.callFake((success: Function) => {
        success(mockCards);
      });

      const result = await service.getContentCards();
      
      expect(result).toEqual(mockCards);
      expect(mockPlugin.getContentCardsFromCache).toHaveBeenCalled();
    });

    it('should return empty array when plugin is not available', async () => {
      delete (window as any).cordova;
      
      const result = await service.getContentCards();
      expect(result).toEqual([]);
    });

    it('should handle error when getting content cards fails', async () => {
      const error = 'Failed to get cards';
      
      mockPlugin.getContentCardsFromCache.and.callFake((success: Function, failure: Function) => {
        failure(error);
      });

      await expectAsync(service.getContentCards()).toBeRejected();
    });

    it('should return empty array when cards is null', async () => {
      mockPlugin.getContentCardsFromCache.and.callFake((success: Function) => {
        success(null);
      });

      const result = await service.getContentCards();
      expect(result).toEqual([]);
    });
  });

  describe('logContentCardImpression', () => {
    it('should log content card impression successfully', async () => {
      const cardId = 'card123';
      
      await service.logContentCardImpression(cardId);
      expect(mockPlugin.logContentCardImpression).toHaveBeenCalledWith(cardId);
    });

    it('should handle case when plugin is not available', async () => {
      delete (window as any).cordova;
      
      await expectAsync(service.logContentCardImpression('card123')).toBeResolved();
    });

    it('should throw error when logging impression fails', async () => {
      mockPlugin.logContentCardImpression.and.throwError('Network error');
      
      await expectAsync(service.logContentCardImpression('card123')).toBeRejected();
    });
  });

  describe('logContentCardClicked', () => {
    it('should log content card click successfully', async () => {
      const cardId = 'card123';
      
      await service.logContentCardClicked(cardId);
      expect(mockPlugin.logContentCardClicked).toHaveBeenCalledWith(cardId);
    });

    it('should handle case when plugin is not available', async () => {
      delete (window as any).cordova;
      
      await expectAsync(service.logContentCardClicked('card123')).toBeResolved();
    });
  });

  describe('logContentCardDismissed', () => {
    it('should log content card dismissal successfully', async () => {
      const cardId = 'card123';
      
      await service.logContentCardDismissed(cardId);
      expect(mockPlugin.logContentCardDismissed).toHaveBeenCalledWith(cardId);
    });

    it('should handle case when plugin is not available', async () => {
      delete (window as any).cordova;
      
      await expectAsync(service.logContentCardDismissed('card123')).toBeResolved();
    });

    it('should throw error when logging dismissal fails', async () => {
      mockPlugin.logContentCardDismissed.and.throwError('Network error');
      
      await expectAsync(service.logContentCardDismissed('card123')).toBeRejected();
    });
  });
});
