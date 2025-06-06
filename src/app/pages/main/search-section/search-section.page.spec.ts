import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchSectionPage } from './search-section.page';

describe('SearchSectionPage', () => {
  let component: SearchSectionPage;
  let fixture: ComponentFixture<SearchSectionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchSectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
