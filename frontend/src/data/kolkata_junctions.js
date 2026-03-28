// ─── Kolkata Junction Data — Girish Park → NIT Narula, Agarpara ─────────────
// Developer's real daily commute route via BT Road

const KOLKATA_JUNCTIONS = [
  {
    id: 1, sequence: 1,
    name: "Girish Park Metro Crossing",
    area: "Start Point",
    lat: 22.5889, lng: 88.3654,
    redDuration: 90, greenDuration: 45, yellowDuration: 5,
    peakHourRed: 120, peakHourGreen: 35,
    distanceFromStart_km: 0,
    distanceToNext_km: 1.2,
    vehicleDensity: "high",
    annualFuelWaste_litres: 178000,
    note: "Metro exit — heavy morning rush 8-10am"
  },
  {
    id: 2, sequence: 2,
    name: "Shyambazar 5-Point Crossing",
    area: "BT Road Entry",
    lat: 22.6054, lng: 88.3697,
    redDuration: 130, greenDuration: 65, yellowDuration: 5,
    peakHourRed: 160, peakHourGreen: 50,
    distanceFromStart_km: 1.2,
    distanceToNext_km: 2.1,
    vehicleDensity: "very_high",
    annualFuelWaste_litres: 312000,
    note: "Kolkata most congested 5-point junction"
  },
  {
    id: 3, sequence: 3,
    name: "Sinthi More Junction",
    area: "BT Road North",
    lat: 22.6189, lng: 88.3712,
    redDuration: 100, greenDuration: 50, yellowDuration: 5,
    peakHourRed: 130, peakHourGreen: 40,
    distanceFromStart_km: 3.3,
    distanceToNext_km: 1.8,
    vehicleDensity: "high",
    annualFuelWaste_litres: 198000,
    note: "Bus depot nearby — heavy auto + bus congestion"
  },
  {
    id: 4, sequence: 4,
    name: "Dunlop Crossing",
    area: "BT Road North",
    lat: 22.6389, lng: 88.3756,
    redDuration: 110, greenDuration: 55, yellowDuration: 5,
    peakHourRed: 140, peakHourGreen: 45,
    distanceFromStart_km: 5.1,
    distanceToNext_km: 1.4,
    vehicleDensity: "very_high",
    annualFuelWaste_litres: 267000,
    note: "Major industrial + student traffic"
  },
  {
    id: 5, sequence: 5,
    name: "Belgharia Junction",
    area: "BT Road North",
    lat: 22.6521, lng: 88.3798,
    redDuration: 90, greenDuration: 45, yellowDuration: 5,
    peakHourRed: 110, peakHourGreen: 35,
    distanceFromStart_km: 6.5,
    distanceToNext_km: 1.2,
    vehicleDensity: "medium",
    annualFuelWaste_litres: 143000,
    note: "Industrial area — moderate traffic"
  },
  {
    id: 6, sequence: 6,
    name: "Agarpara Medical College Junction",
    area: "BT Road Agarpara",
    lat: 22.6598, lng: 88.3821,
    redDuration: 90, greenDuration: 45, yellowDuration: 5,
    peakHourRed: 115, peakHourGreen: 35,
    distanceFromStart_km: 7.7,
    distanceToNext_km: 0.6,
    vehicleDensity: "medium",
    annualFuelWaste_litres: 112000,
    note: "Hospital traffic — ambulances get priority"
  },
  {
    id: 7, sequence: 7,
    name: "The Aryans School Turn — BT Road",
    area: "Final Turn to NIT Narula",
    lat: 22.6631, lng: 88.3834,
    redDuration: 60, greenDuration: 30, yellowDuration: 5,
    peakHourRed: 80, peakHourGreen: 25,
    distanceFromStart_km: 8.3,
    distanceToNext_km: 0.4,
    vehicleDensity: "low",
    annualFuelWaste_litres: 54000,
    note: "Turn into college lane — school children crossing"
  }
];

const ROUTE_SUMMARY = {
  name: "Girish Park → NIT Narula Agarpara",
  developerRoute: true,
  developerNote: "Real daily commute of developer Ashish Chaurasia",
  totalDistance_km: 8.7,
  totalJunctions: 7,
  estimatedTime_normal_min: 38,
  estimatedTime_withGLOSA_min: 26,
  timeSaved_min: 12,
  fuelSaved_percent: 18,
  totalAnnualFuelWaste_litres: 1264000,
  co2Saved_kg_per_day: 2.6
};

export { KOLKATA_JUNCTIONS, ROUTE_SUMMARY };
