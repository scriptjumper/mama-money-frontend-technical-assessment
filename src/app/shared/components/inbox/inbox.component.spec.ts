import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InboxComponent } from './inbox.component';
import { InboxService } from '@services/inbox.service';
import { BrazeService, BrazeContentCard } from '@services/braze.service';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular/standalone';
import { MmCardComponent } from '../mm-card/mm-card.component';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('InboxComponent', () => {
  let component: InboxComponent;
  let fixture: ComponentFixture<InboxComponent>;
  let mockInboxService: jasmine.SpyObj<InboxService>;
  let mockBrazeService: jasmine.SpyObj<BrazeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockAlertController: jasmine.SpyObj<AlertController>;

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
    title: 'Second Card',
    cardDescription: 'Second Description'
  };

  beforeEach(async () => {
    // Create service mocks
    mockInboxService = jasmine.createSpyObj('InboxService', ['markAsViewed', 'dismissCard']);
    mockBrazeService = jasmine.createSpyObj('BrazeService', [
      'logContentCardImpression',
      'logContentCardDismissed'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockModalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);

    // Setup inbox service with signal
    const cardsSignal = signal<BrazeContentCard[]>([]);
    Object.defineProperty(mockInboxService, 'cards', {
      get: () => cardsSignal.asReadonly()
    });

    await TestBed.configureTestingModule({
      imports: [InboxComponent, MmCardComponent],
      providers: [
        { provide: InboxService, useValue: mockInboxService },
        { provide: BrazeService, useValue: mockBrazeService },
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: mockModalController },
        { provide: AlertController, useValue: mockAlertController }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InboxComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with inbox service cards', () => {
      expect(component.inboxCards).toBeDefined();
      expect(component.inboxCards()).toEqual([]);
    });

    it('should have correct template structure', () => {
      fixture.detectChanges();
      
      const header = fixture.debugElement.query(By.css('ion-header'));
      const toolbar = fixture.debugElement.query(By.css('ion-toolbar'));
      const title = fixture.debugElement.query(By.css('ion-title'));
      const content = fixture.debugElement.query(By.css('ion-content'));
      const backButton = fixture.debugElement.query(By.css('.back-btn'));

      expect(header).toBeTruthy();
      expect(toolbar).toBeTruthy();
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
      expect(backButton).toBeTruthy();
    });

    it('should display correct title', () => {
      fixture.detectChanges();
      
      const title = fixture.debugElement.query(By.css('ion-title'));
      expect(title.nativeElement.textContent.trim()).toBe('Notifications');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no cards are present', () => {
      fixture.detectChanges();
      
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      const cards = fixture.debugElement.queryAll(By.css('app-mm-card'));
      
      expect(emptyState).toBeTruthy();
      expect(cards.length).toBe(0);
      expect(emptyState.nativeElement.textContent.trim()).toContain('You\'re all caught up! No new notifications.');
    });

    it('should hide empty state when cards are present', () => {
      // Add cards to the signal
      const cardsSignal = signal<BrazeContentCard[]>([mockCard]);
      Object.defineProperty(mockInboxService, 'cards', {
        get: () => cardsSignal.asReadonly()
      });
      
      fixture = TestBed.createComponent(InboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      const cards = fixture.debugElement.queryAll(By.css('app-mm-card'));
      
      expect(emptyState).toBeFalsy();
      expect(cards.length).toBe(1);
    });
  });

  describe('Card Display', () => {
    beforeEach(() => {
      // Setup cards in the service
      const cardsSignal = signal<BrazeContentCard[]>([mockCard, mockCard2]);
      Object.defineProperty(mockInboxService, 'cards', {
        get: () => cardsSignal.asReadonly()
      });
      
      fixture = TestBed.createComponent(InboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should display cards when available', () => {
      const cards = fixture.debugElement.queryAll(By.css('app-mm-card'));
      expect(cards.length).toBe(2);
    });

    it('should configure mm-card components correctly', () => {
      const cards = fixture.debugElement.queryAll(By.css('app-mm-card'));
      
      const firstCard = cards[0].componentInstance;
      expect(firstCard.title()).toBe('Test Card');
      expect(firstCard.showIcon()).toBe(true);
      expect(firstCard.showDeleteButton()).toBe(true);
      
      const secondCard = cards[1].componentInstance;
      expect(secondCard.title()).toBe('Second Card');
    });

    it('should use default title when card title is missing', () => {
      const cardWithoutTitle = { ...mockCard, title: undefined };
      const cardsSignal = signal<BrazeContentCard[]>([cardWithoutTitle]);
      Object.defineProperty(mockInboxService, 'cards', {
        get: () => cardsSignal.asReadonly()
      });
      
      fixture = TestBed.createComponent(InboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      const card = fixture.debugElement.query(By.css('app-mm-card'));
      expect(card.componentInstance.title()).toBe('Notification');
    });

    it('should display card description', () => {
      const cardMessages = fixture.debugElement.queryAll(By.css('.card-message'));
      expect(cardMessages[0].nativeElement.textContent.trim()).toBe('Test Description');
      expect(cardMessages[1].nativeElement.textContent.trim()).toBe('Second Description');
    });

    it('should display default description when missing', () => {
      const cardWithoutDescription = { ...mockCard, cardDescription: undefined };
      const cardsSignal = signal<BrazeContentCard[]>([cardWithoutDescription]);
      Object.defineProperty(mockInboxService, 'cards', {
        get: () => cardsSignal.asReadonly()
      });
      
      fixture = TestBed.createComponent(InboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      const cardMessage = fixture.debugElement.query(By.css('.card-message'));
      expect(cardMessage.nativeElement.textContent.trim()).toBe('No description available');
    });

    it('should display formatted timestamp', () => {
      const timestamps = fixture.debugElement.queryAll(By.css('.card-timestamp'));
      expect(timestamps.length).toBe(2);
      expect(timestamps[0].nativeElement.textContent.trim()).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
    });
  });

  describe('Card Interactions', () => {
    beforeEach(() => {
      const cardsSignal = signal<BrazeContentCard[]>([mockCard]);
      Object.defineProperty(mockInboxService, 'cards', {
        get: () => cardsSignal.asReadonly()
      });
      
      fixture = TestBed.createComponent(InboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should handle card click', async () => {
      mockBrazeService.logContentCardImpression.and.returnValue(Promise.resolve());
      
      const cardContent = fixture.debugElement.query(By.css('.inbox-card'));
      cardContent.nativeElement.click();
      
      expect(mockInboxService.markAsViewed).toHaveBeenCalledWith('1');
    });

    it('should log impression and navigate on card click', async () => {
      mockBrazeService.logContentCardImpression.and.returnValue(Promise.resolve());
      
      await component.onCardClick(mockCard);
      
      expect(mockInboxService.markAsViewed).toHaveBeenCalledWith('1');
      expect(mockBrazeService.logContentCardImpression).toHaveBeenCalledWith('1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/complete']);
    });

    it('should handle error during card click', async () => {
      const error = new Error('Network error');
      mockBrazeService.logContentCardImpression.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onCardClick(mockCard);
      
      expect(console.error).toHaveBeenCalledWith('Error logging card interaction:', error);
    });
  });

  describe('Card Dismissal', () => {
    let mockAlert: jasmine.SpyObj<HTMLIonAlertElement>;

    beforeEach(() => {
      mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert));
      
      const cardsSignal = signal<BrazeContentCard[]>([mockCard]);
      Object.defineProperty(mockInboxService, 'cards', {
        get: () => cardsSignal.asReadonly()
      });
      
      fixture = TestBed.createComponent(InboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show confirmation dialog when dismiss card is called', async () => {
      await component.dismissCard(mockCard);
      
      expect(mockAlertController.create).toHaveBeenCalledWith({
        header: 'Delete Message',
        message: 'Are you sure you would like to delete this message?',
        buttons: jasmine.arrayContaining([
          jasmine.objectContaining({ text: 'No', role: 'cancel' }),
          jasmine.objectContaining({ text: 'Yes' })
        ])
      });
      expect(mockAlert.present).toHaveBeenCalled();
    });

    it('should call confirmDismiss when Yes is clicked in alert', async () => {
      spyOn(component, 'confirmDismiss' as any);
      
      await component.dismissCard(mockCard);
      
      const createCall = mockAlertController.create.calls.mostRecent();
      const alertConfig = createCall.args[0];
      const yesButton = alertConfig?.buttons?.find((btn: any) => btn.text === 'Yes') as any;
      
      expect(yesButton).toBeDefined();
      expect(yesButton.handler).toBeDefined();
      
      yesButton.handler();
      expect(component['confirmDismiss']).toHaveBeenCalledWith(mockCard);
    });

    it('should delete button trigger dismissCard', () => {
      spyOn(component, 'dismissCard');
      
      const mmCard = fixture.debugElement.query(By.css('app-mm-card'));
      mmCard.componentInstance.deleteClick.emit();
      
      expect(component.dismissCard).toHaveBeenCalledWith(mockCard);
    });
  });

  describe('Confirm Dismiss', () => {
    it('should log dismissal and remove card successfully', async () => {
      mockBrazeService.logContentCardDismissed.and.returnValue(Promise.resolve());
      
      await component['confirmDismiss'](mockCard);
      
      expect(mockBrazeService.logContentCardDismissed).toHaveBeenCalledWith('1');
      expect(mockInboxService.dismissCard).toHaveBeenCalledWith('1');
    });

    it('should remove card from local state even if Braze logging fails', async () => {
      const error = new Error('Network error');
      mockBrazeService.logContentCardDismissed.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component['confirmDismiss'](mockCard);
      
      expect(console.error).toHaveBeenCalledWith('Error dismissing card:', error);
      expect(mockInboxService.dismissCard).toHaveBeenCalledWith('1');
    });
  });

  describe('Modal Dismissal', () => {
    it('should dismiss modal when back button is clicked', () => {
      const backButton = fixture.debugElement.query(By.css('.back-btn'));
      backButton.nativeElement.click();
      
      expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    it('should dismiss modal when confirmDismissModal is called', () => {
      component.confirmDismissModal();
      expect(mockModalController.dismiss).toHaveBeenCalled();
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const timestamp = Date.now() / 1000; // Current time in seconds
      const result = component.formatDate(timestamp);
      
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}/); // MM/DD/YYYY HH:MM format
    });

    it('should handle different timestamp formats', () => {
      const timestamp = 1609459200; // January 1, 2021 00:00:00 UTC
      const result = component.formatDate(timestamp);
      
      expect(result).toContain('2021');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Component Lifecycle', () => {
    it('should implement OnInit', () => {
      expect(component.ngOnInit).toBeDefined();
    });

    it('should not throw error during ngOnInit', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('Service Integration', () => {
    it('should inject all required services', () => {
      expect(component['modalController']).toBeDefined();
      expect(component['alertController']).toBeDefined();
      expect(component['inboxService']).toBeDefined();
      expect(component['brazeService']).toBeDefined();
      expect(component['router']).toBeDefined();
    });

    it('should use inbox service cards signal', () => {
      expect(component.inboxCards).toBe(mockInboxService.cards);
    });
  });
});
