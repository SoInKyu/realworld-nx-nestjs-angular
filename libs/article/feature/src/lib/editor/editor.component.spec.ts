import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IConfigurationService } from '@realworld/shared/configuration';
import { IUserService } from '@realworld/user/shared';
import { IArticleService } from '@realworld/article/shared';
import { EditorComponent } from './editor.component';

const mockConfigService = { configs$: { subscribe: jest.fn() } };
const mockUserService = { isAuth: false };
const mockArticleService = { getOne: jest.fn(), create: jest.fn(), update: jest.fn() };

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [EditorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: IConfigurationService, useValue: mockConfigService },
        { provide: IUserService, useValue: mockUserService },
        { provide: IArticleService, useValue: mockArticleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form controls for article fields', () => {
    expect(component.form.contains('title')).toBeTruthy();
    expect(component.form.contains('description')).toBeTruthy();
    expect(component.form.contains('body')).toBeTruthy();
  });
});
