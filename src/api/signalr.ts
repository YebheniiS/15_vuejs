import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

export default {
    conn: {} as HubConnection,
    
    async init(tvid: string) {
        this.conn = new HubConnectionBuilder()        
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: retryContext => {                
                if (retryContext.previousRetryCount % 5 == 2) {
                    // if 3+N*5  try ... wait 30seconds
                    return 30000;
                } else {
                    // reconnect in random 0-10 seconds
                    return Math.random() * 10000;
                }
            }
        })        
        .withUrl(`/hub/TVHub?tvid=${tvid}`)
        .build();

        this.conn.onreconnecting((error) => {
            console.warn(`WS Connection lost due to error "${error}". Reconnecting.`);
        });
        
        this.conn.onclose((error) => {
            console.warn(`WS Connection closed due to error "${error}".`);
        });                

        await this.conn.start()
            .then(() => console.log('WS Connection successfull. ' + `/hub/TVHub?tvid=${tvid}` ))
            .catch((error) => {
                console.error(`WS Failed to connect: "${error}"`);
            });
        
        return this.conn
    },
    async close(){
        await this.conn.stop();
    }
}   