import { TestBed } from '@angular/core/testing';
import { InboxService } from './inbox.service';
import { BrazeContentCard } from './braze.service';

describe('InboxService', () => {
  let service: InboxService;

  const mockCard: BrazeContentCard = {
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

  const mockCard2: BrazeContentCard = {
    ...mockCard,
    id: '2',
    title: 'Test Card 2',
    viewed: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InboxService]
    });
    service = TestBed.inject(InboxService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with empty cards array', () => {
      expect(service.cards()).toEqual([]);
    });

    it('should start with unread count of 0', () => {
      expect(service.unreadCount()).toBe(0);
    });
  });

  describe('addCard', () => {
    it('should add a card to the inbox', () => {
      service.addCard(mockCard);
      
      expect(service.cards()).toContain(mockCard);
      expect(service.cards().length).toBe(1);
    });

    it('should add new cards to the beginning of the array', () => {
      service.addCard(mockCard);
      service.addCard(mockCard2);
      
      expect(service.cards()[0]).toEqual(mockCard2);
      expect(service.cards()[1]).toEqual(mockCard);
    });

    it('should update unread count when adding unread card', () => {
      service.addCard(mockCard); // unread
      expect(service.unreadCount()).toBe(1);
      
      service.addCard(mockCard2); // read
      expect(service.unreadCount()).toBe(1);
    });
  });

  describe('addCards', () => {
    it('should add multiple cards to the inbox', () => {
      const newCards = [mockCard, mockCard2];
      service.addCards(newCards);
      
      expect(service.cards().length).toBe(2);
      expect(service.cards()).toContain(mockCard);
      expect(service.cards()).toContain(mockCard2);
    });

    it('should handle empty array', () => {
      service.addCards([]);
      expect(service.cards().length).toBe(0);
    });

    it('should preserve existing cards when adding new ones', () => {
      const existingCard = { ...mockCard, id: 'existing' };
      service.addCard(existingCard);
      
      service.addCards([mockCard, mockCard2]);
      
      expect(service.cards().length).toBe(3);
      expect(service.cards()).toContain(existingCard);
    });
  });

  describe('setCards', () => {
    it('should replace all cards', () => {
      service.addCard(mockCard);
      expect(service.cards().length).toBe(1);
      
      service.setCards([mockCard2]);
      
      expect(service.cards().length).toBe(1);
      expect(service.cards()[0]).toEqual(mockCard2);
    });

    it('should handle empty array', () => {
      service.addCard(mockCard);
      service.setCards([]);
      
      expect(service.cards().length).toBe(0);
    });
  });

  describe('markAsViewed', () => {
    it('should mark a card as viewed', () => {
      service.addCard(mockCard);
      expect(service.unreadCount()).toBe(1);
      
      service.markAsViewed('1');
      
      expect(service.cards()[0].viewed).toBe(true);
      expect(service.unreadCount()).toBe(0);
    });

    it('should not affect other cards', () => {
      service.addCards([mockCard, mockCard2]);
      
      service.markAsViewed('1');
      
      expect(service.cards().find(c => c.id === '1')?.viewed).toBe(true);
      expect(service.cards().find(c => c.id === '2')?.viewed).toBe(true); // was already true
    });

    it('should handle non-existent card ID', () => {
      service.addCard(mockCard);
      
      expect(() => service.markAsViewed('nonexistent')).not.toThrow();
      expect(service.cards()[0].viewed).toBe(false);
    });
  });

  describe('dismissCard', () => {
    it('should remove a card from the inbox', () => {
      service.addCards([mockCard, mockCard2]);
      expect(service.cards().length).toBe(2);
      
      service.dismissCard('1');
      
      expect(service.cards().length).toBe(1);
      expect(service.cards().find(c => c.id === '1')).toBeUndefined();
      expect(service.cards().find(c => c.id === '2')).toBeDefined();
    });

    it('should update unread count when dismissing unread card', () => {
      service.addCards([mockCard, mockCard2]); // one unread, one read
      expect(service.unreadCount()).toBe(1);
      
      service.dismissCard('1'); // dismiss unread card
      
      expect(service.unreadCount()).toBe(0);
    });

    it('should handle non-existent card ID', () => {
      service.addCard(mockCard);
      const initialLength = service.cards().length;
      
      expect(() => service.dismissCard('nonexistent')).not.toThrow();
      expect(service.cards().length).toBe(initialLength);
    });
  });

  describe('clearAll', () => {
    it('should remove all cards', () => {
      service.addCards([mockCard, mockCard2]);
      expect(service.cards().length).toBe(2);
      
      service.clearAll();
      
      expect(service.cards().length).toBe(0);
      expect(service.unreadCount()).toBe(0);
    });

    it('should handle empty inbox', () => {
      expect(() => service.clearAll()).not.toThrow();
      expect(service.cards().length).toBe(0);
    });
  });

  describe('unreadCount computed signal', () => {
    it('should calculate unread count correctly', () => {
      expect(service.unreadCount()).toBe(0);
      
      service.addCard(mockCard); // unread
      expect(service.unreadCount()).toBe(1);
      
      service.addCard(mockCard2); // read
      expect(service.unreadCount()).toBe(1);
      
      service.markAsViewed('1');
      expect(service.unreadCount()).toBe(0);
    });

    it('should update when cards are dismissed', () => {
      service.addCards([mockCard, { ...mockCard, id: '3', viewed: false }]);
      expect(service.unreadCount()).toBe(2);
      
      service.dismissCard('1');
      expect(service.unreadCount()).toBe(1);
      
      service.dismissCard('3');
      expect(service.unreadCount()).toBe(0);
    });
  });

  describe('cards readonly signal', () => {
    it('should provide readonly access to cards', () => {
      const cards = service.cards;
      expect(typeof cards).toBe('function'); // signals are functions
      expect(cards()).toEqual([]);
    });

    it('should reflect changes when cards are modified', () => {
      const cards = service.cards;
      expect(cards().length).toBe(0);
      
      service.addCard(mockCard);
      expect(cards().length).toBe(1);
      expect(cards()[0]).toEqual(mockCard);
    });
  });
});
