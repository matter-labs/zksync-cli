import { machineId } from 'node-machine-id';
import RudderAnalytics from "@rudderstack/rudder-sdk-node"

const client: RudderAnalytics = new RudderAnalytics(process.env.RUDDER_STACK_KEY!, {
    dataPlaneUrl: process.env.RUDDER_STACK_DATAPLANE_URL!, 
})

export const track = async (event: string, properties?: any) => {
    client.track({
        userId: await machineId(), 
        event,
        properties,
    })
}