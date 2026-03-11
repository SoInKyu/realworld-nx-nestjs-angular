import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IConfigurationService } from '@realworld/shared/configuration';
import { IUserService } from '@realworld/user/shared';
import { RegisterComponent } from './register.component';

const mockConfigService = { configs$: { subscribe: jest.fn() } };
const mockUserService = { login: jest.fn(), register: jest.fn() };

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: IConfigurationService, useValue: mockConfigService },
        { provide: IUserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have username, email, and password form controls', () => {
    expect(component.form.contains('username')).toBeTruthy();
    expect(component.form.contains('email')).toBeTruthy();
    expect(component.form.contains('password')).toBeTruthy();
  });
});
