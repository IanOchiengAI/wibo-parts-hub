import brakePadsImg from "@/assets/products/brake-pads.jpg";
import oilFilterImg from "@/assets/products/oil-filter.jpg";
import carBatteryImg from "@/assets/products/car-battery.jpg";
import sparkPlugsImg from "@/assets/products/spark-plugs.jpg";
import shockAbsorberImg from "@/assets/products/shock-absorber.jpg";
import alternatorImg from "@/assets/products/alternator.jpg";
import brakeDiscsImg from "@/assets/products/brake-discs.jpg";
import airFilterImg from "@/assets/products/air-filter.jpg";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  urgency: string;
  fits: boolean;
  inStock: boolean;
  description: string;
  specs: ProductSpec[];
  fitmentVehicles: string[];
  relatedIds: string[];
  oemNumber: string;
  popularity: number;
  dateAdded: string;
  quality_tier: "genuine" | "oem" | "aftermarket" | "ex-japan";
}

export const products: Product[] = [
  {
    id: "1",
    name: "Front Brake Pads (OEM)",
    price: 4500,
    image: brakePadsImg,
    category: "Brakes",
    urgency: "Order now, delivered by 6PM",
    fits: true,
    inStock: true,
    description: "High-performance OEM-grade front brake pads with ceramic compound for superior stopping power and minimal dust. Direct replacement for factory pads.",
    oemNumber: "04465-12610",
    specs: [
      { label: "Material", value: "Ceramic Compound" },
      { label: "Position", value: "Front Axle" },
      { label: "Thickness", value: "15.2mm" },
      { label: "Width", value: "131.6mm" },
      { label: "Wear Indicator", value: "Yes" },
      { label: "Warranty", value: "24 months" },
    ],
    fitmentVehicles: ["Toyota Fielder 2006-2024", "Toyota Axio 2006-2024", "Toyota Corolla 2006-2024", "Toyota Vitz 2010-2020"],
    relatedIds: ["7", "5"],
    popularity: 95,
    dateAdded: "2025-12-01",
    quality_tier: "oem",
  },
  {
    id: "2",
    name: "Oil Filter — Toyota",
    price: 850,
    image: oilFilterImg,
    category: "Filters",
    urgency: "Order now, delivered by 6PM",
    fits: true,
    inStock: true,
    description: "Genuine-spec oil filter for Toyota engines. Multi-layer filtration media captures particles as small as 25 microns for clean oil circulation.",
    oemNumber: "90915-YZZD4",
    specs: [
      { label: "Type", value: "Spin-On" },
      { label: "Thread Size", value: "M20 x 1.5" },
      { label: "Height", value: "80mm" },
      { label: "Outer Diameter", value: "68mm" },
      { label: "Bypass Valve", value: "Yes" },
      { label: "Warranty", value: "12 months" },
    ],
    fitmentVehicles: ["Toyota Fielder 1.5L", "Toyota Vitz 1.3L", "Toyota Axio 1.5L", "Toyota Corolla 1.8L"],
    relatedIds: ["8", "4"],
    popularity: 88,
    dateAdded: "2025-11-15",
    quality_tier: "oem",
  },
  {
    id: "3",
    name: "Car Battery 60AH",
    price: 12500,
    image: carBatteryImg,
    category: "Batteries",
    urgency: "Only 3 left in stock",
    fits: true,
    inStock: true,
    description: "Maintenance-free 60AH car battery with calcium-calcium technology. Excellent cold cranking performance for reliable starts in all conditions.",
    oemNumber: "N/A",
    specs: [
      { label: "Capacity", value: "60AH" },
      { label: "Voltage", value: "12V" },
      { label: "CCA", value: "540A" },
      { label: "Technology", value: "Calcium-Calcium" },
      { label: "Dimensions", value: "242×175×190mm" },
      { label: "Warranty", value: "18 months" },
    ],
    fitmentVehicles: ["Universal — fits most sedans & hatchbacks", "Toyota, Nissan, Honda, Subaru"],
    relatedIds: ["6", "4"],
    popularity: 72,
    dateAdded: "2026-01-10",
    quality_tier: "oem",
  },
  {
    id: "4",
    name: "Spark Plug Set (4pc)",
    price: 2800,
    image: sparkPlugsImg,
    category: "Engine",
    urgency: "Order now, delivered by 6PM",
    fits: false,
    inStock: true,
    description: "Iridium-tipped spark plug set for improved ignition efficiency, better fuel economy, and smoother idle. Set of 4 plugs.",
    oemNumber: "90919-01253",
    specs: [
      { label: "Type", value: "Iridium" },
      { label: "Gap", value: "1.1mm" },
      { label: "Thread", value: "M12 x 1.25" },
      { label: "Reach", value: "26.5mm" },
      { label: "Hex Size", value: "14mm" },
      { label: "Warranty", value: "12 months" },
    ],
    fitmentVehicles: ["Toyota 1NZ-FE Engine", "Toyota 2NZ-FE Engine", "Toyota Vitz, Fielder, Axio"],
    relatedIds: ["2", "8"],
    popularity: 65,
    dateAdded: "2025-10-20",
    quality_tier: "oem",
  },
  {
    id: "5",
    name: "Front Shock Absorber",
    price: 6200,
    image: shockAbsorberImg,
    category: "Suspension",
    urgency: "Order now, delivered by 6PM",
    fits: true,
    inStock: true,
    description: "Gas-charged front shock absorber for responsive handling and comfortable ride. Twin-tube design with precision-calibrated valving.",
    oemNumber: "48510-80461",
    specs: [
      { label: "Type", value: "Gas-Charged Twin-Tube" },
      { label: "Position", value: "Front Left / Right" },
      { label: "Extended Length", value: "525mm" },
      { label: "Compressed", value: "345mm" },
      { label: "Mount Type", value: "Eye / Pin" },
      { label: "Warranty", value: "24 months" },
    ],
    fitmentVehicles: ["Toyota Fielder 2006-2024", "Toyota Corolla 2006-2024", "Toyota Axio 2006-2024"],
    relatedIds: ["1", "7"],
    popularity: 80,
    dateAdded: "2026-02-05",
    quality_tier: "oem",
  },
  {
    id: "6",
    name: "Alternator Assembly",
    price: 15800,
    image: alternatorImg,
    category: "Electrical",
    urgency: "Ships tomorrow",
    fits: false,
    inStock: true,
    description: "Remanufactured alternator assembly with new voltage regulator and bearings. Tested to OEM output specifications for reliable charging.",
    oemNumber: "27060-21150",
    specs: [
      { label: "Output", value: "80A" },
      { label: "Voltage", value: "12V" },
      { label: "Pulley Type", value: "6-Groove Serpentine" },
      { label: "Rotation", value: "CW" },
      { label: "Condition", value: "Remanufactured" },
      { label: "Warranty", value: "12 months" },
    ],
    fitmentVehicles: ["Toyota Corolla 1.5L 2006-2012", "Toyota Fielder 1.5L 2006-2012"],
    relatedIds: ["3", "4"],
    popularity: 45,
    dateAdded: "2025-09-01",
    quality_tier: "oem",
  },
  {
    id: "7",
    name: "Rear Brake Discs (Pair)",
    price: 7500,
    image: brakeDiscsImg,
    category: "Brakes",
    urgency: "Order now, delivered by 6PM",
    fits: true,
    inStock: true,
    description: "Precision-machined rear brake discs with balanced weight distribution for vibration-free braking. Sold as a pair for even wear.",
    oemNumber: "42431-12310",
    specs: [
      { label: "Position", value: "Rear Axle" },
      { label: "Diameter", value: "259mm" },
      { label: "Thickness", value: "9mm" },
      { label: "Min. Thickness", value: "7.5mm" },
      { label: "Bolt Holes", value: "4" },
      { label: "Warranty", value: "18 months" },
    ],
    fitmentVehicles: ["Toyota Fielder 2006-2024", "Toyota Axio 2006-2024", "Toyota Corolla 2006-2024"],
    relatedIds: ["1", "5"],
    popularity: 70,
    dateAdded: "2026-03-01",
    quality_tier: "oem",
  },
  {
    id: "8",
    name: "Air Filter — Universal",
    price: 1200,
    image: airFilterImg,
    category: "Filters",
    urgency: "Order now, delivered by 6PM",
    fits: true,
    inStock: true,
    description: "High-flow air filter with multi-layer synthetic media. Traps 99% of airborne contaminants while maintaining optimal airflow to the engine.",
    oemNumber: "17801-21050",
    specs: [
      { label: "Type", value: "Panel Filter" },
      { label: "Media", value: "Synthetic Multi-Layer" },
      { label: "Length", value: "252mm" },
      { label: "Width", value: "170mm" },
      { label: "Height", value: "43mm" },
      { label: "Warranty", value: "12 months" },
    ],
    fitmentVehicles: ["Toyota Vitz 1.0L-1.5L", "Toyota Fielder 1.5L", "Toyota Axio 1.5L", "Universal fit for select models"],
    relatedIds: ["2", "4"],
    popularity: 82,
    dateAdded: "2026-02-20",
    quality_tier: "oem",
  },
];

export const categories = [
  { name: "Brakes", icon: "disc" },
  { name: "Filters", icon: "filter" },
  { name: "Batteries", icon: "battery" },
  { name: "Engine", icon: "cog" },
  { name: "Suspension", icon: "arrowUpDown" },
  { name: "Electrical", icon: "zap" },
];

export const vehicleMakes = ["Toyota", "Nissan", "Subaru", "Honda", "Mitsubishi", "Mazda", "Suzuki", "Mercedes-Benz", "BMW", "Volkswagen"];
export const vehicleModels: Record<string, string[]> = {
  Toyota: ["Fielder", "Axio", "Vitz", "Harrier", "Prado", "Hilux", "Probox"],
  Nissan: ["Note", "X-Trail", "Juke", "March", "Tiida", "Navara"],
  Subaru: ["Impreza", "Legacy", "Forester", "Outback", "XV"],
  Honda: ["Fit", "Vezel", "CR-V", "Civic", "Accord"],
  Mitsubishi: ["Outlander", "Lancer", "Pajero", "L200", "RVR"],
  Mazda: ["Demio", "Axela", "CX-5", "Atenza", "CX-3"],
  Suzuki: ["Swift", "Alto", "Escudo", "Jimny", "Vitara"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLE", "GLA", "A-Class"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "1 Series"],
  Volkswagen: ["Golf", "Polo", "Tiguan", "Touareg", "Passat"],
};
export const vehicleYears = Array.from({ length: 15 }, (_, i) => (2025 - i).toString());
