import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationService } from '@services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit {
  constructor(private pushNotificationService: PushNotificationService) {}

  async ngOnInit(): Promise<void> {
    // Initialize push notifications and Braze integration
    await this.pushNotificationService.init();
  }
}
