export class StringUtils {
    public static isEmpty(str :string) : boolean {
        return !str || str.trim() === '';
    }
}