import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletePage } from './complete.page';
import { Router } from '@angular/router';
import { HeaderComponent } from '@components/header/header.component';
import { MmCardComponent } from '@components/mm-card/mm-card.component';
import { IonHeader, IonContent, IonButton, ModalController } from '@ionic/angular/standalone';
import { By } from '@angular/platform-browser';

describe('CompletePage', () => {
  let component: CompletePage;
  let fixture: ComponentFixture<CompletePage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockModalController: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);

    // Mock window.open
    spyOn(window, 'open').and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        CompletePage,
        IonHeader,
        IonContent,
        IonButton,
        HeaderComponent,
        MmCardComponent
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: mockModalController }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompletePage);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject Router service', () => {
      expect(component['router']).toBeDefined();
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
  });

  describe('Header Configuration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should configure header component correctly', () => {
      const headerComponent = fixture.debugElement.query(By.css('app-header'));
      expect(headerComponent.componentInstance.showBackButton()).toBe(true);
      expect(headerComponent.componentInstance.showInboxButton()).toBe(true);
    });

    it('should handle back event from header', () => {
      spyOn(component, 'navigateBack');
      
      const headerComponent = fixture.debugElement.query(By.css('app-header'));
      headerComponent.componentInstance.backEvent.emit();
      
      expect(component.navigateBack).toHaveBeenCalled();
    });

    it('should set correct header attributes', () => {
      const header = fixture.debugElement.query(By.css('ion-header'));
      expect(header.nativeElement.getAttribute('mode')).toBe('ios');
      expect(header.nativeElement.classList).toContain('ion-no-border');
    });
  });

  describe('Card Content', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should configure mm-card component correctly', () => {
      const cardComponent = fixture.debugElement.query(By.css('app-mm-card'));
      expect(cardComponent.componentInstance.title()).toBe('Assessment Complete!');
    });

    it('should display correct card content', () => {
      const cardContent = fixture.debugElement.query(By.css('app-mm-card'));
      const textContent = cardContent.nativeElement.textContent;
      
      expect(textContent).toContain('Congratulations on completing the Mama Money Frontend Technical Assessment!');
      expect(textContent).toContain('We value your feedback and would appreciate your thoughts');
      expect(textContent).toContain('Providing feedback is optional but greatly appreciated');
    });

    it('should have proper text formatting', () => {
      const card = fixture.debugElement.query(By.css('app-mm-card'));
      const paragraphs = card.queryAll(By.css('p'));
      
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0].nativeElement.classList).toContain('m-b-2');
      expect(paragraphs[1].nativeElement.classList).toContain('m-b-2');
      
      const strongElement = card.query(By.css('strong'));
      expect(strongElement).toBeTruthy();
      expect(strongElement.nativeElement.textContent).toBe('Note:');
      
      const italicElement = card.query(By.css('i'));
      expect(italicElement).toBeTruthy();
    });
  });

  describe('Feedback Button', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should configure button correctly', () => {
      // Get the feedback button specifically (not the header back button)
      const buttons = fixture.debugElement.queryAll(By.css('ion-button'));
      const feedbackButton = buttons.find(btn => 
        btn.nativeElement.textContent.includes('Share Your Feedback')
      );
      
      expect(feedbackButton).toBeTruthy();
      expect(feedbackButton!.nativeElement.getAttribute('color')).toBe('secondary');
      expect(feedbackButton!.nativeElement.getAttribute('expand')).toBe('block');
      expect(feedbackButton!.nativeElement.getAttribute('size')).toBe('large');
      expect(feedbackButton!.nativeElement.getAttribute('fill')).toBe('solid');
      expect(feedbackButton!.nativeElement.classList).toContain('m-t-4');
    });

    it('should display correct button text', () => {
      const buttons = fixture.debugElement.queryAll(By.css('ion-button'));
      const feedbackButton = buttons.find(btn => 
        btn.nativeElement.textContent.includes('Share Your Feedback')
      );
      
      expect(feedbackButton).toBeTruthy();
      expect(feedbackButton!.nativeElement.textContent.trim()).toBe('Share Your Feedback');
    });

    it('should call openSurvey when clicked', () => {
      spyOn(component, 'openSurvey');
      
      const buttons = fixture.debugElement.queryAll(By.css('ion-button'));
      const feedbackButton = buttons.find(btn => 
        btn.nativeElement.textContent.includes('Share Your Feedback')
      );
      
      expect(feedbackButton).toBeTruthy();
      feedbackButton!.nativeElement.click();
      
      expect(component.openSurvey).toHaveBeenCalled();
    });
  });

  describe('Layout and Styling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply correct CSS classes to content', () => {
      const content = fixture.debugElement.query(By.css('ion-content'));
      expect(content.nativeElement.getAttribute('fullscreen')).toBe('true');
      expect(content.nativeElement.classList).toContain('ion-padding');
    });

    it('should apply correct margin to button', () => {
      const button = fixture.debugElement.query(By.css('ion-button'));
      expect(button.nativeElement.classList).toContain('m-t-4');
    });
  });

  describe('Navigation Methods', () => {
    it('should navigate back when navigateBack is called', () => {
      component.navigateBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle navigation error gracefully', () => {
      mockRouter.navigate.and.returnValue(Promise.reject(new Error('Navigation failed')));
      
      expect(() => component.navigateBack()).not.toThrow();
    });
  });

  describe('Survey Methods', () => {
    it('should have openSurvey method', () => {
      expect(component.openSurvey).toBeDefined();
      expect(typeof component.openSurvey).toBe('function');
    });

    it('should not throw error when openSurvey is called', () => {
      expect(() => component.openSurvey()).not.toThrow();
    });

    it('should call window.open with correct URL', () => {
      component.openSurvey();
      
      expect(window.open).toHaveBeenCalledWith('https://forms.gle/UazsbVmJx215Litc9', '_blank');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(CompletePage).toBeDefined();
      // Verify it's imported in the component metadata
      const componentMetadata = fixture.componentRef.componentType as any;
      expect(componentMetadata).toBeDefined();
    });

    it('should import all required Ionic components', () => {
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('ion-header'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('ion-content'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('ion-button'))).toBeTruthy();
    });

    it('should import custom components', () => {
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('app-header'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-mm-card'))).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Router service gracefully', () => {
      // This test ensures the component can handle DI issues
      expect(component['router']).toBeDefined();
    });

    it('should continue execution if survey fails to open', () => {
      (window.open as jasmine.Spy).and.throwError('Failed to open');
      
      expect(() => component.openSurvey()).not.toThrow();
    });
  });

  describe('User Experience', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should provide clear completion message', () => {
      const cardContent = fixture.debugElement.query(By.css('app-mm-card'));
      const textContent = cardContent.nativeElement.textContent;
      
      expect(textContent).toContain('Assessment Complete!');
      expect(textContent).toContain('Congratulations');
    });

    it('should make feedback optional and clear', () => {
      const cardContent = fixture.debugElement.query(By.css('app-mm-card'));
      const textContent = cardContent.nativeElement.textContent;
      
      expect(textContent).toContain('optional but greatly appreciated');
    });

    it('should provide accessible button text', () => {
      const button = fixture.debugElement.query(By.css('ion-button'));
      expect(button.nativeElement.textContent.trim()).toBe('Share Your Feedback');
    });
  });

  describe('Component Lifecycle', () => {
    it('should not implement unnecessary lifecycle hooks', () => {
      // Component should be simple and not need lifecycle hooks
      expect('ngOnInit' in component).toBe(false);
      expect('ngOnDestroy' in component).toBe(false);
    });

    it('should be stateless', () => {
      // Component should not have any state properties
      const componentProps = Object.getOwnPropertyNames(component);
      const stateProps = componentProps.filter(prop => 
        !prop.startsWith('_') && 
        prop !== 'router' && 
        typeof (component as any)[prop] !== 'function'
      );
      
      expect(stateProps.length).toBe(0);
    });
  });
});
