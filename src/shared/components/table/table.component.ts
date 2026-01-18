/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  linkedSignal,
  signal
} from '@angular/core';
import { DynamicPipe, PipeName } from '@shared/utils/dynamic-pipe.pipe';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { PdfViewerComponent } from '../pdf-viewer.component';

@Component({
  selector: 'app-table',
  imports: [DynamicPipe, CommonModule, ReactiveFormsModule, IconComponent, PdfViewerComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  tableData = input<unknown[]>([]);
  columnConfigs = input.required<ColConfig[]>();
  paginated = input<boolean>(false);
  preSelectedRows = input<unknown[]>([]);
  rowsWithPdf = input<boolean>();
  pdfSrc = input<Blob | null>();
  sortingEnabled = input<boolean>(false);
  actions = input<RowAction[]>([]);
  selection = input<'single' | 'multiple' | null>(null);
  selectAllEnabled = input<boolean>(false);
  pageSizes = input<number[]>([5, 10, 15, 20]);
  pageSize = input<number>(5);
  idKey = input<string>();
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  pageSizeControl = new FormControl<number>(this.pageSize(), {
    nonNullable: true
  });
  pageSizeSignal = toSignal<number, number>(this.pageSizeControl.valueChanges, {
    initialValue: this.pageSize()
  });
  emitSelection = output<unknown[]>();
  emitAction = output<OnRowAction>();
  totalPages = computed(() => Math.ceil(this.tableData().length / +this.pageSizeSignal()));
  currentPage = linkedSignal<number>(() => (this.totalPages() ? 1 : 1));
  offset = computed(() => (this.currentPage() - 1) * +this.pageSizeSignal());

  paginatedData = computed(() => {
    let data = [...this.tableData()];
    if (this.sortingEnabled() && this.sortColumn()) {
      data = this.sortData(data, this.sortColumn()!, this.sortDirection());
    }
    return this.paginated()
      ? data.slice(this.offset(), +this.pageSizeSignal() + this.offset())
      : data;
  });

  disabledRow = input<unknown | null>(null);

  selectedPdf: unknown | null = null;
  selectedRows = linkedSignal(() => this.preSelectedRows());
  isSelected(data: any): boolean {
    if (this.idKey()) {
      const selected = (this.selectedRows() as any[]).map(x => x[this.idKey()!]);
      return selected.includes(data[this.idKey()!]);
    }
    return this.selectedRows().includes(data);
  }
  toggleSort(column: string) {
    if (!this.sortingEnabled()) return;
    if (this.sortColumn() === column) {
      if (this.sortDirection() === 'asc') return this.sortDirection.set('desc');
      return this.sortColumn.set('');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  private sortData(data: any[], column: string, direction: 'asc' | 'desc'): any[] {
    return [...data].sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (valA == null) return direction === 'asc' ? 1 : -1;
      if (valB == null) return direction === 'asc' ? -1 : 1;
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  rowAction(type: string, data: unknown, idx: number) {
    this.emitAction.emit({ type, data, idx });
  }

  onRowClick(row: unknown, idx: number) {
    if (this.selection() === 'single') this.onSelection(row, idx);
    if (this.rowsWithPdf()) {
      this.selectedPdf = this.selectedPdf === row ? null : row;
      this.emitSelection.emit([this.selectedPdf].filter(x => x));
    }
  }

  onSelection(row: any, idx: number) {
    if (!this.selection()) return this.emitAction.emit({ type: 'click', data: row, idx });
    if (this.selection() === 'single') {
      this.selectedRows.set([row]);
    } else if (this.selection() === 'multiple') {
      if (this.idKey()) {
        const selected = (this.selectedRows() as any[]).map(x => x[this.idKey()!]);
        if (selected.includes(row[this.idKey()!])) {
          const arr = this.selectedRows();
          const idx = this.selectedRows().findIndex(
            (x: any) => x[this.idKey()!] == row[this.idKey()!]
          );
          arr.splice(idx, 1);
          this.selectedRows.set(arr);
        } else {
          this.selectedRows.update(x => [...x, row]);
        }
      } else {
        const rowIndex = this.selectedRows().indexOf(row);
        if (rowIndex >= 0) {
          this.selectedRows.set(this.selectedRows().filter(r => r !== row));
        } else {
          this.selectedRows.update(x => [...x, row]);
        }
      }
    }
    this.emitSelection.emit(this.selectedRows());
  }
}

export interface ColConfig {
  key: string;
  title?: string;
  pipeName?: PipeName;
  pipeAttr?: string[];
  isArray?: boolean;
  sortable?: boolean;
  classList?: string;
}
export interface RowAction {
  type: string;
  name: string;
}
export interface OnRowAction {
  type: string;
  data: unknown;
  idx: number;
}
