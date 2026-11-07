export type ToleranceKind = 'hole' | 'shaft';
export interface ISODeviationRow {
  kind: ToleranceKind;
  designation: string;
  minDiameterMm: number;
  maxDiameterMm: number;
  upperDeviationUm: number;
  lowerDeviationUm: number;
}
export const toleranceDataSource = 'ISO 286-1:2010 and ISO 286-2:2010 (including Corrigendum 1:2013). Upload a licensed, controlled table in the documented CSV format.';

/** CSV columns: kind,designation,minDiameterMm,maxDiameterMm,upperDeviationUm,lowerDeviationUm
 * Diameter intervals use min < basic diameter <= max; min=0 includes diameter 0 only (not a valid calculator input).
 * The application intentionally ships no ISO deviation values.
 */
export function parseToleranceCsv(csv: string): ISODeviationRow[] {
  const lines=csv.replace(/^\uFEFF/,'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(lines.length<2) throw new Error('The CSV must include a header and at least one tolerance row.');
  const expected=['kind','designation','minDiameterMm','maxDiameterMm','upperDeviationUm','lowerDeviationUm'];
  const header=lines[0].split(',').map(x=>x.trim());
  if(expected.some((name,i)=>header[i]!==name) || header.length!==expected.length) throw new Error(`Use this exact CSV header: ${expected.join(',')}`);
  const rows=lines.slice(1).map((line,index)=>{
    const cells=line.split(',').map(x=>x.trim());
    if(cells.length!==6) throw new Error(`CSV row ${index+2} must contain exactly 6 columns.`);
    const [kind,designation,minRaw,maxRaw,upperRaw,lowerRaw]=cells;
    if(kind!=='hole'&&kind!=='shaft') throw new Error(`CSV row ${index+2}: kind must be hole or shaft.`);
    const minDiameterMm=Number(minRaw),maxDiameterMm=Number(maxRaw),upperDeviationUm=Number(upperRaw),lowerDeviationUm=Number(lowerRaw);
    if(!designation || ![minDiameterMm,maxDiameterMm,upperDeviationUm,lowerDeviationUm].every(Number.isFinite) || minDiameterMm<0 || maxDiameterMm<=minDiameterMm || upperDeviationUm<lowerDeviationUm) throw new Error(`CSV row ${index+2} contains invalid limits or deviations.`);
    if(kind==='hole'&&!/^[A-Z][A-Z0-9]*$/.test(designation)) throw new Error(`CSV row ${index+2}: hole designation must use an uppercase letter.`);
    if(kind==='shaft'&&!/^[a-z][a-z0-9]*$/.test(designation)) throw new Error(`CSV row ${index+2}: shaft designation must use a lowercase letter.`);
    return {kind,designation,minDiameterMm,maxDiameterMm,upperDeviationUm,lowerDeviationUm} as ISODeviationRow;
  });
  const keys=new Set<string>();
  for(const row of rows){const key=`${row.kind}|${row.designation}|${row.minDiameterMm}|${row.maxDiameterMm}`;if(keys.has(key))throw new Error(`Duplicate CSV range for ${row.kind} ${row.designation}.`);keys.add(key)}
  return rows;
}
