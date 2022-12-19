
export async function fileToBase64(file: File) {
    const arrayBuffer = await file.arrayBuffer()
    let byteStr = ""
    const byteArr = new Uint8Array( arrayBuffer )
    for (let i = 0; i < byteArr.byteLength; i++) {
        byteStr += String.fromCharCode( byteArr[ i ] )
    }
    return btoa(byteStr)
}

export async function base64ToFile(base64str: string, name: string, type: string) {
    const res = await fetch(`data:${type};base64,${base64str}`)
    const blob = await res.blob()
    const file = new File([blob], name)
    const url = window.URL.createObjectURL(file)
    return {
        file,
        url
    }
}

export async function downloadFromUrl(url: string, filename: string) {
    const link = window.document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}