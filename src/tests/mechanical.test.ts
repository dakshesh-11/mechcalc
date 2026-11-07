import { describe, expect, it } from 'vitest';
import { calculateBend, calculateTaper, calculateTorque } from '../calculations/mechanical';

describe('taper pin calculation',()=>{
  it('computes small end and verifies the user supplied ratio',()=>{
    expect(calculateTaper(10,50,50)).toMatchObject({small:9,difference:1,actual:50,verified:true});
  });
  it('rejects non-positive and impossible geometry',()=>{
    expect(()=>calculateTaper(10,0,50)).toThrow(/positive/);
    expect(()=>calculateTaper(1,50,50)).toThrow(/small-end/);
    expect(()=>calculateTaper(Number.NaN,1,50)).toThrow(/positive/);
  });
});

describe('bolt torque calculation',()=>{
  it('uses T = KFd and converts mm to metres',()=>{
    expect(calculateTorque(10,12000,.2).torque).toBeCloseTo(24,12);
  });
  it('converts inch diameter and kN force to N·m',()=>{
    expect(calculateTorque(10/25.4,12,.2,'in','kN').torque).toBeCloseTo(24,12);
  });
  it('converts lbf to N',()=>{
    const r=calculateTorque(1,1,.2,'in','lbf');
    expect(r.preloadN).toBeCloseTo(4.4482216152605,12);
    expect(r.torque).toBeCloseTo(.2*4.4482216152605*.0254,12);
  });
  it('rejects zero, negative, non-finite, and unsupported inputs',()=>{
    expect(()=>calculateTorque(0,1,.2)).toThrow();
    expect(()=>calculateTorque(1,-1,.2)).toThrow();
    expect(()=>calculateTorque(Infinity,1,.2)).toThrow();
    expect(()=>calculateTorque(1,1,.2,'cm' as never,'N')).toThrow(/unit/);
  });
});

describe('sheet metal bend calculation',()=>{
  it('converts degrees to radians and calculates allowance/deduction',()=>{
    const r=calculateBend(2,2,90,.33);
    expect(r.theta).toBeCloseTo(Math.PI/2,12);
    expect(r.ba).toBeCloseTo(Math.PI/2*(2+.33*2),12);
    expect(r.bd).toBeCloseTo(8-r.ba,12);
  });
  it('calculates outside-flange flat length',()=>{
    const r=calculateBend(2,2,90,.33,10,10);
    expect(r.flat).toBeCloseTo(20-r.bd,12);
  });
  it('rejects invalid angle, dimensions, K-factor and incomplete flange pair',()=>{
    expect(()=>calculateBend(2,2,180,.33)).toThrow(/angle/);
    expect(()=>calculateBend(2,2,90,1.1)).toThrow(/K-factor/);
    expect(()=>calculateBend(2,0,90,.33)).toThrow(/greater than zero/);
    expect(()=>calculateBend(2,2,90,.33,10)).toThrow(/both flange/);
    expect(()=>calculateBend(2,2,90,.33,1,1)).toThrow(/non-positive/);
  });
});
