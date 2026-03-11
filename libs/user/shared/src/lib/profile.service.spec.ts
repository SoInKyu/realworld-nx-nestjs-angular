import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileService } from './profile.service';
import { IConfigurationService } from '@realworld/shared/configuration';

const API_URL = 'http://localhost:3333/api';

const mockConfigService = {
  configs$: of({ rest: { url: API_URL } })
};

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileService,
        { provide: IConfigurationService, useValue: mockConfigService },
      ],
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getProfile should GET profiles/:username', () => {
    const mockResponse = { data: { username: 'john', bio: 'Hi', image: null, following: false } };

    service.getProfile('john').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/profiles/john`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('followAUser should POST to profiles/:username/follow', () => {
    const mockResponse = { data: { username: 'john', following: true } };

    service.followAUser('john').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/profiles/john/follow`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mockResponse);
  });

  it('unfollowAUser should DELETE to profiles/:username/follow', () => {
    const mockResponse = { data: { username: 'john', following: false } };

    service.unfollowAUser('john').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/profiles/john/follow`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
