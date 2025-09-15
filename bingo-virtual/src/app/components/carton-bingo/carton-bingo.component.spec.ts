import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartonBingoComponent } from './carton-bingo.component';

describe('CartonBingoComponent', () => {
  let component: CartonBingoComponent;
  let fixture: ComponentFixture<CartonBingoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartonBingoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartonBingoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
