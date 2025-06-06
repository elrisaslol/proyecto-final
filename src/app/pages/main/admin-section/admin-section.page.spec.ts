import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSectionPage } from './admin-section.page';

describe('AdminSectionPage', () => {
  let component: AdminSectionPage;
  let fixture: ComponentFixture<AdminSectionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
