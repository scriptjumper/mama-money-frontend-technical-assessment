import { Component, input, output } from '@angular/core';
import { ImageLoaderComponent } from '@components/image-loader/image-loader.component';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-mm-card',
  template: ` <ion-card class="ion-no-padding">
    <ion-card-header>
      @if (title(); as title) {
      <ion-card-title>
        <div class="flex-row align-items-center justify-content-between">
          <div class="flex-row align-items-center">
            @if(showIcon()) {
            <div class="m-r-1">
              <app-image-loader
                src="assets/icon/mm-cc-logo.png"
                imageClass="iconize"
                maxWidth="30px"
                skeletonDiameter="30px"
                skeletonBorderRadius="30px"
              ></app-image-loader>
            </div>
            } {{ title }}
          </div>
          @if(showDeleteButton()) {
          <ion-button 
            fill="clear" 
            size="small" 
            class="delete-button"
            (click)="onDeleteClick()"
          >
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
          }
        </div>
      </ion-card-title>
      }
    </ion-card-header>

    <ion-card-content>
      <ng-content></ng-content>
    </ion-card-content>
  </ion-card>`,
  styles: [`
    .delete-button {
      --background: #dc3545;
      --color: white;
      --border-radius: 50%;
      --padding-start: 8px;
      --padding-end: 8px;
      --padding-top: 8px;
      --padding-bottom: 8px;
      width: 32px;
      height: 32px;
      margin: 0;
    }
    
    .delete-button ion-icon {
      font-size: 16px;
    }
    
    .justify-content-between {
      justify-content: space-between;
    }
  `],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonButton, IonIcon, ImageLoaderComponent]
})
export class MmCardComponent {
  title = input('Mama Money');
  showIcon = input(true);
  showDeleteButton = input(false);
  deleteClick = output<void>();

  constructor() {
    addIcons({ close });
  }

  onDeleteClick() {
    this.deleteClick.emit();
  }
}
