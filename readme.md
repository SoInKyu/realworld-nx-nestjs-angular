# ![RealWorld Example App](logo.png)

> ### [Nx monorepo](https://nx.dev) with [Nestjs](https://nestjs.com) and [Angular](https://angular.io) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

This codebase was created to demonstrate a fully fledged fullstack application built with **[Nx monorepo](https://nx.dev), [Nestjs](https://nestjs.com) and [Angular](https://angular.io)** including CRUD operations, authentication, routing, pagination, and more.

# Getting started

_Prerequisites: [Node.js](https://nodejs.org/) (v18+) and [MySQL](https://www.mysql.com/) installed and running._

**Clone this project**

`git clone https://github.com/nhaancs/fullstack-nx-nestjs-angular-realworld.git`

**Switch to the repo folder**

`cd fullstack-nx-nestjs-angular-realworld`

**Install dependencies**

`npm install`

**Update below configs in `ormconfig.js` file to your database configs**

`host`, `port`, `username`, `password`, `database`

**Run migrations**

`npm run migration:run`

**Start both server (api) and client (conduit) apps**

`npm run serve:api-conduit`

**Open your browser at [http://localhost:4200](http://localhost:4200)**

You can now register a new account to login and explore functionalities like create/update articles, update profile information, favorite articles, follow other users, etc.

You can also import dump data from `realworld-db-exported.sql`. Once imported, two pre-registered accounts are available:

- Email: user1@email.com / password: qwerty1
- Email: user2@email.com / password: qwerty1

# Development

## Common Commands

```bash
# Serve
npm run serve:api              # Backend API (port 3333)
npm run serve:conduit          # Frontend (port 4200)
npm run serve:api-conduit      # Both concurrently

# Test
npx nx test user-api-shared          # UserService unit tests
npx nx test article-api-handlers     # ArticleController unit tests
npx nx affected:test                 # Test only affected projects

# Lint & Format
npx nx affected:lint           # Lint affected projects
npm run format:check           # Check Prettier formatting

# Build
npm run build-prod:api         # Production API build
npm run build-prod:conduit     # Production frontend build

# Database
npm run migration:run          # Compile & run TypeORM migrations
```

## Testing

The project uses Jest for unit tests. Two test suites cover the backend business logic:

- **`user-api-shared`** (`libs/user/api/shared`) — tests `UserService` directly: login, register, JWT issuance, password hashing, profile follow/unfollow.
- **`article-api-handlers`** (`libs/article/api/handlers`) — tests `ArticleApiHandlersController`: article CRUD, comments, favorites, tags, feed, pagination.

Run all tests with `npx nx affected:test` or target a specific project with `npx nx test <project-name>`.

## CI Pipeline

GitHub Actions runs on every pull request to `master` (`.github/workflows/ci.yml`):

1. **Lint** — `npx nx affected:lint`
2. **Test** — `npx nx affected:test --coverage`
3. **Build** — `npx nx affected:build`

Only projects affected by the PR diff are checked, using NX's `affected` commands with `--base=origin/master`. CI is skipped for changes to `*.md`, `docs/`, `.claude/`, `.agent/`, `.omc/`, `openspec/`, and `LICENSE`.

# Functionality overview

The example application is a social blogging site (i.e. a Medium.com clone) called "Conduit". It uses a custom API for all requests, including authentication.

**General functionality:**

- Authenticate users via JWT (login/signup pages + logout button on settings page)
- CRU\* users (sign up & settings page - no deleting required)
- CRUD Articles
- CR\*D Comments on articles (no updating required)
- GET and display paginated lists of articles
- Favorite articles
- Follow other users

**The general page breakdown looks like this:**

- Home page (URL: /#/ )
  - List of tags
  - List of articles pulled from either Feed, Global, or by Tag
  - Pagination for list of articles
- Sign in/Sign up pages (URL: /#/login, /#/register )
  - Uses JWT (store the token in localStorage)
  - Authentication can be easily switched to session/cookie based
- Settings page (URL: /#/settings )
- Editor page to create/edit articles (URL: /#/editor, /#/editor/article-slug-here )
- Article page (URL: /#/article/article-slug-here )
  - Delete article button (only shown to article's author)
  - Render markdown from server client side
  - Comments section at bottom of page
  - Delete comment button (only shown to comment's author)
- Profile page (URL: /#/@:username, /#/@:username/favorites )
  - Show basic user info
  - List of articles populated from author's created articles or author's favorited articles

# Project structure

**Application**

- Located in `apps` folder.
- An app produces a binary. It contains the minimal amount of code required to package many libs to create an artifact that is deployed.
- The app defines how to build the artifacts that are shipped to the user. If we have two separate targets (say desktop and mobile), we might have two separate apps.

**Library**

- Located in `libs` folder.
- A lib is a set of files packaged together that is consumed by apps.
- The purpose of having libs is to partition your code into smaller units that are easier to maintain and promote code reuse.

**Library scopes**

- Libs grouped into 2 scopes: `domain` and `shared`
  - Libs have `domain` scope are grouped into one `domain` folder. For example: libs are related to `article` and `user` domain are grouped into `article` and `user` folders.
  - Libs have `shared` scope are created for reusable purpose. They are grouped into `shared` folder. For example: `configuration`, `error-handler`, `logging`,...

**Library types**

- Type relates to the contents of the library and indicates its purpose and usage.
- Libs groups into 2 types:
  - `feature`: contains mostly smart components, lazy loading modules, or api controllers.
  - `lib`: Libs have type `lib` can be reused in other places.

**Lib tags**

- Every lib must have at least 2 tags: `scope` and `type`
- For example: Lib `libs/shared/configutaion` has tag `scope:shared,type:lib`, lib `libs/article/feature` has tag `scope:domain,type:feature`, lib `libs/article/shared` has tag `scope:domain,type:lib`.

**Workspace structure**

```
apps
|____api
|____conduit
|____conduit-2e2
libs
|____article
|    |____api
|    |    |____handlers
|    |    |____shared
|    |____api-interfaces
|    |____feature
|    |____shared
|
|____user
|    |____api
|    |    |____handlers
|    |    |____shared
|    |____api-interfaces
|    |____feature
|    |____shared
|      
|____shared
     |____api
     |    |____config
     |    |____constants
     |    |____core
     |    |____error-handler
     |    |____foundation
     |    |____validations
     |____client-server
     |____common
     |____configuration
     |____constants
     |____core
     |____directives
     |____error-handler
     |____foundation
     |____interceptors
     |____loading
     |____logging
     |____notification
     |____spinner
     |____storage
     |____string-util
     |____toaster
```
