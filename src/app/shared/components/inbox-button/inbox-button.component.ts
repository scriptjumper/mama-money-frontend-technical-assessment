import { AfterViewInit, Component, input, inject, effect } from '@angular/core';
import { IonButton, IonIcon, IonAccordion, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';
import anime, { AnimeInstance } from 'animejs';
import { InboxComponent } from '@components/inbox/inbox.component';
import { InboxService } from '@services/inbox.service';

@Component({
  selector: 'app-inbox-button',
  template: `
    <div class="notification-button">
      @if (unreadMessages()) {
      <svg class="notification-button-unread" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
        <circle r="4.5" cx="5" cy="5" fill="red" />
      </svg>
      }
      <ion-button class="bell" [slot]="slot()" fill="clear" (click)="showInbox()">
        <ion-icon color="dark" slot="icon-only" name="notifications-outline"></ion-icon>
      </ion-button>
    </div>
  `,
  styles: [
    `
      ion-button {
        --padding-end: 0.5rem;
        --padding-start: 0.5rem;
        font-size: 1.75rem;
      }

      .notification-button {
        position: relative;
        svg {
          position: absolute;
          top: 30%;
          right: 25%;
          z-index: 99;
        }
      }
    `
  ],
  imports: [IonButton, IonIcon],
  standalone: true
})
export class InboxButtonComponent implements AfterViewInit {
  readonly slot = input<IonAccordion['toggleIconSlot']>();
  
  private readonly modalController = inject(ModalController);
  private readonly inboxService = inject(InboxService);
  
  // Use the inbox service's unread count
  unreadMessages = this.inboxService.unreadCount;
  private shakeAnimation?: AnimeInstance;

  constructor() {
    addIcons({ notificationsOutline });
    
    // Effect to trigger shake animation when unread count changes
    effect(() => {
      const unreadCount = this.unreadMessages();
      if (unreadCount > 0 && this.shakeAnimation) {
        this.shakeAnimation.restart();
      }
    });
  }

  async showInbox(): Promise<void> {
    try {
      const modal = await this.modalController.create({
        component: InboxComponent,
      });
      await modal.present();
    } catch (error) {
      console.error('Error showing inbox:', error);
    }
  }

  ngAfterViewInit(): void {
    this.shakeAnimation = anime({
      targets: '.bell',
      translateX: [
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: 0, duration: 50 }
      ],
      easing: 'easeInOutSine',
      duration: 2000,
      autoplay: false
    });
  }
}
