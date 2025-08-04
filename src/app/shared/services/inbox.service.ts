import { Injectable, signal, computed } from '@angular/core';
import { BrazeContentCard } from './braze.service';

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private _cards = signal<BrazeContentCard[]>([]);
  
  // Public readonly signals
  readonly cards = this._cards.asReadonly();
  readonly unreadCount = computed(() => 
    this._cards().filter(card => !card.viewed).length
  );

  constructor() { }

  /**
   * Add a new card to the inbox
   */
  addCard(card: BrazeContentCard): void {
    console.log('Adding card to inbox:', card.title);
    this._cards.update(cards => [card, ...cards]);
  }

  /**
   * Add multiple cards to the inbox
   */
  addCards(newCards: BrazeContentCard[]): void {
    console.log('Adding multiple cards to inbox:', newCards.length);
    this._cards.update(cards => [...newCards, ...cards]);
  }

  /**
   * Set all cards (replace existing)
   */
  setCards(cards: BrazeContentCard[]): void {
    console.log('Setting inbox cards:', cards.length);
    this._cards.set(cards);
  }

  /**
   * Mark a card as viewed
   */
  markAsViewed(cardId: string): void {
    console.log('Marking card as viewed:', cardId);
    this._cards.update(cards =>
      cards.map(card =>
        card.id === cardId ? { ...card, viewed: true } : card
      )
    );
  }

  /**
   * Remove a card from the inbox (dismiss)
   */
  dismissCard(cardId: string): void {
    console.log('Dismissing card:', cardId);
    this._cards.update(cards =>
      cards.filter(card => card.id !== cardId)
    );
  }

  /**
   * Clear all cards
   */
  clearAll(): void {
    console.log('Clearing all inbox cards');
    this._cards.set([]);
  }

  /**
   * Get cards filtered by type
   */
  getCardsByType(type: string): BrazeContentCard[] {
    return this._cards().filter(card => card.extras?.['type'] === type);
  }

  /**
   * Get inbox-specific cards
   */
  getInboxCards(): BrazeContentCard[] {
    return this.getCardsByType('inbox');
  }
}
