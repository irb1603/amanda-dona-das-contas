/**
 * Converts a date string from an HTML date input to a proper Date object
 * in the local timezone, avoiding timezone offset issues.
 *
 * When you select a date in an input type="date", it gives you "YYYY-MM-DD".
 * If you just do new Date("2024-01-15"), JavaScript interprets it as UTC midnight,
 * which might be the previous day in your local timezone.
 *
 * This function ensures the date is interpreted in the local timezone.
 */
export function parseDateStringToLocal(dateString: string): Date {
    // Split the date string (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);

    // Create date in local timezone (month is 0-indexed)
    // This creates the date at midnight in the LOCAL timezone
    return new Date(year, month - 1, day);
}

/**
 * Converts a Date object to a string in YYYY-MM-DD format for HTML date inputs
 */
export function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
