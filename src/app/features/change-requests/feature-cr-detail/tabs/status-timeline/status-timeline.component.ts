import { Component, Input } from '@angular/core';

@Component({ selector: 'app-cr-status-timeline-tab', standalone: true, templateUrl: './status-timeline.component.html' })
export class CrStatusTimelineTabComponent {
  @Input({ required: true }) status = '';
  @Input() accessedBy = '';
}
