import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import Chart, { ChartData, ChartOptions, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  template: `<canvas id="canvas"></canvas>`,
  styleUrl: './chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit {
  type = input<ChartType>('bar');
  data = input.required<ChartData>();
  options = input.required<ChartOptions>();
  chart!: Chart;
  ngOnInit(): void {
    this.chart = new Chart('canvas', {
      type: this.type(),
      data: this.data(),
      options: this.options()
    });
  }
}
