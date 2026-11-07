import { describe, expect, it } from 'vitest';
import { calculateIsoFit } from '../calculations/isoFits';
import { parseToleranceCsv, type ISODeviationRow } from '../data/isoFits';

const rows:ISODeviationRow[]=[
  {kind:'hole',designation:'H7',minDiameterMm:18,maxDiameterMm:30,upperDeviationUm:21,lowerDeviationUm:0},
  {kind:'shaft',designation:'g6',minDiameterMm:18,maxDiameterMm:30,upperDeviationUm:-7,lowerDeviationUm:-20},
  {kind:'shaft',designation:'p6',minDiameterMm:18,maxDiameterMm:30,upperDeviationUm:35,lowerDeviationUm:22},
  {kind:'shaft',designation:'k6',minDiameterMm:18,maxDiameterMm:30,upperDeviationUm:15,lowerDeviationUm:2},
  {kind:'hole',designation:'Z0',minDiameterMm:18,maxDiameterMm:30,upperDeviationUm:0,lowerDeviationUm:0},
  {kind:'shaft',designation:'z0',minDiameterMm:18,maxDiameterMm:30,upperDeviationUm:0,lowerDeviationUm:0},
];
describe('ISO fit calculation with imported deviation data',()=>{
  it('calculates H7/g6 limits and clearance in mm',()=>{
    const f=calculateIsoFit(25,'H7','g6',rows);
    expect(f.maxHoleMm).toBeCloseTo(25.021,10); expect(f.minHoleMm).toBe(25);
    expect(f.maxShaftMm).toBeCloseTo(24.993,10); expect(f.minShaftMm).toBeCloseTo(24.98,10);
    expect(f.minClearanceMm).toBeCloseTo(.007,10); expect(f.maxClearanceMm).toBeCloseTo(.041,10);
    expect(f.classification).toBe('Clearance Fit');
  });
  it('distinguishes interference, transition, and line-to-line cases',()=>{
    expect(calculateIsoFit(25,'H7','p6',rows).classification).toBe('Interference Fit');
    expect(calculateIsoFit(25,'H7','k6',rows).classification).toBe('Transition Fit');
    expect(calculateIsoFit(25,'Z0','z0',rows).classification).toBe('Line-to-line Fit');
  });
  it('uses over-minimum, up-to-maximum diameter bands',()=>{
    expect(()=>calculateIsoFit(18,'H7','g6',rows)).toThrow(/No supported ISO data/);
    expect(calculateIsoFit(30,'H7','g6',rows).basicDiameterMm).toBe(30);
  });
  it('rejects invalid sizes, unsupported classes, missing data and overlapping bands',()=>{
    expect(()=>calculateIsoFit(0,'H7','g6',rows)).toThrow(/positive/);
    expect(()=>calculateIsoFit(25,'H8','g6',rows)).toThrow(/No supported/);
    expect(()=>calculateIsoFit(25,'H7','g6',[])).toThrow(/Load a verified/);
    expect(()=>calculateIsoFit(25,'H7','g6',[...rows,rows[0]])).toThrow(/Overlapping/);
  });
});

describe('ISO CSV data loading',()=>{
  const header='kind,designation,minDiameterMm,maxDiameterMm,upperDeviationUm,lowerDeviationUm';
  it('parses validated hole and shaft deviations',()=>{
    const parsed=parseToleranceCsv(`${header}\nhole,H7,18,30,21,0\nshaft,g6,18,30,-7,-20`);
    expect(parsed).toHaveLength(2); expect(parsed[0].upperDeviationUm).toBe(21);
  });
  it('rejects malformed headers, deviations and duplicate ranges',()=>{
    expect(()=>parseToleranceCsv('kind,class\nhole,H7')).toThrow(/header/);
    expect(()=>parseToleranceCsv(`${header}\nhole,H7,30,18,0,21`)).toThrow(/invalid/);
    expect(()=>parseToleranceCsv(`${header}\nhole,H7,18,30,21,0\nhole,H7,18,30,21,0`)).toThrow(/Duplicate/);
  });
});
