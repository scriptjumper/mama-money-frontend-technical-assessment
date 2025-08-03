import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, ModalController, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { MmCardComponent } from '../mm-card/mm-card.component';

interface InboxCard {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    icon: string;
    iconBackground: string;
}

@Component({
    selector: 'app-inbox',
    template: `
        <ion-header mode="ios" class="ion-no-border">
            <ion-toolbar>
                <ion-button class="back-btn" (click)="confirmDismissModal()" fill="clear" slot="start">
                    <ion-icon color="dark" name="arrow-back" slot="icon-only"></ion-icon>
                </ion-button>

                <ion-title>Notifications</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="inbox-container">
                <app-mm-card *ngFor="let card of inboxCards" [title]="card.title" [showIcon]="true">
                    <div class="inbox-card" (click)="onCardClick(card)">
                        <div class="card-content">
                            <div class="card-icon" [style.background-color]="card.iconBackground">
                                <ion-icon [name]="card.icon"></ion-icon>
                            </div>
                            <div class="card-details">
                                <p class="card-message">{{ card.message }}</p>
                                <span class="card-timestamp">{{ card.timestamp }}</span>
                            </div>
                        </div>
                        <ion-button fill="clear" class="delete-button" (click)="dismissCard(card); $event.stopPropagation()">
                            <ion-icon name="close-circle" color="danger"></ion-icon>
                        </ion-button>
                    </div>
                </app-mm-card>
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
    `],
    standalone: true,
    imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, MmCardComponent]
})
export class InboxComponent implements OnInit {
    inboxCards: InboxCard[] = [
        {
            id: '1',
            title: 'Transaction Success',
            message: 'Success! Your order of R1000 to Jack Harlow has been successfully processed.',
            timestamp: '28.10.2022 04:58',
            icon: 'checkmark-circle',
            iconBackground: '#10B981'
        },
        {
            id: '2',
            title: 'Activate Banking',
            message: 'You qualify for banking with Mama Money',
            timestamp: '28.10.2022 04:58',
            icon: 'card',
            iconBackground: '#3B82F6'
        }
    ];

    constructor(private modalController: ModalController, private alertController: AlertController) { }

    ngOnInit() {
        // TODO: load content cards using Braze
    }

    openCard() {
        // TODO: Implement card opening logic
    }

    confirmDismissModal() {
        this.modalController.dismiss();
    }

    async dismissCard(card: InboxCard) {
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
                        this.confirmDismiss(card.id);
                    }
                }
            ]
        });

        await alert.present();
    }

    onCardClick(card: InboxCard) {
        console.log('Card clicked:', card);
    }

    private confirmDismiss(cardId: string) {
        this.inboxCards = this.inboxCards.filter(card => card.id !== cardId);
    }
}