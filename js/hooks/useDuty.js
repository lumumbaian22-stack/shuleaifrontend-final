// js/hooks/useDuty.js
import { useState, useEffect } from '../core/utils.js';
import { dutyManager } from '../features/duty/DutyManager.js';

export const useDuty = () => {
    const [todayDuty, setTodayDuty] = useState(null);
    const [weeklyDuty, setWeeklyDuty] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadDuty();
    }, []);
    
    const loadDuty = async () => {
        setLoading(true);
        const today = await dutyManager.loadTodayDuty();
        const weekly = await dutyManager.loadWeeklyDuty();
        setTodayDuty(today);
        setWeeklyDuty(weekly);
        setLoading(false);
    };
    
    const checkIn = async (location = 'School Gate', notes = '') => {
        const success = await dutyManager.checkIn(location, notes);
        if (success) await loadDuty();
        return success;
    };
    
    const checkOut = async (location = 'School Gate', notes = '') => {
        const success = await dutyManager.checkOut(location, notes);
        if (success) await loadDuty();
        return success;
    };
    
    const requestSwap = async (dutyDate, reason, targetTeacherId = null) => {
        return await dutyManager.requestSwap(dutyDate, reason, targetTeacherId);
    };
    
    const updatePreferences = async (preferences) => {
        return await dutyManager.updatePreferences(preferences);
    };
    
    return {
        todayDuty,
        weeklyDuty,
        loading,
        checkIn,
        checkOut,
        requestSwap,
        updatePreferences,
        refresh: loadDuty
    };
};

window.useDuty = useDuty;