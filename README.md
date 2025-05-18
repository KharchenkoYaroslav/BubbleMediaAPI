# BubbleMediaAPI

<img src="https://drive.google.com/uc?export=view&id=196kdd6BqxLvwM2F6Otda48qZsxRqyNdc" width="50" >

✨ Вітаю у репозиторії API проекту фото/відео/аудіо хостингу ✨.

[Натисніть щоб переглянути репозиторій сайту перейдіть по посиланню](https://temp)

## Короткий опис

Цей API побудований на базі мікросервісної архітектури, сервіси побудовані на базі фреймворку `NestJS`

## Сервіси

### Gateway

Шлюз доступу до API який спілкується з клієнтом

### AuthService

Сервіс відповідає за авторизацію та автентифікацію користувачів, використовуючи JWT-токени.

### GoogleDriveService 

Сервіс відповідає за зберігання/зміну/видалення відео, аудіо та фото на Google Drive та повернення посилань на відповідні файли

### ProfileService

Сервіс відповідає за профіль користувача його підписки, та кількість підписників.

### ContentService

Сервіс відповідає за створення та зберігання контенту

### MetricsService

Сервіс відповідає за обробку лайків та пов'язоної з ними інформації

### CommentService 

Сервіс відповідає за коментарі під публікаціями

### ContentFeedService

Сервіс відповідає за надання користувачу вподобаних публікацій публікацій, рекомендацій, підписок, популярних та пошук за тегами та автором у відповідних розділах.

## Зв'язки

### GraphQL та GraphQL WS

Використовуються для зв'язку з клієнтом.

### gRPC

Використовується як основний спосіб зв'язку між мікросервісами.

### RabbitMQ

Використовується для асинхронних операцій, а саме додовання та видалення акаунтів користувачів.

## Схема GraphQL

```sh
# Indicates exactly one field must be supplied and this field must not be `null`.
directive @oneOf on INPUT_OBJECT

type LoginResponse {
  token: String!
  userId: String!
}

type RegisterResponse {
  login: String!
  createdAt: String!
}

type GetLoginResponse {
  login: String!
}

type GetProfileResponse {
  about: String!
  avatarUrl: String!
  subscriptions: [String!]
  subscribersCount: Float!
}

type GetAvatarResponse {
  avatarUrl: String!
}

type VideoResponse {
  publicationId: String!
  userId: String!
  publicationName: String!
  about: String!
  tegs: [String!]!
  videoUrl: String!
  coverUrl: String!
  createdAt: DateTime!
}

# A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format.
scalar DateTime

type AudioResponse {
  publicationId: String!
  userId: String!
  publicationName: String!
  about: String!
  tegs: [String!]!
  audioUrl: String!
  coverUrl: String!
  createdAt: DateTime!
}

type PhotoResponse {
  publicationId: String!
  userId: String!
  publicationName: String!
  about: String!
  tegs: [String!]!
  photoUrl: String!
  createdAt: DateTime!
}

type GetLikesResponseDto {
  total: Float!
}

type Comment {
  id: ID!
  publicationId: String!
  userId: String!
  comment: String!
}

type PublicationDto {
  publicationId: String!
  userId: String!
  login: String!
  avatarUrl: String!
  publicationName: String!
  coverUrl: String!
  type: String!
}

type PublicationsResponseDto {
  publications: [PublicationDto!]!
}

type Query {
  getLogin(data: GetLoginInput!): GetLoginResponse!
  getProfile(userId: String!): GetProfileResponse!
  getAvatar(userId: String!): GetAvatarResponse!
  getVideo(getContentByIdInput: String!): VideoResponse!
  getAudio(getContentByIdInput: String!): AudioResponse!
  getPhoto(getContentByIdInput: String!): PhotoResponse!
  getTotalLikes(data: GetLikesRequestDto!): GetLikesResponseDto!
  GetRecentTopPosts(input: GetRecentTopPostsInput!): PublicationsResponseDto!
  GetLikedPublications(
    input: GetLikedPublicationsInput!
  ): PublicationsResponseDto!
  GetRandomPublications(
    input: GetRandomPublicationsInput!
  ): PublicationsResponseDto!
  GetSubscriptionsPublications(
    input: GetSubscriptionsPublicationsInput!
  ): PublicationsResponseDto!
}

input GetLoginInput {
  userId: String!
}

input GetLikesRequestDto {
  publicationId: String!
}

input GetRecentTopPostsInput {
  postsRequest: PostsRequestDto!
  tegs: [String!]
  author: String
}

input PostsRequestDto {
  start: Int!
  end: Int!
}

input GetLikedPublicationsInput {
  postsRequest: PostsRequestDto!
  tegs: [String!]
  author: String
}

input GetRandomPublicationsInput {
  photoCount: Int
  videoCount: Int
  audioCount: Int
  tegs: [String!]
  author: String
}

input GetSubscriptionsPublicationsInput {
  postsRequest: PostsRequestDto!
  tegs: [String!]
  author: String
}

type Mutation {
  login(data: LoginInput!): LoginResponse!
  register(data: RegisterInput!): RegisterResponse!
  changeLogin(data: ChangeLoginInput!): Boolean!
  changePassword(data: ChangePasswordInput!): Boolean!
  deleteAccount: Boolean!
  updateAbout(data: UpdateAboutInput!): Boolean!
  updateAvatar(data: UpdateAvatarInput!): Boolean!
  addSubscription(data: AddSubscriptionInput!): Boolean!
  removeSubscription(data: RemoveSubscriptionInput!): Boolean!
  uploadVideo(uploadVideoInput: UploadVideoInput!): Boolean!
  uploadAudio(uploadAudioInput: UploadAudioInput!): Boolean!
  uploadPhoto(uploadPhotoInput: UploadPhotoInput!): Boolean!
  changeVideo(changeVideoInput: ChangeVideoInput!): Boolean!
  changeAudio(changeAudioInput: ChangeAudioInput!): Boolean!
  changePhoto(changePhotoInput: ChangePhotoInput!): Boolean!
  deleteVideo(data: DeleteContentInput!): Boolean!
  deleteAudio(data: DeleteContentInput!): Boolean!
  deletePhoto(data: DeleteContentInput!): Boolean!
  addLike(data: LikeRequestDto!): Boolean!
  removeLike(data: LikeRequestDto!): Boolean!
  createComment(data: CreateCommentInput!): Boolean!
}

input LoginInput {
  login: String!
  password: String!
}

input RegisterInput {
  login: String!
  password: String!
}

input ChangeLoginInput {
  newLogin: String!
}

input ChangePasswordInput {
  currentPassword: String!
  newPassword: String!
}

input UpdateAboutInput {
  about: String!
}

input UpdateAvatarInput {
  file: Upload!
}

# The `Upload` scalar type represents a file upload.
scalar Upload

input AddSubscriptionInput {
  subscription: String!
}

input RemoveSubscriptionInput {
  subscriptionToRemove: String!
}

input UploadVideoInput {
  publicationName: String!
  about: String!
  tegs: [String!]!
  video: Upload!
  cover: Upload!
}

input UploadAudioInput {
  publicationName: String!
  about: String!
  tegs: [String!]!
  audio: Upload!
  cover: Upload!
}

input UploadPhotoInput {
  publicationName: String!
  about: String!
  tegs: [String!]!
  photo: Upload!
}

input ChangeVideoInput {
  publicationId: String!
  publicationName: String
  about: String
  tegs: [String!]
  video: Upload
  cover: Upload
}

input ChangeAudioInput {
  publicationId: String!
  publicationName: String
  about: String
  tegs: [String!]
  audio: Upload
  cover: Upload
}

input ChangePhotoInput {
  publicationId: String!
  publicationName: String
  about: String
  tegs: [String!]
  photo: Upload
}

input DeleteContentInput {
  publicationId: String!
}

input LikeRequestDto {
  publicationId: String!
}

input CreateCommentInput {
  publicationId: String!
  comment: String!
}

type Subscription {
  subscribeToPublicationComments(data: GetPublicationCommentsInput!): Comment!
}

input GetPublicationCommentsInput {
  publicationId: String!
}
```

## Для розробників

### Частина 1 - Загальне

Для того щоб запустити цей API необхідно 

склонувати цей репозиторій `git clone https://github.com/KharchenkoYaroslav/BubbleMediaAPI`

виконати `Частину 2`

Один раз виконати build `npm run build`

Для запуску виконуйте `npm run start`

Для зупинки `npm run stop`

### Частина 2 - Для співрозробників

Скопіюйте в .env в root репозиторію

### Частина 2 - Для сторонніх

Створіть свій .env в root репозиторію, в ньому мають бути:

```sh
DATABASE_URL=********
JWT_SECRET=********
REDIS_HOST=********
REDIS_PORT=********
REDIS_PASSWORD=********

PORT=********
AUTH_SERVICE_URL=********
GOOGLE_DRIVE_SERVICE_URL=********
PROFILE_SERVICE_URL=********
CONTENT_SERVICE_URL=********
METRICS_SERVICE_URL=********
COMMENT_SERVICE_URL=********
CONTENT_FEED_SERVICE_URL=********
RABBITMQ_URL=********

GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=********
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=********
```
