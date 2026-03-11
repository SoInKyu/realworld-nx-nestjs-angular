import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IConfigurationService } from '@realworld/shared/configuration';
import { AuthUIService, IUserService } from '@realworld/user/shared';
import { LoginComponent } from './login.component';

const mockConfigService = { configs$: { subscribe: jest.fn() } };
const mockUserService = { login: jest.fn(), register: jest.fn() };
const mockAuthUIService = { login: jest.fn() };

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [LoginComponent],
      providers: [
        { provide: IConfigurationService, useValue: mockConfigService },
        { provide: IUserService, useValue: mockUserService },
        { provide: AuthUIService, useValue: mockAuthUIService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have email and password form controls', () => {
    expect(component.form.contains('email')).toBeTruthy();
    expect(component.form.contains('password')).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });
});
