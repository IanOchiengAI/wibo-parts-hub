export interface ChassisEntry {
  code: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  engine: string;
}

export const CHASSIS_CODES: ChassisEntry[] = [
  // Toyota Fielder / Axio (NZE)
  { code: "NZE121", make: "Toyota", model: "Fielder",  yearFrom: 2000, yearTo: 2006, engine: "1NZ-FE 1.5L" },
  { code: "NZE141", make: "Toyota", model: "Fielder",  yearFrom: 2006, yearTo: 2012, engine: "1NZ-FE 1.5L" },
  { code: "NRE161", make: "Toyota", model: "Fielder",  yearFrom: 2012, yearTo: 2024, engine: "1NR-FE 1.5L" },
  { code: "NZE141-AXIO", make: "Toyota", model: "Axio", yearFrom: 2006, yearTo: 2012, engine: "1NZ-FE 1.5L" }, // specific identifier
  { code: "NRE161-AXIO", make: "Toyota", model: "Axio", yearFrom: 2012, yearTo: 2024, engine: "1NR-FE 1.5L" },
  // Toyota Vitz
  { code: "SCP10",  make: "Toyota", model: "Vitz",     yearFrom: 1999, yearTo: 2005, engine: "1SZ-FE 1.0L" },
  { code: "NCP91",  make: "Toyota", model: "Vitz",     yearFrom: 2005, yearTo: 2010, engine: "1NZ-FE 1.5L" },
  { code: "KSP130", make: "Toyota", model: "Vitz",     yearFrom: 2010, yearTo: 2019, engine: "1KR-FE 1.0L" },
  // Toyota Probox
  { code: "NCP51",  make: "Toyota", model: "Probox",   yearFrom: 2002, yearTo: 2014, engine: "1NZ-FE 1.5L" },
  { code: "NCP160", make: "Toyota", model: "Probox",   yearFrom: 2014, yearTo: 2024, engine: "1NZ-FE 1.5L" },
  // Toyota Prado
  { code: "KDJ120", make: "Toyota", model: "Prado",    yearFrom: 2003, yearTo: 2009, engine: "1KD-FTV 3.0L Diesel" },
  { code: "KDJ150", make: "Toyota", model: "Prado",    yearFrom: 2009, yearTo: 2024, engine: "1KD-FTV 3.0L Diesel" },
  // Toyota Harrier
  { code: "MCU15",  make: "Toyota", model: "Harrier",  yearFrom: 1997, yearTo: 2003, engine: "1MZ-FE 3.0L" },
  { code: "ACU30",  make: "Toyota", model: "Harrier",  yearFrom: 2003, yearTo: 2013, engine: "2AZ-FE 2.4L" },
  // Toyota Land Cruiser 70 Series
  { code: "HZJ76",  make: "Toyota", model: "Land Cruiser", yearFrom: 1999, yearTo: 2024, engine: "1HZ 4.2L Diesel" },
  // Toyota Hilux
  { code: "KUN25",  make: "Toyota", model: "Hilux",    yearFrom: 2005, yearTo: 2015, engine: "1KD-FTV 3.0L Diesel" },
  { code: "GGN25",  make: "Toyota", model: "Hilux",    yearFrom: 2005, yearTo: 2015, engine: "2GR-FE 4.0L" },
  // Nissan Note
  { code: "E11",    make: "Nissan", model: "Note",     yearFrom: 2005, yearTo: 2012, engine: "HR15DE 1.5L" },
  { code: "E12",    make: "Nissan", model: "Note",     yearFrom: 2012, yearTo: 2020, engine: "HR12DE 1.2L" },
  // Nissan X-Trail
  { code: "T30",    make: "Nissan", model: "X-Trail",  yearFrom: 2001, yearTo: 2007, engine: "QR25DE 2.5L" },
  { code: "T31",    make: "Nissan", model: "X-Trail",  yearFrom: 2007, yearTo: 2013, engine: "MR20DE 2.0L" },
  // Nissan March
  { code: "K12",    make: "Nissan", model: "March",    yearFrom: 2002, yearTo: 2010, engine: "CR10DE 1.0L" },
  { code: "K13",    make: "Nissan", model: "March",    yearFrom: 2010, yearTo: 2019, engine: "HR12DE 1.2L" },
  // Subaru Impreza
  { code: "GD9",    make: "Subaru", model: "Impreza",  yearFrom: 2000, yearTo: 2007, engine: "EJ204 2.0L" },
  { code: "GH8",    make: "Subaru", model: "Impreza",  yearFrom: 2007, yearTo: 2011, engine: "EJ20 2.0L" },
  // Subaru Forester
  { code: "SG5",    make: "Subaru", model: "Forester", yearFrom: 2002, yearTo: 2008, engine: "EJ205 2.0T" },
  { code: "SH5",    make: "Subaru", model: "Forester", yearFrom: 2008, yearTo: 2013, engine: "EJ20 2.0L" },
  // Honda Fit
  { code: "GD1",    make: "Honda",  model: "Fit",      yearFrom: 2001, yearTo: 2007, engine: "L13A 1.3L" },
  { code: "GE6",    make: "Honda",  model: "Fit",      yearFrom: 2007, yearTo: 2013, engine: "L13A 1.3L" },
  { code: "GK3",    make: "Honda",  model: "Fit",      yearFrom: 2013, yearTo: 2020, engine: "L13B 1.3L" },
  // Honda Vezel
  { code: "RU1",    make: "Honda",  model: "Vezel",    yearFrom: 2013, yearTo: 2021, engine: "L15B 1.5L" },
];

export function lookupChassis(query: string): ChassisEntry | null {
  const q = query.trim().toUpperCase().replace(/[-\s]/g, "");
  // Match prefix
  return (
    CHASSIS_CODES.find(
      (c) => c.code.replace(/[-\s]/g, "") === q || q.startsWith(c.code.replace(/[-\s]/g, ""))
    ) ?? null
  );
}
