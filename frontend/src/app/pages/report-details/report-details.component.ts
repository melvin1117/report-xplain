import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChildren,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {
  Chart,
  registerables,
  ChartConfiguration,
  ChartType
} from 'chart.js';
import { Report } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

Chart.register(...registerables);

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [
    CommonModule,
    PdfViewerModule
  ],
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss']
})
export class ReportDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  reportId!: string;
  reportData?: Report;
  pdfSrc: string | null = null;
  private charts: Chart[] = [];
  // Define a threshold for huge range – adjust as needed.
  private rangeThreshold: number = 1000;

  @ViewChildren('metricCanvas') metricCanvasRefs!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('additionalCanvas') additionalCanvasRefs!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.reportId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchReportData();
    this.fetchPdf();
  }

  ngAfterViewInit(): void {
    // Use a brief timeout to ensure canvases are rendered.
    setTimeout(() => {
      this.createAllMetricCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  fetchReportData(): void {
    this.reportService.getReportById(this.reportId).subscribe({
      next: (report) => {
        this.reportData = report.data;
        // Wait a moment to ensure data-bound canvases are rendered.
        setTimeout(() => {
          this.createAllMetricCharts();
        }, 100);
      },
      error: (err) => console.error('Error fetching report data:', err)
    });
  }

  fetchPdf(): void {
    this.reportService.getReportPdf(this.reportId).subscribe({
      next: (pdfBlob) => {
        this.pdfSrc = URL.createObjectURL(pdfBlob);
      },
      error: (err) => console.error('Error fetching PDF:', err)
    });
  }

  createAllMetricCharts(): void {
    if (!this.reportData) {
      return;
    }
    this.destroyCharts();

    // Create charts for each metric.
    this.metricCanvasRefs.forEach((canvasRef) => {
      const canvasEl = canvasRef.nativeElement;
      const metricName = canvasEl.getAttribute('data-metric');
      if (!metricName) {
        return;
      }
      let foundMetric: any;
      if (!this.reportData || !this.reportData.sections) {
        return;
      }
      for (const sec of this.reportData.sections) {
        const m = sec.metrics.find(x => x.metric_name === metricName);
        if (m) {
          foundMetric = m;
          break;
        }
      }
      if (!foundMetric) {
        return;
      }
      const chart = this.createMetricChart(canvasEl, foundMetric);
      if (chart) {
        this.charts.push(chart);
      }
    });

    // Create additional charts.
    this.additionalCanvasRefs.forEach((canvasRef, index) => {
      const canvasEl = canvasRef.nativeElement;
      const chartData = this.reportData?.charts?.[index];
      if (!chartData) {
        return;
      }
      const chart = this.createAdditionalChart(canvasEl, chartData);
      this.charts.push(chart);
    });
  }

  /**
   * Create a metric chart that shows:
   * - A gray bar representing the range from min to max.
   * - A scatter point showing the actual value.
   * If the range is huge (beyond threshold), it does not render.
   */
  createMetricChart(canvasEl: HTMLCanvasElement, metric: any): Chart | null {
    const minVal = parseFloat(metric.reference_min);
    const maxVal = parseFloat(metric.reference_max);
    const value = parseFloat(metric.value.replace(/,/g, '')); // Remove commas if any
  
    // Do not render if the range is huge (adjust threshold as needed).
    if ((maxVal - minVal) > this.rangeThreshold) {
      return null;
    }
  
    // Colors for the range and marker.
    const rangeColor = '#e0e0e0'; // Light gray for full range
    const markerColor = (value >= minVal && value <= maxVal) ? '#66bb6a' : '#ffa726';
  
    // Create the configuration using a mixed chart:
    // - A bar chart to show the range (using the "base" property)
    // - A scatter dataset to overlay the marker for the actual value.
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [metric.metric_friendly_name],
        datasets: [
          {
            label: 'Range',
            data: [maxVal - minVal],
            base: minVal,
            backgroundColor: rangeColor,
            borderWidth: 0,
            // The bar is drawn horizontally because we set indexAxis to 'y'
          },
          {
            // This scatter dataset draws a marker at the actual value.
            type: 'scatter',
            label: 'Your Value',
            data: [{ x: value, y: 0 }],
            backgroundColor: markerColor,
            pointRadius: 8,
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: minVal - (maxVal - minVal) * 0.1, // give a little extra room
            max: maxVal + (maxVal - minVal) * 0.1,
            ticks: {
              callback: (tickValue) => Number(tickValue).toFixed(2)
            },
            title: {
              display: true,
              text: `Min: ${minVal} | Max: ${maxVal}`
            },
          },
          y: {
            // Hide the y-axis grid and labels as they are not needed.
            display: false,
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.dataset.type === 'scatter') {
                  return `Your Value: ${context.parsed.x}`;
                }
                return '';
              }
            }
          }
        }
      }
    };
  
    return new Chart(canvasEl.getContext('2d')!, config);
  }
  
  /**
   * Create additional charts (pie or bar) for other report data.
   * - For pie charts, adjust the legend position to 'bottom' to reduce spacing.
   */
  createAdditionalChart(canvasEl: HTMLCanvasElement, chartData: any): Chart {
    const labels = chartData.chart_data.map((d: any) => d.label || d.parameter);
    const values = chartData.chart_data.map((d: any) => d.value);
    const chartType: ChartType = chartData.chart_type === 'pie' ? 'pie' : 'bar';

    const config: ChartConfiguration = {
      type: chartType,
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: chartType === 'pie'
              ? ['#42a5f5', '#66bb6a', '#ffa726', '#ec407a', '#ab47bc']
              : '#42a5f5'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: chartType === 'pie' ? 'bottom' : 'top'
          },
          tooltip: {}
        }
      }
    };

    return new Chart(canvasEl.getContext('2d')!, config);
  }

  destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  isMetricNormal(value: string, min: string, max: string): boolean {
    const val = parseFloat(value.replace(/,/g, ''));
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    return val >= minVal && val <= maxVal;
  }
}
