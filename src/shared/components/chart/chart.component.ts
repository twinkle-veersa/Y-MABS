import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import Chart, { ChartData, ChartOptions, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  template: `<canvas #canvas role="img" [attr.aria-label]="label()"></canvas>`,
  styleUrl: './chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit, OnDestroy {
  type = input<ChartType>('bar');
  data = input.required<ChartData>();
  options = input.required<ChartOptions>();
  label = input('Patient status chart');
  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngOnInit() {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: this.type(),
      data: this.data(),
      options: this.options()
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}
