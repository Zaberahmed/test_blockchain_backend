import app from "./app";
import os from 'os';

const port = 8000;
const networkInterfaces = os.networkInterfaces();
const wifiServerIP = networkInterfaces['Wi-Fi']?.[1]?.address;

async function databaseConnection() {
    try {
        app.listen(port, () => {
            console.log(`Server is listening on port ${port} open with`)
            console.log(`---------------- http://localhost:${port}/ -----------------`);
            console.log(`---------------- http://127.0.0.1:${port}/ -----------------`)
            console.log(`---------------- http://${wifiServerIP}:${port}/ -----------------`)
        })
    } catch (error) {
        console.log("not possible to connect");
        console.error(error);
    }
}
databaseConnection();