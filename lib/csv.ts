/**
 * Converts an array of objects to a CSV string.
 * @param data Array of objects to convert
 * @param customHeaders Optional array of headers to use
 * @returns CSV string
 */
export function convertToCSV(data: any[], customHeaders?: string[]): string {
    if (data.length === 0) return '';

    const headers = customHeaders || Object.keys(data[0]);
    const rows = data.map(obj =>
        headers.map(header => {
            const val = obj[header];
            // Escape double quotes and wrap in quotes if necessary
            const stringVal = val === null || val === undefined ? '' : String(val);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
        }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers a browser download of a CSV file.
 * @param csv CSV string content
 * @param filename Desired filename
 */
export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
