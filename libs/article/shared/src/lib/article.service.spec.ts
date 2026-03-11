import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ArticleService } from './article.service';
import { IConfigurationService } from '@realworld/shared/configuration';

const API_URL = 'http://localhost:3333/api';

const mockConfigService = {
  configs$: of({ rest: { url: API_URL } })
};

describe('ArticleService', () => {
  let service: ArticleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ArticleService,
        { provide: IConfigurationService, useValue: mockConfigService },
      ],
    });

    service = TestBed.inject(ArticleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('favoriteArticle should POST to articles/:slug/favorite', () => {
    const mockResponse = { data: { slug: 'test-article', favorited: true, favoritesCount: 1 } };

    service.favoriteArticle('test-article').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/articles/test-article/favorite`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mockResponse);
  });

  it('unfavoriteArticle should DELETE to articles/:slug/favorite', () => {
    const mockResponse = { data: { slug: 'test-article', favorited: false, favoritesCount: 0 } };

    service.unfavoriteArticle('test-article').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/articles/test-article/favorite`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
