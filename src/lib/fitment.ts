interface Vehicle { make: string; model: string; year: string; }

export function vehicleFits(vehicle: Vehicle | null, fitmentVehicles: string[]): boolean {
  if (!vehicle || !fitmentVehicles.length) return false;
  const make = vehicle.make.toLowerCase();
  const model = vehicle.model.toLowerCase();
  const year = parseInt(vehicle.year, 10);

  return fitmentVehicles.some((fv) => {
    const lower = fv.toLowerCase();
    if (lower.includes("universal")) return true;
    if (!lower.includes(make)) return false;
    if (!lower.includes(model)) return false;
    const range = fv.match(/(\d{4})(?:-|\u2013)(\d{4})/);
    if (range && !isNaN(year)) {
      return year >= parseInt(range[1], 10) && year <= parseInt(range[2], 10);
    }
    return true;
  });
}
