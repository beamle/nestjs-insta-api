# Insta API Backend

A NestJS-based REST API for the Instagram-like platform with user authentication, blog management, and content
moderation. Built with enterprise-grade architecture using CQRS pattern and domain-driven design.

## 🏗️ Project Architecture

This project follows **CQRS (Command Query Responsibility Segregation)** pattern with **Domain-Driven Design (DDD)**
principles using the official `@nestjs/cqrs` module.

```
Controller → CommandBus → CommandHandler → DomainEvent → EventBus → EventHandler
                              ↓
                        (Business Logic & Events)
```

### Directory Structure

```
src/
├── common/                    # Shared utilities and configurations
├── user-accounts/
│   ├── auth/
│   │   ├── application/
│   │   │   ├── commands/     # CQRS Commands (RegisterCommand, LoginCommand, etc.)
│   │   │   ├── handlers/     # Command Handlers implementing business logic
│   │   │   └── events/       # Domain Events (UserRegisteredEvent, etc.)
│   │   ├── controllers/      # HTTP endpoints
│   │   ├── guards/           # Auth guards (JWT, Basic Auth, Rate Limit)
│   │   ├── pipes/            # Validation pipes
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── email/            # Email service implementation
│   │   └── auth.module.ts    # Module configuration with CQRS wiring
│   └── users/
│       ├── users.repository.ts
│       ├── users.service.ts
│       └── users.module.ts
├── blogs/                     # Blog management module
├── posts/                     # Post management module
├── comments/                  # Comment management module
└── testing/                   # Testing utilities and data cleanup
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- MongoDB (local or cloud)
- SMTP server for email (Gmail or other provider)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# See Environment section below
```

### Environment Variables

```env
# Server
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/nest

# Authentication
JWT_SECRET=your-secret-key-here

# Email Confirmation Links
CONFIRMATION_LINK_BASE_URL=https://yourdomain.com/confirm-email
PASSWORD_RECOVERY_LINK_BASE_URL=https://yourdomain.com/password-recovery

# SMTP Configuration (for email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password  # Use Gmail App Password, not regular password
SMTP_FROM=your_email@gmail.com
SMTP_SECURE=false
```

**Gmail App Password Setup:**

1. Enable 2-Factor Authentication on your Google Account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select Mail and Windows Computer (or your device)
4. Copy the 16-character password
5. Paste it in `SMTP_PASSWORD`

## 🏃 Running the Application

```bash
# Development mode with file watching
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Watch TypeScript compilation only
pnpm run build:watch
```

## ✅ Testing

### E2E Tests

```bash
# Run all e2e tests (requires MongoDB running)
pnpm run test:e2e

# Run specific test suite
pnpm run test:e2e -- auth.e2e-spec.ts
pnpm run test:e2e -- users.e2e-spec.ts
pnpm run test:e2e -- blogs.e2e-spec.ts

# Run with coverage
pnpm run test:cov
```

### Test Data Cleanup

Delete all data and reset application state:

```bash
POST /testing/all-data
```

This endpoint clears:

- All users
- All blogs, posts, comments
- Rate limiter state
- Session data

## 🔐 Authentication

### Basic Auth (Admin Operations)

Protected endpoints like `POST /users`, `DELETE /users/{id}` require Basic Authentication with credentials:

- Username: `admin`
- Password: `qwerty`

**Base64 encoded:** `YWRtaW46cXdlcnR5`

```bash
curl -H "Authorization: Basic YWRtaW46cXdlcnR5" \
  -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"password123","email":"test@example.com"}'
```

### JWT Bearer Token (User Operations)

After login, use the JWT token:

```bash
curl -H "Authorization: Bearer <access_token>" \
  -X GET http://localhost:3000/blogs
```

## 📚 API Endpoints

### Authentication (`/auth`)

**User Registration**

```
POST /auth/registration
Content-Type: application/json

{
  "login": "mylogin",
  "password": "password123",
  "email": "user@example.com"
}
Response: 204 No Content
```

**Confirm Email**

```
POST /auth/registration-confirmation
Content-Type: application/json

{
  "code": "abc123xyz"
}
Response: 204 No Content
```

**Resend Confirmation Email**

```
POST /auth/registration-email-resending
Content-Type: application/json

{
  "email": "user@example.com"
}
Response: 204 No Content
```

**Login**

```
POST /auth/login
Content-Type: application/json

{
  "loginOrEmail": "mylogin",
  "password": "password123"
}
Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Password Recovery**

```
POST /auth/password-recovery
Content-Type: application/json

{
  "email": "user@example.com"
}
Response: 204 No Content
```

**Set New Password**

```
POST /auth/new-password
Content-Type: application/json

{
  "newPassword": "newpassword123",
  "recoveryCode": "abc123xyz"
}
Response: 204 No Content
```

### Users (`/users`)

**Create User (Admin)**

```
POST /users
Authorization: Basic YWRtaW46cXdlcnR5
Content-Type: application/json

{
  "login": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
Response: 201 Created
{
  "id": "507f1f77bcf86cd799439011",
  "login": "testuser",
  "email": "test@example.com",
  "createdAt": "2026-08-11T15:44:47.232Z"
}
```

**Delete User (Admin)**

```
DELETE /users/{id}
Authorization: Basic YWRtaW46cXdlcnR5
Response: 204 No Content
```

## 🏗️ CQRS Architecture

### Commands

Commands represent state-changing operations:

```typescript

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  async execute(command: RegisterCommand): Promise<void> {
    // Validate input
    // Create user
    // Generate confirmation code
    // Send email
    // Publish UserRegisteredEvent
  }
}
```

Command handlers are registered automatically via `@CommandHandler` decorator.

### Domain Events

Events represent things that happened in the system:

```typescript
export class UserRegisteredEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly confirmationCode: string,
  ) {
  }
}
```

### Event Handlers (Optional)

React to domain events for decoupled operations:

```typescript

@EventsHandler(UserRegisteredEvent)
export class SendConfirmationEmailHandler
  implements IEventHandler<UserRegisteredEvent> {
  async handle(event: UserRegisteredEvent) {
    // Send confirmation email
  }
}
```

Event handlers are optional - events can be published without handlers.

## 🔒 Security Features

- **Email Confirmation Flow**: Users must confirm email via code sent to their address
- **Password Hashing**: Passwords stored securely (implementation in users service)
- **JWT Tokens**: Access tokens with 5-minute expiration for secure API access
- **Rate Limiting**: Prevents brute force attacks on auth endpoints
- **Basic Auth**: Admin-only operations protected with credentials
- **CORS**: Configurable cross-origin access
- **Input Validation**: Comprehensive DTO validation with custom pipes

### Rate Limiting

Auth endpoints (`/auth/*`) have rate limiting per IP address:

- Limited requests per time window
- Automatically resets state on `/testing/all-data`
- Helps prevent brute force attacks

## 📧 Email Service

Emails are sent via SMTP for:

- **Registration Confirmation**: Sends confirmation code to new users
- **Password Recovery**: Sends recovery code for password reset
- **Email Resending**: Resend confirmation email if not received

Emails include:

- Plain text URLs with codes
- HTML formatted messages
- Fallback links to frontend

## 🧪 Testing

### E2E Test Structure

```typescript
describe('Auth', () => {
  describe('POST /auth/registration', () => {
    it('should create new user and send confirmation email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'testuser',
          password: 'password123',
          email: 'test@example.com'
        })
        .expect(204);
    });
  });
});
```

### Running Specific Tests

```bash
# Run only auth tests
pnpm run test:e2e -- auth.e2e-spec.ts

# Run with debug logging
DEBUG=* pnpm run test:e2e

# Run with custom timeout
pnpm run test:e2e -- --testTimeout=60000
```

## 📋 Homework Compliance

This project implements **Homework 14: Bloggers Platform** with:

✅ **Users Module**

- User registration and confirmation
- Admin creation and deletion
- Email-based authentication
- Password recovery flow

✅ **Auth Module**

- JWT-based login
- Email confirmation codes
- Password reset functionality
- Rate limiting on auth endpoints

✅ **Blogs Module**

- CRUD operations for blogs
- Blog ownership validation
- Post management within blogs

✅ **Posts Module**

- CRUD operations for posts
- Comment support
- Like/dislike functionality

✅ **Comments Module**

- Comment creation and deletion
- Nested replies (if implemented)

## 🛠️ Development Tools

### Database

MongoDB for persistent storage:
```bash
# Local MongoDB
brew install mongodb-community
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 mongo:latest
```

### Code Generation

Generate new modules:
```bash
pnpm run schematics:generate module --name=feature-name
pnpm run schematics:generate service --name=feature-name
```

### Linting and Formatting

```bash
# ESLint
pnpm run lint

# Format with Prettier
pnpm run format
```

## 📊 Project Statistics

- **Modules**: 6 (auth, users, blogs, posts, comments, testing)
- **Commands**: 6 (Register, ConfirmEmail, Login, PasswordRecovery, etc.)
- **Domain Events**: 6 (UserRegistered, EmailConfirmed, etc.)
- **E2E Tests**: 40+ test cases
- **API Endpoints**: 20+
- **Guards**: 3 (JWT, BasicAuth, RateLimit)
- **Pipes**: 6 (validation pipes)

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 📝 Contributing

1. **Code Style**: Follow NestJS conventions
2. **CQRS Pattern**: Commands for writes, services for reads
3. **Error Handling**: Use NestJS exceptions
4. **Testing**: Write e2e tests for new endpoints
5. **Documentation**: Update README for new features

## 🚨 Common Issues

### MongoDB Connection Error

```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Start MongoDB service:

```bash
brew services start mongodb-community
# or
docker run -d -p 27017:27017 mongo:latest
```

### Email Not Sending

```
535-5.7.8 Username and Password not accepted
```

**Solution**: Use Gmail App Password (16 characters), not regular password. Generate
at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Rate Limit Blocking Tests

```
429 Too Many Requests
```

**Solution**: Call `/testing/all-data` to reset rate limiter state between tests.

### JWT Token Expired

```
401 Unauthorized
```

**Solution**: Tokens expire after 5 minutes. Login again to get new token.

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [CQRS Module](https://docs.nestjs.com/recipes/cqrs)
- [MongoDB with NestJS](https://docs.nestjs.com/techniques/mongodb)
- [JWT Authentication](https://docs.nestjs.com/security/authentication)
- [Email Sending](https://docs.nestjs.com/techniques/mailing)

## 📄 License

MIT License - feel free to use this project as a template or reference.

## 👤 Author

Built with ❤️ using NestJS framework

---

**Last Updated**: August 11, 2026 **Current Version**: 1.0.0
