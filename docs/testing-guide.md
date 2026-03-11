# Testing Guide

## 개요

이 프로젝트는 두 가지 테스트 패턴을 사용합니다. "Fat Controller / Thin Service" 아키텍처에 따라 비즈니스 로직이 있는 계층을 테스트합니다.

## 테스트 실행

```bash
# 단일 프로젝트 테스트
npx nx test user-api-shared
npx nx test article-api-handlers

# 변경된 프로젝트만 테스트
npx nx affected:test

# 커버리지 포함
npx nx test user-api-shared --coverage
npx nx test article-api-handlers --coverage
```

## 커버리지 임계치

두 프로젝트 모두 **50%** 임계치가 설정되어 있습니다:

| 항목       | 임계치 |
| ---------- | ------ |
| Branches   | 50%    |
| Lines      | 50%    |
| Functions  | 50%    |
| Statements | 50%    |

설정 파일: 각 프로젝트의 `jest.config.js`

## Node 23 호환성

`@nestjs/typeorm@7`은 Node 23에서 제거된 `util.isNullOrUndefined`를 사용합니다. **모든 테스트 파일 상단**(import 전)에 다음 mock을 추가해야 합니다:

```typescript
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  TypeOrmModule: { forFeature: () => ({ module: class {} }) },
}));
```

## 패턴 1: Service 테스트 (UserService)

`UserService`는 실제 비즈니스 로직이 있는 유일한 서비스입니다.

### Mock 구성

```typescript
const mockRepository = {
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  decode: jest.fn().mockReturnValue({ sub: 'user-id' }),
};

const mockFollowService = {
  findOne: jest.fn(),
};

const service = new UserService(
  mockRepository as any,
  mockJwtService as any,
  mockFollowService as any
);
```

### 테스트 케이스 (15개)

| 카테고리       | 시나리오           | 검증 내용                              |
| -------------- | ------------------ | -------------------------------------- |
| login          | 성공               | JWT 토큰 포함 사용자 반환              |
| login          | 미존재 이메일      | `NotFoundException` 발생               |
| login          | 잘못된 비밀번호    | `BadRequestException` 발생             |
| register       | 성공               | 비밀번호 해싱, null password, JWT 토큰 |
| register       | 중복 자격증명      | `BadRequestException` 발생             |
| updateUserInfo | 비밀번호 변경 포함 | 새 비밀번호 해싱                       |
| updateUserInfo | 비밀번호 변경 없이 | 해싱 함수 미호출                       |
| updateUserInfo | 미존재 사용자      | `BadRequestException` 발생             |
| getProfile     | 팔로잉 중          | `following: true`                      |
| getProfile     | 팔로잉 안 함       | `following: false`                     |
| getProfile     | 미인증 사용자      | `following: false`                     |
| getJwtInfo     | 유효한 헤더        | JWT 디코드 결과 반환                   |
| getJwtInfo     | 헤더 없음          | `null` 반환                            |
| getJwtInfo     | 잘못된 형식        | `null` 반환                            |
| getJwtInfo     | headers 객체 없음  | `null` 반환                            |

## 패턴 2: Controller 테스트 (ArticleApiHandlersController)

Article 도메인은 서비스가 빈 래퍼이므로 **컨트롤러를 직접 테스트**합니다.

### Mock 구성

```typescript
const mockArticleService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  count: jest.fn(),
};

const mockCommentService = {
  /* 동일 패턴 */
};
const mockFavoriteService = {
  /* 동일 패턴 */
};
const mockTagService = {
  /* 동일 패턴 */
};
const mockUserService = { getJwtInfo: jest.fn() };

const controller = new ArticleApiHandlersController(
  mockArticleService as any,
  mockCommentService as any,
  mockFavoriteService as any,
  mockTagService as any,
  mockUserService as any
);

// 요청 mock
const mockReq = {
  user: { sub: 'user-id' },
  headers: { authorization: 'Bearer mock-token' },
};
```

### 테스트 케이스 (16개)

| 카테고리      | 시나리오        | 검증 내용                    |
| ------------- | --------------- | ---------------------------- |
| create        | 기본 생성       | slug에 제목 포함, 응답 반환  |
| create        | tagList 제공    | 태그 업서트 처리             |
| update        | 기사 수정       | 업데이트 후 응답 반환        |
| delete        | 본인 기사 삭제  | 소프트 삭제 성공             |
| delete        | 타인 기사 삭제  | `UnauthorizedException` 발생 |
| delete        | 미존재 기사     | `NotFoundException` 발생     |
| findBySlug    | 존재하는 기사   | 기사 상세 반환               |
| findBySlug    | 미존재 기사     | `NotFoundException` 발생     |
| favorite      | 새로 즐겨찾기   | favorite 레코드 삽입         |
| favorite      | 이미 즐겨찾기됨 | 중복 삽입 안 함 (멱등성)     |
| unfavorite    | 즐겨찾기 해제   | 소프트 삭제                  |
| createComment | 댓글 작성       | 댓글 삽입 후 응답 반환       |
| deleteComment | 본인 댓글 삭제  | 소프트 삭제 성공             |
| deleteComment | 타인 댓글 삭제  | `UnauthorizedException` 발생 |
| deleteComment | 미존재 댓글     | `NotFoundException` 발생     |
| findAllTags   | 태그 목록 조회  | 태그 이름 문자열 배열 반환   |

## 새 테스트 추가 시 체크리스트

1. 파일 상단에 `@nestjs/typeorm` mock 추가 (import 전)
2. `TestingModule` 사용하지 않음 — 직접 인스턴스 생성
3. 비즈니스 로직이 있는 계층 테스트 (서비스 or 컨트롤러)
4. mock 객체는 `as any` 캐스팅으로 주입
