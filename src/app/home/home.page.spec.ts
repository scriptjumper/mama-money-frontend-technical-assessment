import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { BrazeService } from '@services/braze.service';
import { PushNotificationService } from '@services/push-notification.service';
import { HeaderComponent } from '@components/header/header.component';
import { MmCardComponent } from '@components/mm-card/mm-card.component';
import { IonHeader, IonContent, IonButton } from '@ionic/angular/standalone';
import { By } from '@angular/platform-browser';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockBrazeService: jasmine.SpyObj<BrazeService>;
  let mockPushNotificationService: jasmine.SpyObj<PushNotificationService>;

  beforeEach(async () => {
    // Create service mocks
    mockBrazeService = jasmine.createSpyObj('BrazeService', ['logCustomEvent']);
    mockPushNotificationService = jasmine.createSpyObj('PushNotificationService', ['init']);

    await TestBed.configureTestingModule({
      imports: [
        HomePage,
        IonHeader,
        IonContent,
        IonButton,
        HeaderComponent,
        MmCardComponent
      ],
      providers: [
        { provide: BrazeService, useValue: mockBrazeService },
        { provide: PushNotificationService, useValue: mockPushNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize push notification service on construction', () => {
      expect(mockPushNotificationService.init).toHaveBeenCalled();
    });

    it('should have correct template structure', () => {
      fixture.detectChanges();
      
      const header = fixture.debugElement.query(By.css('ion-header'));
      const content = fixture.debugElement.query(By.css('ion-content'));
      const button = fixture.debugElement.query(By.css('ion-button'));
      const card = fixture.debugElement.query(By.css('app-mm-card'));
      const headerComponent = fixture.debugElement.query(By.css('app-header'));

      expect(header).toBeTruthy();
      expect(content).toBeTruthy();
      expect(button).toBeTruthy();
      expect(card).toBeTruthy();
      expect(headerComponent).toBeTruthy();
    });

    it('should set correct attributes on header component', () => {
      fixture.detectChanges();
      
      const headerComponent = fixture.debugElement.query(By.css('app-header'));
      expect(headerComponent.componentInstance.showInboxButton()).toBe(true);
    });

    it('should set correct attributes on mm-card component', () => {
      fixture.detectChanges();
      
      const cardComponent = fixture.debugElement.query(By.css('app-mm-card'));
      expect(cardComponent.componentInstance.title()).toBe('Implementation Task');
    });

    it('should set correct attributes on button', () => {
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('ion-button'));
      expect(button.nativeElement.getAttribute('color')).toBe('primary');
      expect(button.nativeElement.getAttribute('expand')).toBe('block');
      expect(button.nativeElement.getAttribute('size')).toBe('large');
      expect(button.nativeElement.getAttribute('fill')).toBe('solid');
    });
  });

  describe('sendInboxTestEvent', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call brazeService.logCustomEvent with correct parameters', async () => {
      mockBrazeService.logCustomEvent.and.returnValue(Promise.resolve());
      
      await component.sendInboxTestEvent();
      
      expect(mockBrazeService.logCustomEvent).toHaveBeenCalledWith(
        'INBOX_MESSAGE_TEST',
        jasmine.objectContaining({
          source: 'homepage',
          timestamp: jasmine.any(String)
        })
      );
    });

    it('should handle successful event sending', async () => {
      mockBrazeService.logCustomEvent.and.returnValue(Promise.resolve());
      spyOn(console, 'log');
      
      await component.sendInboxTestEvent();
      
      expect(console.log).toHaveBeenCalledWith('Sending INBOX_MESSAGE_TEST event to Braze...');
      expect(console.log).toHaveBeenCalledWith('INBOX_MESSAGE_TEST event sent successfully');
    });

    it('should handle error when event sending fails', async () => {
      const error = new Error('Network error');
      mockBrazeService.logCustomEvent.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.sendInboxTestEvent();
      
      expect(console.error).toHaveBeenCalledWith('Error sending test event:', error);
    });

    it('should be called when button is clicked', async () => {
      spyOn(component, 'sendInboxTestEvent');
      
      const button = fixture.debugElement.query(By.css('ion-button'));
      button.nativeElement.click();
      
      expect(component.sendInboxTestEvent).toHaveBeenCalled();
    });

    it('should include current timestamp in event properties', async () => {
      mockBrazeService.logCustomEvent.and.returnValue(Promise.resolve());
      const beforeTime = Date.now();
      
      await component.sendInboxTestEvent();
      
      const afterTime = Date.now();
      const callArgs = mockBrazeService.logCustomEvent.calls.mostRecent().args;
      const properties = callArgs[1] as { [key: string]: any };
      
      expect(properties).toBeDefined();
      expect(properties['timestamp']).toBeDefined();
      
      const eventTime = new Date(properties['timestamp']).getTime();
      expect(eventTime).toBeGreaterThanOrEqual(beforeTime);
      expect(eventTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Template Content', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display correct card content', () => {
      const cardContent = fixture.debugElement.query(By.css('app-mm-card'));
      const textContent = cardContent.nativeElement.textContent;
      
      expect(textContent).toContain('Implement functionality to send INBOX_MESSAGE_TEST custom event to Braze');
      expect(textContent).toContain('Braze will send a push notification back');
      expect(textContent).toContain('Push notifications may take awhile to arrive');
    });

    it('should display correct button text', () => {
      const button = fixture.debugElement.query(By.css('ion-button'));
      expect(button.nativeElement.textContent.trim()).toBe('Send Test Event');
    });

    it('should have correct CSS classes applied', () => {
      const content = fixture.debugElement.query(By.css('ion-content'));
      const button = fixture.debugElement.query(By.css('ion-button'));
      
      expect(content.nativeElement.classList).toContain('ion-padding');
      expect(button.nativeElement.classList).toContain('m-t-4');
    });
  });

  describe('Service Integration', () => {
    it('should have injected services available', () => {
      expect(component['brazeService']).toBeDefined();
      expect(component['pushNotificationService']).toBeDefined();
    });

    it('should call push notification service init only once during construction', () => {
      // Service should be called once during component construction
      expect(mockPushNotificationService.init).toHaveBeenCalledTimes(1);
      
      // Creating another instance should call it again
      const newFixture = TestBed.createComponent(HomePage);
      expect(mockPushNotificationService.init).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should not throw error if BrazeService is unavailable', async () => {
      mockBrazeService.logCustomEvent.and.returnValue(Promise.reject(new Error('Service unavailable')));
      
      expect(async () => await component.sendInboxTestEvent()).not.toThrow();
    });

    it('should continue execution after logging error', async () => {
      mockBrazeService.logCustomEvent.and.returnValue(Promise.reject(new Error('Network error')));
      spyOn(console, 'log');
      spyOn(console, 'error');
      
      await component.sendInboxTestEvent();
      
      expect(console.log).toHaveBeenCalledWith('Sending INBOX_MESSAGE_TEST event to Braze...');
      expect(console.error).toHaveBeenCalled();
    });
  });
});
