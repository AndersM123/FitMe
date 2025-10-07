import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mannequin } from './mannequin';

describe('Mannequin', () => {
  let component: Mannequin;
  let fixture: ComponentFixture<Mannequin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mannequin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mannequin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
