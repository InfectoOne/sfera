import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerChipComponent } from './peer-chip.component';

describe('PeerChipComponent', () => {
  let component: PeerChipComponent;
  let fixture: ComponentFixture<PeerChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeerChipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
