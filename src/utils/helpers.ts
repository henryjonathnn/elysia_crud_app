export function toWIB(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta', 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

export function formatResponse(data: any) {
    return {
        ...data,
        created_at: toWIB(data.created_at),
        updated_at: toWIB(data.updated_at),
        image_url: data.image ? `http://localhost:2500${data.image}` : null
    }
}

export function formatMultipleResponse(dataArray: any[]) {
    return dataArray.map(data => formatResponse(data))
}