import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { IConfigurationService } from '@realworld/shared/configuration';
import { UserStorageUtil } from '@realworld/shared/storage';

const API_URL = 'http://localhost:3333/api';

const mockConfigService = {
  configs$: of({ rest: { url: API_URL } })
};

const mockUserStorageUtil = {
  userInfo: null as any,
  setUserData: jest.fn(),
  clearUserData: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserStorageUtil.userInfo = null;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: IConfigurationService, useValue: mockConfigService },
        { provide: UserStorageUtil, useValue: mockUserStorageUtil },
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with unauthenticated state when no stored user', () => {
    expect(service.isAuth).toBe(false);
    expect(service.userInfo).toBeNull();
  });

  describe('updateAuthState', () => {
    it('should set isAuth to true and store userInfo when user is provided', () => {
      const user = { id: '1', username: 'test', email: 'test@test.com', token: 'tok' } as any;
      service.updateAuthState(user);
      expect(service.isAuth).toBe(true);
      expect(service.userInfo).toEqual(user);
    });

    it('should set isAuth to false and clear userInfo when null is provided', () => {
      service.updateAuthState({ id: '1' } as any);
      service.updateAuthState(null);
      expect(service.isAuth).toBe(false);
      expect(service.userInfo).toBeNull();
    });
  });

  describe('login', () => {
    it('should POST to users/login and update auth state on success', () => {
      const loginBody = { user: { email: 'test@test.com', password: 'pass' } };
      const mockResponse = { data: { id: '1', username: 'test', email: 'test@test.com', token: 'jwt-token' } };

      service.login(loginBody as any).subscribe(res => {
        expect(res).toEqual(mockResponse);
        expect(service.isAuth).toBe(true);
        expect(service.userInfo).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${API_URL}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginBody);
      req.flush(mockResponse);

      expect(mockUserStorageUtil.setUserData).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('register', () => {
    it('should POST to users and update auth state on success', () => {
      const registerData = { user: { username: 'newuser', email: 'new@test.com', password: 'pass' } };
      const mockResponse = { data: { id: '2', username: 'newuser', email: 'new@test.com', token: 'jwt-token-2' } };

      service.register(registerData as any).subscribe(res => {
        expect(res).toEqual(mockResponse);
        expect(service.isAuth).toBe(true);
        expect(service.userInfo).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${API_URL}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockResponse);

      expect(mockUserStorageUtil.setUserData).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear user data and set unauthenticated state', () => {
      service.updateAuthState({ id: '1', username: 'test' } as any);
      expect(service.isAuth).toBe(true);

      service.logout();

      expect(mockUserStorageUtil.clearUserData).toHaveBeenCalled();
      expect(service.isAuth).toBe(false);
      expect(service.userInfo).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should GET from user endpoint', () => {
      const mockResponse = { data: { id: '1', username: 'test', email: 'test@test.com' } };

      service.getCurrentUser().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_URL}/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should PUT to users endpoint and update auth state on success', () => {
      const updateBody = { id: '1', username: 'updated', bio: 'new bio' };
      const mockResponse = { data: { id: '1', username: 'updated', email: 'test@test.com', bio: 'new bio', token: 'jwt' } };

      service.update('1', updateBody as any).subscribe(res => {
        expect(res).toEqual(mockResponse);
        expect(service.isAuth).toBe(true);
        expect(service.userInfo).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne(`${API_URL}/users`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateBody);
      req.flush(mockResponse);

      expect(mockUserStorageUtil.setUserData).toHaveBeenCalledWith(mockResponse);
    });
  });
});
