import {createClient} from "@supabase/supabase-js";
import {useEffect, useState} from "react";
import {RealtimeChannel} from "@supabase/realtime-js";

function createWSClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const client = createWSClient()

export interface UseSupabaseReturnType<T> {
    data: T | undefined,
    sendData: (data: T) => Promise<void>,
    setChannelName: (name: string) => void,
    channel: RealtimeChannel | undefined
}

export function useSupabase<T>(): UseSupabaseReturnType<T> {
    const [channel, setChannel] = useState<RealtimeChannel>()
    const [data, setData] = useState<T>()

    const setChannelName = (name: string) => {
        if (channel) {
            channel.unsubscribe()
        }
        const newChannel = client.channel(name)
            .on('broadcast', {event: '*'}, (payload) => {
                console.log(payload);
                setData(payload.payload.data);
            })
        newChannel.subscribe()
        setChannel(newChannel)
    }

    useEffect(() => {
        console.log(channel)
        return () => {
            channel?.unsubscribe()
        }
    }, [channel]);

    const sendData = async (data: T) => {
        const res = await channel?.send({event: "shout", type: "broadcast", payload: {data}})
        if (res === "ok") setData(data)
    }

    return {
        data,
        sendData,
        setChannelName,
        channel
    }
}
