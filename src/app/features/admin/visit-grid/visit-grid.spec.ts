import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitGrid } from './visit-grid';

describe('VisitGrid', () => {
  let component: VisitGrid;
  let fixture: ComponentFixture<VisitGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
