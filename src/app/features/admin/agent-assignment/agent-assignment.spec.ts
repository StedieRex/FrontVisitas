import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentAssignment } from './agent-assignment';

describe('AgentAssignment', () => {
  let component: AgentAssignment;
  let fixture: ComponentFixture<AgentAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentAssignment],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
