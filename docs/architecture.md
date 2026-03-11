# Architecture Guide

## Project Overview

RealWorld (Conduit) — Medium.com 클론 애플리케이션. NX v11.5 모노레포 기반, NestJS v7 (백엔드) + Angular v11 (프론트엔드).

## Domain Structure

```
libs/
  user/                          # 사용자 도메인
    api/shared/                  #   엔티티 + 서비스 (UserService, FollowService)
    api/handlers/                #   컨트롤러 (UserApiHandlersController)
    api-interfaces/              #   DTO (LoginDto, RegisterDto 등)
    feature/                     #   Angular 피처 모듈
    shared/                      #   프론트엔드 서비스

  article/                       # 게시글 도메인
    api/shared/                  #   엔티티 + 서비스 (ArticleService, CommentService 등)
    api/handlers/                #   컨트롤러 (ArticleApiHandlersController)
    api-interfaces/              #   DTO (CreateArticleDto 등)
    feature/                     #   Angular 피처 모듈
    shared/                      #   프론트엔드 서비스

  shared/                        # 공통 유틸리티
    api/foundation/              #   BaseService<T>, BaseEntity
    client-server/               #   응답 래퍼 (ActionSuccessResponse 등)
```

## Fat Controller / Thin Service Pattern

이 프로젝트의 핵심 아키텍처 패턴입니다.

### Service 계층 (Thin)

- 모든 서비스는 `BaseService<T>`를 상속하며, 대부분 **생성자만 있는 빈 래퍼**입니다.
- `BaseService<T>`가 제공하는 제네릭 CRUD 메서드: `findAll`, `findOne`, `insert`, `update`, `softDelete`, `count`
- **예외:** `UserService`만 실제 비즈니스 로직 보유 (login, register, JWT, 비밀번호 해싱)

### Controller 계층 (Fat)

- **비즈니스 로직이 컨트롤러에 위치**: 인가 검사, 쿼리 구성, 응답 매핑, 태그 업서트, 즐겨찾기 토글
- `ArticleApiHandlersController`가 대표적 (286줄)

### 테스트 전략

| 대상           | 테스트 방법        | 이유                                     |
| -------------- | ------------------ | ---------------------------------------- |
| `UserService`  | 서비스 직접 테스트 | 비즈니스 로직이 서비스에 존재            |
| Article 도메인 | 컨트롤러 테스트    | 서비스가 빈 래퍼, 로직이 컨트롤러에 존재 |

## 엔티티 모델

### BaseEntity (공통)

| 필드        | 타입     | 설명                           |
| ----------- | -------- | ------------------------------ |
| id          | UUID     | 기본키 (자동 생성)             |
| createdAt   | datetime | 생성 시각                      |
| updatedAt   | datetime | 수정 시각                      |
| deletedDate | datetime | 소프트 삭제 시각 (null = 활성) |

### User 도메인

**User**: `email`, `username`, `password`, `bio`, `image`
**Follow**: `followerId`, `followedId`

### Article 도메인

**Article**: `slug` (unique), `title`, `description`, `body`, `authorId`, `tagList`
**Comment**: `articleSlug`, `authorId`, `body`
**Favorite**: `userId`, `articleSlug`
**Tag**: `name` (unique), `count`

## 응답 래퍼

모든 API 응답은 `@realworld/shared/client-server`의 래퍼를 사용합니다:

- `ActionSuccessResponse<T>` — 생성/수정/삭제
- `DetailSuccessResponse<T>` — 단일 조회
- `ListSuccessResponse<T>` — 목록 조회 (+ total)

## 인증

- JWT via `@nestjs/passport` (글로벌 가드)
- `@SkipAuth()` 데코레이터로 공개 라우트 지정
- `req.user.sub`에 인증된 사용자 ID 포함

## 데이터베이스

- MySQL + TypeORM v0.2.31
- 마이그레이션: `/migrations/` 디렉토리, `npm run migration:run`
- 소프트 삭제 패턴 (하드 삭제 없음)
- UUID 기본키

<!-- CI bypass test -->
