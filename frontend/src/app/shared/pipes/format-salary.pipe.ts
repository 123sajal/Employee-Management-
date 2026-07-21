import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatSalary', standalone: true })
export class FormatSalaryPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style:                 'currency',
      currency:              'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
