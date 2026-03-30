export const KOLKATA_JUNCTIONS = [
    { id: 'KOL-01', name: 'Girish Park Crossing', lat: 22.5857, lng: 88.3601, status: 'GREEN', secondsToChange: 15 },
    { id: 'KOL-02', name: 'Shyambazar 5-Point Crossing', lat: 22.6015, lng: 88.3739, status: 'RED', secondsToChange: 45 },
    { id: 'KOL-03', name: 'Chiria More', lat: 22.6247, lng: 88.3840, status: 'AMBER', secondsToChange: 4 },
    { id: 'KOL-04', name: 'Sinthee More', lat: 22.6366, lng: 88.3854, status: 'GREEN', secondsToChange: 22 },
    { id: 'KOL-05', name: 'Dunlop Bridge Crossing', lat: 22.6517, lng: 88.3813, status: 'RED', secondsToChange: 35 },
    { id: 'KOL-06', name: 'Kamarhati Junction', lat: 22.6715, lng: 88.3813, status: 'GREEN', secondsToChange: 10 },
    { id: 'KOL-07', name: 'NIT Narula (Agarpara)', lat: 22.6980, lng: 88.3768, status: 'RED', secondsToChange: 55 }
];

// Helper to simulate live cycle changes
export const getLiveKolkataJunctions = () => {
    const cycleTime = 60;
    const timeInCycle = (Date.now() / 1000) % cycleTime;
    
    return KOLKATA_JUNCTIONS.map((j, idx) => {
        // Offset each junction simulation based on its index
        const offsetTime = (timeInCycle + (idx * 15)) % cycleTime;
        let status, toChange;

        if (offsetTime < 30) {
            status = 'GREEN';
            toChange = 30 - offsetTime;
        } else if (offsetTime < 55) {
            status = 'RED';
            toChange = 55 - offsetTime;
        } else {
            status = 'AMBER';
            toChange = 60 - offsetTime;
        }

        return { ...j, status, secondsToChange: Math.round(toChange) };
    });
};
