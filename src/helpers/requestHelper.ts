

import request from 'request';
import fs from 'fs'
import path from 'path'

const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Mobile Safari/537.36'
}

export function downloadJSON<Type>(url: string): Promise<Type>{
    return new Promise<Type>( (resolve, reject) =>{
        request.get(url, {
            headers: headers,
            json:true
        }, (error, response, body) => {
            if(error) reject(error)
            else resolve(body as Type);
        }
    );
    });
}

export function downloadFile(file_url: string , folder: string, progress: ((received_bytes: number, total_bytes: number) => void) | null = null) : Promise<void>{
    return new Promise( (resolve, reject) => {
        //extracting file name from url
        let file_name = file_url.split('/').pop() as string
        const questionMark = file_name.indexOf("?")
        file_name = questionMark > -1 ? file_name.substr(0, questionMark) : file_name
        
        // Save variable to know progress
        let received_bytes = 0;
        let total_bytes = 0;
        
        const req = request.get(file_url,{
            method: 'GET',
            headers: headers
        });
        
        const out = fs.createWriteStream(path.join(folder, file_name));
        req.pipe(out);
        
        req.on('response', (response) => {
            // Change the total bytes value to get progress later.
            total_bytes = parseInt(response.headers['content-length' ] as string);
        });
        
        req.on('data', (chunk) => {
            // Update the received bytes
            received_bytes += chunk.length;
        
            if(progress) progress(received_bytes, total_bytes);
        });

        req.on('error', (err) =>{
            reject(err)
        })
        
        req.on('end', () => {
            if(progress != null){
                progress(received_bytes, total_bytes);
            }
            resolve()
        });
    })
    
}