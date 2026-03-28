/**
 * GLOSA Logic Utility
 * Speed = Distance / Time
 */

function calculateAdvisory(distanceInMeters, secondsToChange, currentStatus) {
    const minSpeedMs = 5; // m/s (~18 km/h min)
    const maxSpeedMs = 14; // m/s (~50 km/h urban cap)
    const targetBuffer = 2; // seconds buffer

    let recommendedSpeedMs = 0;
    let message = '';
    let actionSignal = currentStatus; // defaults to signal color

    if (currentStatus === 'GREEN') {
        if (secondsToChange <= targetBuffer) {
            // About to turn — slow down regardless
            recommendedSpeedMs = minSpeedMs;
            message = 'Signal changing soon. Reduce speed.';
            actionSignal = 'AMBER';
        } else {
            const speedNeeded = distanceInMeters / (secondsToChange - targetBuffer);
            if (speedNeeded <= maxSpeedMs) {
                recommendedSpeedMs = Math.max(speedNeeded, minSpeedMs);
                message = 'Maintain speed to clear the signal.';
                actionSignal = 'GREEN';
            } else {
                // Can't make it — advise slow for next green
                recommendedSpeedMs = minSpeedMs;
                message = 'Cannot clear signal in time. Slow down for next Green.';
                actionSignal = 'AMBER';
            }
        }
    } else if (currentStatus === 'RED') {
        const speedNeeded = distanceInMeters / (secondsToChange + targetBuffer);
        if (speedNeeded <= maxSpeedMs && speedNeeded >= minSpeedMs) {
            recommendedSpeedMs = speedNeeded;
            message = 'Optimal speed — you will arrive on Green.';
            actionSignal = 'GREEN';
        } else if (speedNeeded < minSpeedMs) {
            recommendedSpeedMs = minSpeedMs;
            message = 'Slow approach. Signal turns Green soon.';
            actionSignal = 'RED';
        } else {
            recommendedSpeedMs = 0;
            message = 'Stop ahead. Signal is Red.';
            actionSignal = 'RED';
        }
    } else { // AMBER
        recommendedSpeedMs = minSpeedMs;
        message = 'Prepare to stop for Red.';
        actionSignal = 'AMBER';
    }

    return {
        speedKmh: Math.round(recommendedSpeedMs * 3.6),
        message,
        actionSignal  // use this for UI color, not raw signalStatus
    };
}

// Haversine distance formula
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

module.exports = { calculateAdvisory, getDistance };
