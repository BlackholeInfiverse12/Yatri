export interface Station {
  code: string;
  name: string;
  lines: string[];
  coordinates?: [number, number];
  zone?: number;
  distanceFromTerminal?: number;
}

export interface Train {
  number: string;
  name: string;
  type: "Fast" | "Slow" | "Express";
  line: string;
  direction: "UP" | "DOWN";
  origin: string;
  destination: string;
  currentStation?: string;
  nextStation?: string;
  delay: number; // in minutes
  coaches: number;
  crowdLevel: "Low" | "Medium" | "High";
}

export interface GraphEdge {
  to: string;
  line: string;
  weight: number; // 1 for same line stop, 3 for transfer
}

// Full stations from mumbai_suburban_all_lines_stations.csv, lines based on "Yes", coords merged from master.csv/GeoJSON or approx
export const MUMBAI_STATIONS: Station[] = [
  { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus (CSMT)", lines: ["Central", "Harbour"], coordinates: [18.9402, 72.8358] as [number, number], zone: 1, distanceFromTerminal: 0 },
  { code: "MSD", name: "Masjid", lines: ["Central"], coordinates: [18.9478, 72.8420] as [number, number], zone: 1, distanceFromTerminal: 2 },
  { code: "SNRD", name: "Sandhurst Road", lines: ["Central"], coordinates: [18.9520, 72.8450] as [number, number], zone: 1, distanceFromTerminal: 3 },
  { code: "DKRD", name: "Dockyard Road", lines: ["Harbour"], coordinates: [18.9567, 72.8445] as [number, number], zone: 1, distanceFromTerminal: 5 },
  { code: "RRD", name: "Reay Road", lines: ["Central"], coordinates: [18.9678, 72.8456] as [number, number], zone: 1, distanceFromTerminal: 7 },
  { code: "CTGN", name: "Cotton Green", lines: ["Central"], coordinates: [18.9789, 72.8467] as [number, number], zone: 1, distanceFromTerminal: 9 },
  { code: "SWR", name: "Sewri", lines: ["Central", "Harbour"], coordinates: [19.0000, 72.8700] as [number, number], zone: 1, distanceFromTerminal: 11 },
  { code: "WDL", name: "Wadala Road", lines: ["Harbour"], coordinates: [19.0170, 72.8300] as [number, number], zone: 1, distanceFromTerminal: 13 },
  { code: "KCE", name: "King's Circle", lines: ["Harbour"], coordinates: [19.0270, 72.8480] as [number, number], zone: 1, distanceFromTerminal: 15 },
  { code: "MM", name: "Mahim Junction", lines: ["Harbour"], coordinates: [19.0410, 72.8420] as [number, number], zone: 1, distanceFromTerminal: 17 },
  { code: "BA", name: "Bandra", lines: ["Western", "Harbour"], coordinates: [19.0546, 72.8400] as [number, number], zone: 1, distanceFromTerminal: 24 },
  { code: "KHRA", name: "Khar Road", lines: ["Western"], coordinates: [19.0696, 72.8370] as [number, number], zone: 1, distanceFromTerminal: 27 },
  { code: "STC", name: "Santacruz", lines: ["Western"], coordinates: [19.0810, 72.8370] as [number, number], zone: 1, distanceFromTerminal: 30 },
  { code: "VLP", name: "Vile Parle", lines: ["Western"], coordinates: [19.0993, 72.8470] as [number, number], zone: 1, distanceFromTerminal: 33 },
  { code: "ADH", name: "Andheri", lines: ["Western"], coordinates: [19.1197, 72.8468] as [number, number], zone: 2, distanceFromTerminal: 38 },
  { code: "JOS", name: "Jogeshwari", lines: ["Western"], coordinates: [19.1347, 72.8478] as [number, number], zone: 2, distanceFromTerminal: 42 },
  { code: "RAM", name: "Ram Mandir", lines: ["Western"], coordinates: [19.1442, 72.8421] as [number, number], zone: 2, distanceFromTerminal: 45 },
  { code: "GMO", name: "Goregaon", lines: ["Western"], coordinates: [19.1626, 72.8497] as [number, number], zone: 2, distanceFromTerminal: 48 },
  { code: "CCG", name: "Churchgate", lines: ["Western"], coordinates: [18.9353, 72.8270] as [number, number], zone: 1, distanceFromTerminal: 0 },
  { code: "MEL", name: "Marine Lines", lines: ["Western"], coordinates: [18.9387, 72.8235] as [number, number], zone: 1, distanceFromTerminal: 2 },
  { code: "CYR", name: "Charni Road", lines: ["Western"], coordinates: [18.9506, 72.8190] as [number, number], zone: 1, distanceFromTerminal: 4 },
  { code: "GTB", name: "Grant Road", lines: ["Western"], coordinates: [18.9629, 72.8147] as [number, number], zone: 1, distanceFromTerminal: 6 },
  { code: "BCT", name: "Mumbai Central", lines: ["Western"], coordinates: [18.9690, 72.8194] as [number, number], zone: 1, distanceFromTerminal: 8 },
  { code: "LPA", name: "Lower Parel", lines: ["Western"], coordinates: [18.9963, 72.8266] as [number, number], zone: 1, distanceFromTerminal: 12 },
  { code: "MHD", name: "Mahalaxmi", lines: ["Western"], coordinates: [18.9827, 72.8235] as [number, number], zone: 1, distanceFromTerminal: 10 },
  { code: "PR", name: "Prabhadevi", lines: ["Western"], coordinates: [19.0170, 72.8300] as [number, number], zone: 1, distanceFromTerminal: 14 },
  { code: "PR", name: "Parel", lines: ["Western", "Central"], coordinates: [19.0030, 72.8330] as [number, number], zone: 1, distanceFromTerminal: 16 },
  { code: "DR", name: "Dadar", lines: ["Western", "Central"], coordinates: [19.0183, 72.8421] as [number, number], zone: 1, distanceFromTerminal: 18 },
  { code: "MR", name: "Matunga Road", lines: ["Western"], coordinates: [19.0270, 72.8480] as [number, number], zone: 1, distanceFromTerminal: 20 },
  { code: "BY", name: "Byculla", lines: ["Central"], coordinates: [18.9750, 72.8310] as [number, number], zone: 1, distanceFromTerminal: 4 },
  { code: "CU", name: "Currey Road", lines: ["Central"], coordinates: [19.0010, 72.8410] as [number, number], zone: 1, distanceFromTerminal: 6 },
  { code: "VK", name: "Vikhroli", lines: ["Central"], coordinates: [19.1094, 72.9250] as [number, number], zone: 2, distanceFromTerminal: 33 },
  { code: "KJM", name: "Kanjurmarg", lines: ["Central"], coordinates: [19.1320, 72.9370] as [number, number], zone: 2, distanceFromTerminal: 38 },
  { code: "BDTS", name: "Bandra Terminus", lines: ["Western"], coordinates: [19.0544, 72.8406] as [number, number], zone: 1, distanceFromTerminal: 24 },
  { code: "KURLA", name: "Kurla", lines: ["Central", "Harbour"], coordinates: [19.0726, 72.8796] as [number, number], zone: 1, distanceFromTerminal: 22 },
  { code: "TKNG", name: "Tilak Nagar", lines: ["Harbour"], coordinates: [19.0889, 72.8911] as [number, number], zone: 1, distanceFromTerminal: 26 },
  { code: "CHM", name: "Chembur", lines: ["Harbour"], coordinates: [19.0622, 72.8978] as [number, number], zone: 1, distanceFromTerminal: 29 },
  { code: "GV", name: "Govandi", lines: ["Harbour"], coordinates: [19.0544, 72.9156] as [number, number], zone: 1, distanceFromTerminal: 33 },
  { code: "MNK", name: "Mankhurd", lines: ["Harbour"], coordinates: [19.0456, 72.9289] as [number, number], zone: 1, distanceFromTerminal: 37 },
  { code: "VSH", name: "Vashi", lines: ["Harbour", "Trans-Harbour"], coordinates: [19.0767, 72.9989] as [number, number], zone: 2, distanceFromTerminal: 45 },
  { code: "SAP", name: "Sanpada", lines: ["Harbour", "Trans-Harbour"], coordinates: [19.0689, 73.0089] as [number, number], zone: 2, distanceFromTerminal: 48 },
  { code: "JUI", name: "Juinagar", lines: ["Harbour", "Trans-Harbour"], coordinates: [19.0611, 73.0189] as [number, number], zone: 2, distanceFromTerminal: 52 },
  { code: "NRL", name: "Nerul", lines: ["Harbour", "Trans-Harbour"], coordinates: [19.0533, 73.0289] as [number, number], zone: 2, distanceFromTerminal: 56 },
  { code: "SWD", name: "Seawoods–Darave", lines: ["Harbour", "Trans-Harbour"], coordinates: [19.0200, 73.0300] as [number, number], zone: 2, distanceFromTerminal: 60 },
  { code: "BUP", name: "CBD Belapur", lines: ["Harbour", "Trans-Harbour"], coordinates: [19.0100, 73.0400] as [number, number], zone: 2, distanceFromTerminal: 63 },
  { code: "KGA", name: "Kharghar", lines: ["Harbour", "Trans-Harbour"], coordinates: [19.0000, 73.0500] as [number, number], zone: 2, distanceFromTerminal: 66 },
  { code: "MSV", name: "Mansarovar", lines: ["Harbour", "Trans-Harbour"], coordinates: [18.9900, 73.0600] as [number, number], zone: 2, distanceFromTerminal: 69 },
  { code: "KND", name: "Khandeshwar", lines: ["Harbour", "Trans-Harbour"], coordinates: [18.9800, 73.0700] as [number, number], zone: 2, distanceFromTerminal: 72 },
  { code: "PNVL", name: "Panvel", lines: ["Harbour", "Trans-Harbour"], coordinates: [18.9894, 73.1175] as [number, number], zone: 3, distanceFromTerminal: 67 },
  { code: "TNA", name: "Thane", lines: ["Central", "Trans-Harbour"], coordinates: [19.1860, 72.9750] as [number, number], zone: 2, distanceFromTerminal: 54 },
  { code: "DGA", name: "Digha Gaon", lines: ["Trans-Harbour"], coordinates: [19.2000, 73.0000] as [number, number], zone: 2, distanceFromTerminal: 57 },
  { code: "AI", name: "Airoli", lines: ["Trans-Harbour"], coordinates: [19.1500, 72.9800] as [number, number], zone: 2, distanceFromTerminal: 60 },
  { code: "RBL", name: "Rabale", lines: ["Trans-Harbour"], coordinates: [19.1400, 72.9700] as [number, number], zone: 2, distanceFromTerminal: 63 },
  { code: "GHS", name: "Ghansoli", lines: ["Trans-Harbour"], coordinates: [19.1200, 72.9600] as [number, number], zone: 2, distanceFromTerminal: 66 },
  { code: "KPH", name: "Koparkhairane", lines: ["Trans-Harbour"], coordinates: [19.1100, 72.9500] as [number, number], zone: 2, distanceFromTerminal: 69 },
  { code: "TBH", name: "Turbhe", lines: ["Trans-Harbour"], coordinates: [19.1000, 72.9400] as [number, number], zone: 2, distanceFromTerminal: 72 },
  { code: "DR", name: "Dadar (WR/CR)", lines: ["Western", "Central"], coordinates: [19.0183, 72.8421] as [number, number], zone: 1, distanceFromTerminal: 18 },
  { code: "MDL", name: "Malad", lines: ["Western"], coordinates: [19.1875, 72.8489] as [number, number], zone: 2, distanceFromTerminal: 54 },
  { code: "KVI", name: "Kandivli", lines: ["Western"], coordinates: [19.2041, 72.8540] as [number, number], zone: 2, distanceFromTerminal: 59 },
  { code: "BVI", name: "Borivali", lines: ["Western"], coordinates: [19.2307, 72.8567] as [number, number], zone: 2, distanceFromTerminal: 64 },
  { code: "DHR", name: "Dahisar", lines: ["Western"], coordinates: [19.2500, 72.8600] as [number, number], zone: 3, distanceFromTerminal: 68 },
  { code: "MRA", name: "Mira Road", lines: ["Western"], coordinates: [19.2800, 72.8700] as [number, number], zone: 3, distanceFromTerminal: 72 },
  { code: "BYR", name: "Bhayandar", lines: ["Western"], coordinates: [19.3000, 72.8800] as [number, number], zone: 3, distanceFromTerminal: 76 },
  { code: "NGN", name: "Naigaon", lines: ["Western"], coordinates: [19.3400, 72.8900] as [number, number], zone: 3, distanceFromTerminal: 80 },
  { code: "BSR", name: "Vasai Road", lines: ["Western"], coordinates: [19.3732, 72.8330] as [number, number], zone: 3, distanceFromTerminal: 84 },
  { code: "NLL", name: "Nallasopara", lines: ["Western"], coordinates: [19.3900, 72.8300] as [number, number], zone: 3, distanceFromTerminal: 88 },
  { code: "VR", name: "Virar", lines: ["Western"], coordinates: [19.4550, 72.8117] as [number, number], zone: 3, distanceFromTerminal: 92 },
  { code: "VTN", name: "Vaitarna", lines: ["Western"], coordinates: [19.4400, 72.8100] as [number, number], zone: 3, distanceFromTerminal: 96 },
  { code: "SAP", name: "Saphale", lines: ["Western"], coordinates: [19.4100, 72.8000] as [number, number], zone: 3, distanceFromTerminal: 100 },
  { code: "KRD", name: "Kelve Road", lines: ["Western"], coordinates: [19.3800, 72.7900] as [number, number], zone: 3, distanceFromTerminal: 104 },
  { code: "PLG", name: "Palghar", lines: ["Western"], coordinates: [19.3500, 72.7800] as [number, number], zone: 3, distanceFromTerminal: 108 },
  { code: "UML", name: "Umroli", lines: ["Western"], coordinates: [19.3200, 72.7700] as [number, number], zone: 3, distanceFromTerminal: 112 },
  { code: "BOR", name: "Boisar", lines: ["Western"], coordinates: [19.8000, 72.7500] as [number, number], zone: 3, distanceFromTerminal: 116 },
  { code: "VGN", name: "Vangaon", lines: ["Western"], coordinates: [19.8500, 72.7400] as [number, number], zone: 3, distanceFromTerminal: 120 },
  { code: "DRD", name: "Dahanu Road", lines: ["Western"], coordinates: [19.9700, 72.7200] as [number, number], zone: 3, distanceFromTerminal: 124 },
  { code: "KYN", name: "Kalyan Junction", lines: ["Central"], coordinates: [19.2430, 73.1350] as [number, number], zone: 3, distanceFromTerminal: 58 },
  { code: "KLVA", name: "Kalwa", lines: ["Central"], coordinates: [19.1800, 72.9600] as [number, number], zone: 2, distanceFromTerminal: 51 },
  { code: "MLND", name: "Mulund", lines: ["Central"], coordinates: [19.1720, 72.9560] as [number, number], zone: 2, distanceFromTerminal: 49 },
  { code: "NHR", name: "Nahur", lines: ["Central"], coordinates: [19.1640, 72.9520] as [number, number], zone: 2, distanceFromTerminal: 45 },
  { code: "BND", name: "Bhandup", lines: ["Central"], coordinates: [19.1480, 72.9390] as [number, number], zone: 2, distanceFromTerminal: 42 },
  { code: "KJMG", name: "Kanjur Marg", lines: ["Central"], coordinates: [19.1320, 72.9370] as [number, number], zone: 2, distanceFromTerminal: 38 },
  { code: "GKP", name: "Ghatkopar", lines: ["Central"], coordinates: [19.0863, 72.9081] as [number, number], zone: 1, distanceFromTerminal: 29 },
  { code: "VID", name: "Vidyavihar", lines: ["Central"], coordinates: [19.0822, 72.8970] as [number, number], zone: 1, distanceFromTerminal: 26 },
  { code: "CNPK", name: "Chinchpokli", lines: ["Central"], coordinates: [18.9890, 72.8320] as [number, number], zone: 1, distanceFromTerminal: 8 },
  { code: "SION", name: "Sion", lines: ["Central"], coordinates: [19.0410, 72.8700] as [number, number], zone: 1, distanceFromTerminal: 15 },
  { code: "MTNG", name: "Matunga", lines: ["Central"], coordinates: [19.0270, 72.8480] as [number, number], zone: 1, distanceFromTerminal: 20 },
  { code: "KYN", name: "Kalyan", lines: ["Central"], coordinates: [19.2430, 73.1350] as [number, number], zone: 3, distanceFromTerminal: 58 },
  { code: "ULNR", name: "Ulhasnagar", lines: ["Central"], coordinates: [19.2200, 73.1100] as [number, number], zone: 3, distanceFromTerminal: 62 },
  { code: "ABN", name: "Ambarnath", lines: ["Central"], coordinates: [19.2000, 73.1300] as [number, number], zone: 3, distanceFromTerminal: 66 },
  { code: "BAP", name: "Badlapur", lines: ["Central"], coordinates: [19.1500, 73.1500] as [number, number], zone: 3, distanceFromTerminal: 70 },
  { code: "VGI", name: "Vangani", lines: ["Central"], coordinates: [19.1000, 73.1700] as [number, number], zone: 3, distanceFromTerminal: 74 },
  { code: "KJT", name: "Karjat", lines: ["Central"], coordinates: [19.0500, 73.2000] as [number, number], zone: 3, distanceFromTerminal: 78 },
  { code: "NR", name: "Neral", lines: ["Central"], coordinates: [19.0200, 73.1800] as [number, number], zone: 3, distanceFromTerminal: 76 },
  { code: "MBQ", name: "Mumbra", lines: ["Central"], coordinates: [19.0500, 73.0000] as [number, number], zone: 2, distanceFromTerminal: 56 },
  { code: "KOPR", name: "Kopar", lines: ["Central"], coordinates: [19.0600, 73.0100] as [number, number], zone: 2, distanceFromTerminal: 59 },
  { code: "KLVA", name: "Kalva", lines: ["Central"], coordinates: [19.1800, 72.9600] as [number, number], zone: 2, distanceFromTerminal: 51 },
  { code: "TLA", name: "Titwala", lines: ["Central"], coordinates: [19.3000, 73.0800] as [number, number], zone: 3, distanceFromTerminal: 82 },
  { code: "KDV", name: "Khadavli", lines: ["Central"], coordinates: [19.3100, 73.0900] as [number, number], zone: 3, distanceFromTerminal: 84 },
  { code: "KPH", name: "Khopoli", lines: ["Central"], coordinates: [18.7800, 73.3600] as [number, number], zone: 3, distanceFromTerminal: 88 },
  { code: "KSRA", name: "Kasara", lines: ["Central"], coordinates: [19.4400, 73.4800] as [number, number], zone: 3, distanceFromTerminal: 92 },
];

// Ordered sequences (full from CSV, approx order for branches)
export const LINE_SEQUENCES = {
  Western: ["CCG", "MEL", "CYR", "GTB", "BCT", "MHD", "LPA", "PR", "DR", "MR", "MM", "BA", "KHRA", "STC", "VLP", "ADH", "JOS", "RAM", "GMO", "MDL", "KVI", "BVI", "DHR", "MRA", "BYR", "NGN", "BSR", "NLL", "VR", "VTN", "SAP", "KRD", "PLG", "UML", "BOR", "VGN", "DRD"],
  Central: ["CSMT", "MSD", "SNRD", "BY", "CNPK", "CU", "PR", "DR", "MTNG", "SION", "KURLA", "VID", "GKP", "VK", "KJM", "BND", "NHR", "MLND", "TNA", "KLVA", "KYN", "ULNR", "ABN", "BAP", "VGI", "KJT", "NR", "MBQ", "KOPR", "TLA", "KDV", "KPH", "KSRA"],
  Harbour: ["CSMT", "DKRD", "WDL", "KCE", "MM", "BA", "KURLA", "TKNG", "CHM", "GV", "MNK", "VSH", "SAP", "JUI", "NRL", "SWD", "BUP", "KGA", "MSV", "KND", "PNVL"],
  "Trans-Harbour": ["TNA", "DGA", "AI", "RBL", "GHS", "KPH", "TBH", "VSH", "SAP", "JUI", "NRL", "SWD", "BUP", "KGA", "MSV", "KND", "PNVL"],
};

// Build GRAPH
export const GRAPH = new Map<string, { [key: string]: GraphEdge }>();

function addEdge(from: string, to: string, line: string, weight: number) {
  if (!GRAPH.has(from)) GRAPH.set(from, {});
  GRAPH.get(from)![to] = { to, line, weight };
  // Bidirectional for same line
  if (weight === 1) {
    if (!GRAPH.has(to)) GRAPH.set(to, {});
    GRAPH.get(to)![from] = { to: from, line, weight };
  }
}

// Add edges for each line
Object.entries(LINE_SEQUENCES).forEach(([line, codes]) => {
  codes.forEach((code, i) => {
    if (i < codes.length - 1) {
      addEdge(code, codes[i+1], line, 1);
    }
  });
});

// Add transfer edges (weight 3) at interchanges (self-loop for line change)
const INTERCHANGES = [
  { station: "DR", lines: ["Western", "Central"] },
  { station: "BA", lines: ["Western", "Harbour"] },
  { station: "KURLA", lines: ["Central", "Harbour"] },
  { station: "TNA", lines: ["Central", "Trans-Harbour"] },
  { station: "VSH", lines: ["Harbour", "Trans-Harbour"] },
  { station: "CSMT", lines: ["Central", "Harbour"] },
  { station: "PNVL", lines: ["Harbour", "Trans-Harbour"] },
];

INTERCHANGES.forEach(({ station, lines }) => {
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      addEdge(station, station, `${lines[i]}-${lines[j]}`, 3);
    }
  }
});

// Dijkstra for shortest path
function dijkstra(start: string, end: string, maxTransfers: number = 2) {
  const distances = new Map<string, number>([[start, 0]]);
  const previous = new Map<string, string>();
  const lineChanges = new Map<string, number>([[start, 0]]);
  const pq: [number, string][] = [[0, start]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, u] = pq.shift()!;
    if (dist > (distances.get(u) || Infinity)) continue;

    if (u === end) break;

    const neighbors = GRAPH.get(u) || {};
    Object.entries(neighbors).forEach(([v, edge]) => {
      const alt = dist + edge.weight;
      const currChanges = lineChanges.get(u) || 0;
      const newChanges = edge.weight > 1 ? currChanges + 1 : currChanges;
      if (newChanges > maxTransfers) return;

      if (alt < (distances.get(v) || Infinity)) {
        distances.set(v, alt);
        previous.set(v, u);
        lineChanges.set(v, newChanges);
        pq.push([alt, v]);
      }
    });
  }

  // Reconstruct path
  const path: string[] = [];
  let u = end;
  while (u && u !== start) {
    path.unshift(u);
    u = previous.get(u) || '';
  }
  if (u !== start || path.length === 0) return [];

  path.unshift(start);
  const duration = distances.get(end) || 0;
  const transfers = lineChanges.get(end) || 0;

  return [{ path, duration, transfers }];
}

// Find optimal routes
export function findOptimalRoutes(originCode: string, destinationCode: string, maxTransfers: number = 2): any[] {
  const origin = MUMBAI_STATIONS.find(s => s.code === originCode);
  const destination = MUMBAI_STATIONS.find(s => s.code === destinationCode);
  if (!origin || !destination) return [];

  const paths = dijkstra(originCode, destinationCode, maxTransfers);
  if (paths.length === 0) return [];

  return paths.map(({ path, duration, transfers }) => {
    // Reconstruct steps with lines (simplified: assume consecutive on same line until transfer)
    const steps = [];
    let currentLine = '';
    let fromStation = path[0];
    for (let i = 1; i < path.length; i++) {
      const toStation = path[i];
      const edge = GRAPH.get(fromStation)?.[toStation];
      if (!edge) continue;

      if (edge.weight > 1) {
        // Transfer
        steps.push({ mode: "transfer", from: fromStation, to: fromStation, duration: 3, line: '' });
      } else if (edge.line !== currentLine) {
        // New line segment
        if (currentLine) {
          steps.push({ mode: "train", line: currentLine, from: fromStation, to: fromStation, duration: 0 });
        }
        currentLine = edge.line;
      }
      fromStation = toStation;
    }
    if (currentLine) {
      steps.push({ mode: "train", line: currentLine, from: fromStation, to: path[path.length - 1], duration: duration });
    }

    return {
      type: transfers === 0 ? "Direct" : "Transfer",
      duration,
      transfers,
      fare: calculateFare(origin, destination),
      steps,
    };
  }).sort((a, b) => a.duration - b.duration);
}

// Fare
export const ROUTE_PRICES = {
  zone1: 5, zone2: 10, zone3: 15, crossZone: 20,
};

export function calculateFare(origin: Station, destination: Station): number {
  const maxZone = Math.max(origin.zone || 1, destination.zone || 1);
  if ((origin.zone || 1) !== (destination.zone || 1)) return ROUTE_PRICES.crossZone;
  return ROUTE_PRICES[`zone${maxZone}` as keyof typeof ROUTE_PRICES] || 5;
}

// LIVE_TRAINS expanded
export const LIVE_TRAINS: Train[] = [
  { number: "11001", name: "Churchgate-Virar Fast", type: "Fast", line: "Western", direction: "UP", origin: "CCG", destination: "VR", currentStation: "ADH", nextStation: "JOS", delay: 0, coaches: 15, crowdLevel: "High" },
  { number: "11002", name: "Virar-Churchgate Slow", type: "Slow", line: "Western", direction: "DOWN", origin: "VR", destination: "CCG", currentStation: "BVI", nextStation: "KVI", delay: 2, coaches: 12, crowdLevel: "Medium" },
  { number: "12001", name: "CSMT-Thane Slow", type: "Slow", line: "Central", direction: "UP", origin: "CSMT", destination: "TNA", currentStation: "KURLA", nextStation: "GKP", delay: 5, coaches: 12, crowdLevel: "Low" },
  { number: "12002", name: "Thane-CSMT Fast", type: "Fast", line: "Central", direction: "DOWN", origin: "TNA", destination: "CSMT", currentStation: "MLND", nextStation: "NHR", delay: 0, coaches: 15, crowdLevel: "High" },
  { number: "13001", name: "CSMT-Panvel Slow", type: "Slow", line: "Harbour", direction: "DOWN", origin: "CSMT", destination: "PNVL", currentStation: "KURLA", nextStation: "TKNG", delay: 3, coaches: 12, crowdLevel: "Medium" },
  { number: "13002", name: "Panvel-CSMT Fast", type: "Fast", line: "Harbour", direction: "UP", origin: "PNVL", destination: "CSMT", currentStation: "VSH", nextStation: "MNK", delay: 1, coaches: 12, crowdLevel: "Low" },
  { number: "14001", name: "Thane-Panvel Slow", type: "Slow", line: "Trans-Harbour", direction: "DOWN", origin: "TNA", destination: "PNVL", currentStation: "KPH", nextStation: "TBH", delay: 4, coaches: 12, crowdLevel: "Medium" },
  { number: "14002", name: "Panvel-Thane Express", type: "Express", line: "Trans-Harbour", direction: "UP", origin: "PNVL", destination: "TNA", currentStation: "NRL", nextStation: "VSH", delay: 0, coaches: 15, crowdLevel: "Low" },
];
