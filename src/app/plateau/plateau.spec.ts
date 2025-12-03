import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plateau } from './plateau';

describe('Plateau', () => {
  let component: Plateau;
  let fixture: ComponentFixture<Plateau>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plateau]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plateau);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
