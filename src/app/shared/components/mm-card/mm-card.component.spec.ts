import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MmCardComponent } from './mm-card.component';
import { ImageLoaderComponent } from '@components/image-loader/image-loader.component';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonButton, IonIcon } from '@ionic/angular/standalone';
import { By } from '@angular/platform-browser';

describe('MmCardComponent', () => {
  let component: MmCardComponent;
  let fixture: ComponentFixture<MmCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MmCardComponent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonImg,
        IonButton,
        IonIcon,
        ImageLoaderComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MmCardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default input values', () => {
      expect(component.title()).toBe('Mama Money');
      expect(component.showIcon()).toBe(true);
      expect(component.showDeleteButton()).toBe(false);
    });

    it('should register close icon', () => {
      expect(() => new MmCardComponent()).not.toThrow();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render ion-card with correct class', () => {
      const card = fixture.debugElement.query(By.css('ion-card'));
      expect(card).toBeTruthy();
      expect(card.nativeElement.classList).toContain('ion-no-padding');
    });

    it('should render card title when provided', () => {
      const cardTitle = fixture.debugElement.query(By.css('ion-card-title'));
      expect(cardTitle).toBeTruthy();
      expect(cardTitle.nativeElement.textContent.trim()).toContain('Mama Money');
    });

    it('should render custom title when set', () => {
      fixture.componentRef.setInput('title', 'Custom Title');
      fixture.detectChanges();
      
      const cardTitle = fixture.debugElement.query(By.css('ion-card-title'));
      expect(cardTitle.nativeElement.textContent.trim()).toContain('Custom Title');
    });

    it('should not render card header when title is empty', () => {
      fixture.componentRef.setInput('title', '');
      fixture.detectChanges();
      
      const cardTitle = fixture.debugElement.query(By.css('ion-card-title'));
      expect(cardTitle).toBeFalsy();
    });

    it('should render content area', () => {
      const cardContent = fixture.debugElement.query(By.css('ion-card-content'));
      expect(cardContent).toBeTruthy();
    });

    it('should project content into ng-content', () => {
      const testContent = '<p>Test content</p>';
      fixture = TestBed.createComponent(MmCardComponent);
      fixture.nativeElement.innerHTML = testContent;
      fixture.detectChanges();
      
      const cardContent = fixture.debugElement.query(By.css('ion-card-content'));
      expect(cardContent.nativeElement.innerHTML).toContain('ng-content');
    });
  });

  describe('Icon Display', () => {
    it('should show icon by default', () => {
      fixture.detectChanges();
      
      const imageLoader = fixture.debugElement.query(By.css('app-image-loader'));
      expect(imageLoader).toBeTruthy();
    });

    it('should hide icon when showIcon is false', () => {
      fixture.componentRef.setInput('showIcon', false);
      fixture.detectChanges();
      
      const imageLoader = fixture.debugElement.query(By.css('app-image-loader'));
      expect(imageLoader).toBeFalsy();
    });

    it('should configure image loader correctly', () => {
      fixture.detectChanges();
      
      const imageLoader = fixture.debugElement.query(By.css('app-image-loader'));
      const imageLoaderComponent = imageLoader.componentInstance;
      
      expect(imageLoaderComponent.src).toBe('assets/icon/mm-cc-logo.png');
      expect(imageLoaderComponent.imageClass).toBe('iconize');
      expect(imageLoaderComponent.maxWidth).toBe('30px');
      expect(imageLoaderComponent.skeletonDiameter).toBe('30px');
      expect(imageLoaderComponent.skeletonBorderRadius).toBe('30px');
    });
  });

  describe('Delete Button', () => {
    it('should not show delete button by default', () => {
      fixture.detectChanges();
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton).toBeFalsy();
    });

    it('should show delete button when showDeleteButton is true', () => {
      fixture.componentRef.setInput('showDeleteButton', true);
      fixture.detectChanges();
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton).toBeTruthy();
    });

    it('should have correct button attributes', () => {
      fixture.componentRef.setInput('showDeleteButton', true);
      fixture.detectChanges();
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton.nativeElement.getAttribute('fill')).toBe('clear');
      expect(deleteButton.nativeElement.getAttribute('size')).toBe('small');
    });

    it('should contain close icon', () => {
      fixture.componentRef.setInput('showDeleteButton', true);
      fixture.detectChanges();
      
      const icon = fixture.debugElement.query(By.css('.delete-button ion-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.getAttribute('name')).toBe('close');
      expect(icon.nativeElement.getAttribute('slot')).toBe('icon-only');
    });

    it('should emit deleteClick event when clicked', () => {
      fixture.componentRef.setInput('showDeleteButton', true);
      fixture.detectChanges();
      
      spyOn(component.deleteClick, 'emit');
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      deleteButton.nativeElement.click();
      
      expect(component.deleteClick.emit).toHaveBeenCalled();
    });

    it('should call onDeleteClick method when button is clicked', () => {
      fixture.componentRef.setInput('showDeleteButton', true);
      fixture.detectChanges();
      
      spyOn(component, 'onDeleteClick');
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      deleteButton.nativeElement.click();
      
      expect(component.onDeleteClick).toHaveBeenCalled();
    });
  });

  describe('Layout and Styling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('showDeleteButton', true);
      fixture.detectChanges();
    });

    it('should use flex layout for title row', () => {
      const titleContainer = fixture.debugElement.query(By.css('.flex-row.align-items-center.justify-content-between'));
      expect(titleContainer).toBeTruthy();
    });

    it('should group icon and title together', () => {
      const titleGroup = fixture.debugElement.query(By.css('.flex-row.align-items-center:not(.justify-content-between)'));
      expect(titleGroup).toBeTruthy();
      
      const icon = titleGroup.query(By.css('app-image-loader'));
      expect(icon).toBeTruthy();
    });

    it('should apply correct CSS classes to delete button', () => {
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton.nativeElement.classList).toContain('delete-button');
    });

    it('should apply margin to icon container', () => {
      const iconContainer = fixture.debugElement.query(By.css('.m-r-1'));
      expect(iconContainer).toBeTruthy();
    });
  });

  describe('Input Changes', () => {
    it('should update title when input changes', () => {
      fixture.detectChanges();
      
      // Initial title
      let cardTitle = fixture.debugElement.query(By.css('ion-card-title'));
      expect(cardTitle.nativeElement.textContent.trim()).toContain('Mama Money');
      
      // Change title
      fixture.componentRef.setInput('title', 'New Title');
      fixture.detectChanges();
      
      cardTitle = fixture.debugElement.query(By.css('ion-card-title'));
      expect(cardTitle.nativeElement.textContent.trim()).toContain('New Title');
    });

    it('should toggle icon visibility when showIcon changes', () => {
      fixture.detectChanges();
      
      // Initially shown
      let imageLoader = fixture.debugElement.query(By.css('app-image-loader'));
      expect(imageLoader).toBeTruthy();
      
      // Hide icon
      fixture.componentRef.setInput('showIcon', false);
      fixture.detectChanges();
      
      imageLoader = fixture.debugElement.query(By.css('app-image-loader'));
      expect(imageLoader).toBeFalsy();
      
      // Show icon again
      fixture.componentRef.setInput('showIcon', true);
      fixture.detectChanges();
      
      imageLoader = fixture.debugElement.query(By.css('app-image-loader'));
      expect(imageLoader).toBeTruthy();
    });

    it('should toggle delete button visibility when showDeleteButton changes', () => {
      fixture.detectChanges();
      
      // Initially hidden
      let deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton).toBeFalsy();
      
      // Show delete button
      fixture.componentRef.setInput('showDeleteButton', true);
      fixture.detectChanges();
      
      deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton).toBeTruthy();
      
      // Hide delete button
      fixture.componentRef.setInput('showDeleteButton', false);
      fixture.detectChanges();
      
      deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton).toBeFalsy();
    });
  });

  describe('Component Methods', () => {
    it('should have onDeleteClick method', () => {
      expect(component.onDeleteClick).toBeDefined();
      expect(typeof component.onDeleteClick).toBe('function');
    });

    it('should emit deleteClick event when onDeleteClick is called', () => {
      spyOn(component.deleteClick, 'emit');
      
      component.onDeleteClick();
      
      expect(component.deleteClick.emit).toHaveBeenCalled();
    });
  });
});
