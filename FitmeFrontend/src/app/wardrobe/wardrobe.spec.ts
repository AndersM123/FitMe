import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wardrobe } from './wardrobe';

describe('Wardrobe', () => {
  let component: Wardrobe;
  let fixture: ComponentFixture<Wardrobe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wardrobe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wardrobe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
