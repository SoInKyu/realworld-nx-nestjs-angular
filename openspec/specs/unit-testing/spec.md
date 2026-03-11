# unit-testing Specification

## Purpose
TBD - created by archiving change vibe-coding-workshop-setup. Update Purpose after archive.
## Requirements
### Requirement: UserService has comprehensive unit tests
The `libs/user/api/shared` project SHALL have unit tests for `UserService` covering all public methods.

#### Scenario: Login success
- **WHEN** a valid email and correct password are provided
- **THEN** the service SHALL return a user object with a JWT token

#### Scenario: Login with non-existent email
- **WHEN** an email that does not exist in the database is provided
- **THEN** the service SHALL throw a `NotFoundException`

#### Scenario: Login with wrong password
- **WHEN** a valid email but incorrect password is provided
- **THEN** the service SHALL throw a `BadRequestException`

#### Scenario: Register success
- **WHEN** a new unique username and email are provided
- **THEN** the service SHALL hash the password, insert the user, and return a user object with null password and a JWT token

#### Scenario: Register with duplicate credentials
- **WHEN** an email or username that already exists is provided
- **THEN** the service SHALL throw a `BadRequestException`

#### Scenario: Update user with password change
- **WHEN** an update includes a new password
- **THEN** the service SHALL hash the new password before updating

#### Scenario: Update user without password change
- **WHEN** an update does not include a password
- **THEN** the service SHALL not call the hash function

#### Scenario: Get profile with following relationship
- **WHEN** the requesting user follows the target user
- **THEN** the profile SHALL have `following: true`

#### Scenario: Get JWT info from valid header
- **WHEN** a request has a valid `Authorization: Bearer <token>` header
- **THEN** `getJwtInfo` SHALL return the decoded JWT payload

#### Scenario: Get JWT info from missing header
- **WHEN** a request has no Authorization header
- **THEN** `getJwtInfo` SHALL return null

### Requirement: ArticleApiHandlersController has comprehensive unit tests
The `libs/article/api/handlers` project SHALL have unit tests for `ArticleApiHandlersController` covering CRUD operations, authorization, favorites, comments, and tags.

#### Scenario: Create article
- **WHEN** a valid article body is submitted with authentication
- **THEN** the controller SHALL create an article with a generated slug containing the title and a timestamp

#### Scenario: Delete own article
- **WHEN** the authenticated user is the article author
- **THEN** the controller SHALL soft-delete the article

#### Scenario: Delete another user's article
- **WHEN** the authenticated user is NOT the article author
- **THEN** the controller SHALL throw `UnauthorizedException`

#### Scenario: Favorite idempotency
- **WHEN** a user favorites an article they have already favorited
- **THEN** the controller SHALL NOT insert a duplicate favorite record

#### Scenario: Delete own comment
- **WHEN** the authenticated user is the comment author
- **THEN** the controller SHALL soft-delete the comment

#### Scenario: Delete another user's comment
- **WHEN** the authenticated user is NOT the comment author
- **THEN** the controller SHALL throw `UnauthorizedException`

#### Scenario: List tags
- **WHEN** tags are requested
- **THEN** the controller SHALL return a list of tag name strings

### Requirement: Coverage thresholds are set per project
Projects with unit tests SHALL have Jest coverage thresholds configured.

#### Scenario: Coverage threshold for user-api-shared
- **WHEN** tests are run with `--coverage` for `user-api-shared`
- **THEN** the build SHALL fail if branches, lines, functions, or statements fall below 50%

#### Scenario: Coverage threshold for article-api-handlers
- **WHEN** tests are run with `--coverage` for `article-api-handlers`
- **THEN** the build SHALL fail if branches, lines, functions, or statements fall below 50%

