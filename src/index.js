import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BlobServiceClient } from "@azure/storage-blob";

async function main() {
 
    const account = "<account-name>";
    // service Shared Access Signature Token - can be obtained from the azure portal
    const accountSas = "<account-sas>";

    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net${accountSas}`
    );


    console.log(blobServiceClient.accountName);
    // Create a container
    const containerName = `newcontainer${new Date().getTime()}`;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    try {
        await containerClient.create();
        console.log(containerName);
    } catch (err) {
        console.log(
        `Creating a container fails, requestId - ${err.details.requestId}, statusCode - ${err.statusCode}, errorCode - ${err.details.errorCode}`
        );
    }

    // Create a blob
    const blobName = "newblob" + new Date().getTime();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        await blockBlobClient.uploadBrowserData("browser data", {
          blockSize: 4 * 1024 * 1024, // 4MB block size
          concurrency: 20, // 20 concurrency
          onProgress: ev => console.log(ev)
        });

        // Get blob content from position 0 to the end
        // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
        const downloadBlockBlobResponse = await blockBlobClient.download();
        const downloaded = await blobToString(await downloadBlockBlobResponse.blobBody);
        console.log(
            "Downloaded blob content - ",
            downloaded
        );

        // [Browsers only] A helper method used to convert a browser Blob into string.
        async function blobToString(blob){
            const fileReader = new FileReader();
                return new Promise((resolve, reject) => {
                fileReader.onloadend = (ev) => {
                    resolve(ev.target.result);
                };
                fileReader.onerror = reject;
                fileReader.readAsText(blob);
            });
        }
    } catch (err) {
        console.log(
        `uploadFile failed, requestId - ${err.details.requestId}, statusCode - ${err.statusCode}, errorCode - ${err.details.errorCode}`
        );
    }
};
main();

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
