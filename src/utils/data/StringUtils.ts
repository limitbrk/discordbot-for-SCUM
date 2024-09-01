export class StringUtils {
    public static isEmpty(str :string) : boolean {
      return !str || str.trim() === '';
    }

    public static format(template: string, ...args: any[]): string{
      return template.replace(/{([0-9]+)}/g, function (match, index) {
        return typeof args[index] === 'undefined' ? match : args[index];
      });
    }
}