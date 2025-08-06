import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, ModalController, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { MmCardComponent } from '../mm-card/mm-card.component';
import { InboxService } from '@services/inbox.service';
import { BrazeService, BrazeContentCard } from '@services/braze.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-inbox',
    template: `
        <ion-header mode="ios" class="ion-no-border">
            <ion-toolbar>
                <ion-button class="back-btn" (click)="confirmDismissModal()" [showDeleteButton]="true" (deleteClick)="dismissCard(card)" fill="clear" slot="start">
                    <ion-icon color="dark" name="arrow-back" slot="icon-only"></ion-icon>
                </ion-button>

                <ion-title>Notifications</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="inbox-container">
                @if (inboxCards().length === 0) {
                    <div class="empty-state">
                        <p>You're all caught up! No new notifications.</p>
                    </div>
                } @else {
                    <app-mm-card *ngFor="let card of inboxCards()" [title]="card.title || 'Notification'" [showIcon]="true">
                        <div class="inbox-card" (click)="onCardClick(card)">
                            <div class="card-content">
                                <div class="card-details">
                                    <p class="card-message">{{ card.cardDescription || 'No description available' }}</p>
                                    <span class="card-timestamp">{{ formatDate(card.created) }}</span>
                                </div>
                            </div>
                        </div>
                    </app-mm-card>
                }
            </div>
        </ion-content>
    `,
    styles: [`
        ion-toolbar {
            --min-height: 4rem;
        }

        ion-button {
            font-size: 1.5rem;
        }

        .empty-state {
            text-align: center;
            padding: 2rem;
            color: var(--ion-color-medium);
        }

        .inbox-card {
            display: flex;
            align-items: center;
            padding: 1rem;
            cursor: pointer;
        }

        .card-content {
            flex: 1;
        }

        .card-message {
            margin: 0 0 0.5rem 0;
            color: var(--ion-color-dark);
        }

        .card-timestamp {
            font-size: 0.8rem;
            color: var(--ion-color-medium);
        }

        .delete-button {
            margin-left: 1rem;
        }
    `],
    standalone: true,
    imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, MmCardComponent]
})
export class InboxComponent implements OnInit {
    private readonly modalController = inject(ModalController);
    private readonly alertController = inject(AlertController);
    private readonly inboxService = inject(InboxService);
    private readonly brazeService = inject(BrazeService);
    private readonly router = inject(Router);

    // Use inbox service signals
    inboxCards = this.inboxService.cards;

    ngOnInit() {
        // Cards are already loaded through the InboxButtonComponent
    }

    async onCardClick(card: BrazeContentCard) {        
        // Mark as viewed in the service
        this.inboxService.markAsViewed(card.id);
        
        // Log impression to Braze
        try {
            await this.brazeService.logContentCardImpression(card.id);
            this.router.navigate(['/complete']);
        } catch (error) {
            console.error('Error logging card interaction:', error);
        }
    }

    confirmDismissModal() {
        this.modalController.dismiss();
    }

    async dismissCard(card: BrazeContentCard) {
        const alert = await this.alertController.create({
            header: 'Delete Message',
            message: 'Are you sure you would like to delete this message?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.confirmDismiss(card);
                    }
                }
            ]
        });

        await alert.present();
    }

    private async confirmDismiss(card: BrazeContentCard) {
        try {
            // Log dismissal to Braze
            await this.brazeService.logContentCardDismissed(card.id);
            
            // Remove from inbox service
            this.inboxService.dismissCard(card.id);            
        } catch (error) {
            console.error('Error dismissing card:', error);
            // Remove from local state even if Braze logging fails
            this.inboxService.dismissCard(card.id);
        }
    }

    formatDate(timestamp: number): string {
        const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}