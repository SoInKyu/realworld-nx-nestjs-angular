import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IUserService } from '@realworld/user/shared';
import { IArticleService, ITagService } from '@realworld/article/shared';
import { HomeComponent } from './home.component';

const mockUserService = { isAuth: false };
const mockArticleService = { getAll: jest.fn(), getFeed: jest.fn(), favoriteArticle: jest.fn(), unfavoriteArticle: jest.fn() };
const mockTagService = { getAll: jest.fn() };

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: IUserService, useValue: mockUserService },
        { provide: IArticleService, useValue: mockArticleService },
        { provide: ITagService, useValue: mockTagService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
