// js/hooks/useRealtime.js
import { realtime } from '../core/realtime.js';
import { useState, useEffect } from '../core/utils.js';

export const useRealtime = (event, callback) => {
    const [isConnected, setIsConnected] = useState(realtime.isConnected());
    
    useEffect(() => {
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        
        realtime.on('connect', handleConnect);
        realtime.on('disconnect', handleDisconnect);
        
        if (event && callback) {
            realtime.on(event, callback);
        }
        
        return () => {
            if (event && callback) {
                realtime.off(event, callback);
            }
            realtime.off('connect', handleConnect);
            realtime.off('disconnect', handleDisconnect);
        };
    }, [event, callback]);
    
    return { isConnected, emit: realtime.emit.bind(realtime) };
};

window.useRealtime = useRealtime;