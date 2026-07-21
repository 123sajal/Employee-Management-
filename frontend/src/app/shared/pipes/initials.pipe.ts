import { Pipe, PipeTransform } from '@angular/core';

/** Returns first letter of first + last name. E.g. "Alice Johnson" → "AJ" */
@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(firstName: string, lastName?: string): string {
    const a = firstName?.charAt(0)?.toUpperCase() ?? '';
    const b = lastName?.charAt(0)?.toUpperCase()  ?? '';
    return a + b;
  }
}
