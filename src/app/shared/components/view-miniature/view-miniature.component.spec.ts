import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewMiniatureComponent } from './view-miniature.component';

describe('ViewMiniatureComponent', () => {
  let component: ViewMiniatureComponent;
  let fixture: ComponentFixture<ViewMiniatureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ViewMiniatureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewMiniatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
