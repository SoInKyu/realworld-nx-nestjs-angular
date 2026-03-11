import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CommentService } from './comment.service';
import { IConfigurationService } from '@realworld/shared/configuration';

const API_URL = 'http://localhost:3333/api';

const mockConfigService = {
  configs$: of({ rest: { url: API_URL } })
};

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CommentService,
        { provide: IConfigurationService, useValue: mockConfigService },
      ],
    });

    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAllComments should GET articles/:slug/comments', () => {
    const mockResponse = { listData: [{ id: '1', body: 'Great article!' }], total: 1 };

    service.getAllComments('test-article').subscribe(res => {
      expect(res.data).toEqual(mockResponse.listData);
      expect(res.total).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url === `${API_URL}/articles/test-article/comments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('postComment should POST to articles/:slug/comments', () => {
    const commentData = { comment: { body: 'Nice post!' } };
    const mockResponse = { data: { id: '2', body: 'Nice post!' } };

    service.postComment('test-article', commentData as any).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/articles/test-article/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(commentData);
    req.flush(mockResponse);
  });

  it('deleteComments should DELETE articles/:slug/comments/:id', () => {
    const mockResponse = { data: null };

    service.deleteComments('test-article', 'comment-1').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/articles/test-article/comments/comment-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
