export type CalcResult = { title: string; date: string; inputs: Record<string,string>; results: Record<string,string>; formula: string; assumptions: string[]; diagram?: 'iso'|'taper'|'bolt'|'bend' };
export function calculateTaper(large: number, length: number, denominator: number) {
  if (![large,length,denominator].every(Number.isFinite) || large<=0 || length<=0 || denominator<=0) throw new Error('Enter positive values for diameter, length, and taper denominator.');
  const difference=length/denominator, small=large-difference;
  if (!Number.isFinite(difference) || difference<=0) throw new Error('The specified taper is outside the representable range for these inputs.');
  if (small<=0) throw new Error('The calculated small-end diameter must be greater than zero. Check the length and taper ratio.');
  const actual=length/difference;
  if (!Number.isFinite(actual)) throw new Error('The calculated taper ratio is outside the representable numeric range.');
  return {small,difference,actual,verified:true};
}
export type DiameterUnit = 'mm' | 'in';
export type ForceUnit = 'N' | 'kN' | 'lbf';
const forceToN: Record<ForceUnit, number> = { N: 1, kN: 1000, lbf: 4.4482216152605 };
export function calculateTorque(diameter:number, preload:number, k:number, diameterUnit:DiameterUnit='mm', forceUnit:ForceUnit='N') {
  if (![diameter,preload,k].every(Number.isFinite) || diameter<=0 || preload<=0 || k<=0) throw new Error('Enter positive, finite values for diameter, preload, and nut factor.');
  if (!['mm','in'].includes(diameterUnit) || !Object.prototype.hasOwnProperty.call(forceToN,forceUnit)) throw new Error('Unsupported input unit.');
  const diameterMm=diameterUnit==='in'?diameter*25.4:diameter;
  const diameterM=diameterMm/1000, preloadN=preload*forceToN[forceUnit];
  const torque=k*preloadN*diameterM;
  if (![diameterMm,diameterM,preloadN,torque].every(Number.isFinite)) throw new Error('The converted values exceed the supported numeric range.');
  return {torque,diameterM,diameterMm,preloadN};
}
export function calculateBend(t:number,r:number,angle:number,k:number,flangeA?:number,flangeB?:number) {
  if (![t,r,angle,k].every(Number.isFinite) || t<=0 || r<=0) throw new Error('Thickness and inside radius must be greater than zero.');
  if (angle<=0 || angle>=180) throw new Error('Bend angle must be greater than 0° and less than 180°.');
  if (k<0 || k>1) throw new Error('K-factor must be between 0 and 1. Typical values depend on material and process.');
  if ((flangeA===undefined)!==(flangeB===undefined)) throw new Error('Enter both flange dimensions to calculate flat pattern length.');
  if ((flangeA!==undefined && (!Number.isFinite(flangeA)||flangeA<=0)) || (flangeB!==undefined && (!Number.isFinite(flangeB)||flangeB<=0))) throw new Error('Optional flange dimensions must be positive values.');
  const theta=angle*Math.PI/180, ba=theta*(r+k*t), outsideSetback=(r+t)*Math.tan(theta/2), bd=2*outsideSetback-ba;
  const flat=flangeA!==undefined&&flangeB!==undefined&&flangeA>0&&flangeB>0?flangeA+flangeB-bd:undefined;
  if (![theta,ba,outsideSetback,bd].every(Number.isFinite)) throw new Error('The calculated bend geometry is outside the supported numeric range.');
  if (flat!==undefined && !Number.isFinite(flat)) throw new Error('The calculated flat pattern length is outside the supported numeric range.');
  if (flat!==undefined && flat<=0) throw new Error('The supplied flange dimensions produce a non-positive flat pattern length.');
  return {theta,ba,bd,outsideSetback,flat};
}
