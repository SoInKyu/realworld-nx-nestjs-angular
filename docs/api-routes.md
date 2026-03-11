# API Routes

## 인증 방식

- JWT Bearer 토큰 (`Authorization: Bearer <token>`)
- 글로벌 가드 적용, `@SkipAuth()` 데코레이터로 공개 라우트 지정
- `req.user.sub`에 인증된 사용자 ID 포함

## Public Routes (@SkipAuth)

인증 없이 접근 가능한 엔드포인트입니다.

### User

| Method | Path               | 설명                                     |
| ------ | ------------------ | ---------------------------------------- |
| POST   | `/api/users/login` | 로그인 (email, password → JWT 토큰 반환) |
| POST   | `/api/users`       | 회원가입 (username, email, password)     |

### Profile

| Method | Path                      | 설명               |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/profiles/:username` | 사용자 프로필 조회 |

### Article

| Method | Path                           | 설명                                          |
| ------ | ------------------------------ | --------------------------------------------- |
| GET    | `/api/articles`                | 기사 목록 조회 (필터: tag, author, favorited) |
| GET    | `/api/articles/:slug`          | 기사 상세 조회                                |
| GET    | `/api/articles/:slug/comments` | 댓글 목록 조회                                |

### Tag

| Method | Path        | 설명           |
| ------ | ----------- | -------------- |
| GET    | `/api/tags` | 태그 목록 조회 |

## Protected Routes

인증이 필요한 엔드포인트입니다.

### User

| Method | Path         | 설명                  |
| ------ | ------------ | --------------------- |
| GET    | `/api/user`  | 현재 사용자 정보 조회 |
| PUT    | `/api/users` | 사용자 정보 수정      |

### Article

| Method | Path                  | 설명                      |
| ------ | --------------------- | ------------------------- |
| POST   | `/api/articles`       | 기사 작성                 |
| PUT    | `/api/articles/:slug` | 기사 수정                 |
| DELETE | `/api/articles/:slug` | 기사 삭제 (본인만 가능)   |
| GET    | `/api/articles/feed`  | 팔로잉 사용자의 기사 피드 |

### Favorite

| Method | Path                           | 설명                 |
| ------ | ------------------------------ | -------------------- |
| POST   | `/api/articles/:slug/favorite` | 즐겨찾기 추가 (멱등) |
| DELETE | `/api/articles/:slug/favorite` | 즐겨찾기 해제        |

### Comment

| Method | Path                               | 설명                    |
| ------ | ---------------------------------- | ----------------------- |
| POST   | `/api/articles/:slug/comments`     | 댓글 작성               |
| DELETE | `/api/articles/:slug/comments/:id` | 댓글 삭제 (본인만 가능) |

### Follow

| Method | Path                             | 설명            |
| ------ | -------------------------------- | --------------- |
| POST   | `/api/profiles/:username/follow` | 사용자 팔로우   |
| DELETE | `/api/profiles/:username/follow` | 사용자 언팔로우 |

## 응답 형식

### 성공 응답 래퍼

```typescript
// 생성/수정/삭제
ActionSuccessResponse<T> { data: T }

// 단일 조회
DetailSuccessResponse<T> { data: T }

// 목록 조회
ListSuccessResponse<T> { data: T[], total: number }
```

### 에러 응답

NestJS 내장 예외를 사용합니다:

| HTTP 코드 | 예외                    | 사용 사례                      |
| --------- | ----------------------- | ------------------------------ |
| 400       | `BadRequestException`   | 중복 회원가입, 잘못된 비밀번호 |
| 401       | `UnauthorizedException` | 타인의 기사/댓글 삭제 시도     |
| 404       | `NotFoundException`     | 미존재 사용자/기사/댓글 조회   |
