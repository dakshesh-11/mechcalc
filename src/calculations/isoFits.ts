import type { ISODeviationRow, ToleranceKind } from '../data/isoFits';

export interface ISOFitResult {
  basicDiameterMm:number; holeDesignation:string; shaftDesignation:string;
  maxHoleMm:number; minHoleMm:number; maxShaftMm:number; minShaftMm:number;
  maxClearanceMm:number; minClearanceMm:number;
  classification:'Clearance Fit'|'Interference Fit'|'Transition Fit'|'Line-to-line Fit';
  hole:{upperUm:number;lowerUm:number}; shaft:{upperUm:number;lowerUm:number};
}
function findDeviation(rows:ISODeviationRow[],kind:ToleranceKind,designation:string,size:number):ISODeviationRow {
  const found=rows.filter(row=>row.kind===kind&&row.designation===designation&&size>row.minDiameterMm&&size<=row.maxDiameterMm);
  if(found.length!==1) throw new Error(found.length===0?`No supported ISO data for ${kind} ${designation} at ${size} mm.`:`Overlapping ISO data ranges for ${kind} ${designation} at ${size} mm.`);
  return found[0];
}
export function calculateIsoFit(size:number,holeDesignation:string,shaftDesignation:string,rows:ISODeviationRow[]):ISOFitResult {
  if(!Number.isFinite(size)||size<=0) throw new Error('Basic diameter must be a positive finite value in millimetres.');
  if(!holeDesignation||!shaftDesignation)throw new Error('Enter both hole and shaft tolerance designations.');
  if(!rows.length)throw new Error('Load a verified ISO tolerance CSV before calculating.');
  const h=findDeviation(rows,'hole',holeDesignation,size),s=findDeviation(rows,'shaft',shaftDesignation,size);
  const minHoleMm=size+h.lowerDeviationUm/1000,maxHoleMm=size+h.upperDeviationUm/1000;
  const minShaftMm=size+s.lowerDeviationUm/1000,maxShaftMm=size+s.upperDeviationUm/1000;
  const minClearanceMm=minHoleMm-maxShaftMm,maxClearanceMm=maxHoleMm-minShaftMm;
  const classification=minClearanceMm>0?'Clearance Fit':maxClearanceMm<0?'Interference Fit':minClearanceMm===0&&maxClearanceMm===0?'Line-to-line Fit':'Transition Fit';
  return {basicDiameterMm:size,holeDesignation,shaftDesignation,maxHoleMm,minHoleMm,maxShaftMm,minShaftMm,maxClearanceMm,minClearanceMm,classification,hole:{upperUm:h.upperDeviationUm,lowerUm:h.lowerDeviationUm},shaft:{upperUm:s.upperDeviationUm,lowerUm:s.lowerDeviationUm}};
}
