/**
 * @swagger
 * components:
 *   schemas:
 *     returnedUser:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - username
 *       properties:
 *         id:
 *           type: string
 *           description: The unique ID of the user
 *         email:
 *           type: string
 *           description: The user's email address
 *         username:
 *           type: string
 *           description: The user's display name
 *         image:
 *           type: string
 *           nullable: true
 *           description: URL of the user's profile image (optional)
 *       example:
 *         id: "1"
 *         email: "bob@gmail.com"
 *         username: "bob cohen"
 *         image: "http://localhost:3000/bob.png"
 *
 *     returnedComment:
 *       type: object
 *       required:
 *         - id
 *         - content
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The unique ID of the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *         user:
 *           $ref: '#/components/schemas/returnedUser'
 *       example:
 *         id: "comment123"
 *         content: "This is a great post!"
 *         user:
 *           id: "user123"
 *           email: "bob@gmail.com"
 *           username: "bob123"
 *           image: "http://localhost:3000/avatar.png"
 *
 *     returnedPost:
 *       type: object
 *       required:
 *         - id
 *         - image
 *         - content
 *         - likes
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The unique ID of the post
 *         image:
 *           type: string
 *           description: URL of the image attached to the post
 *         content:
 *           type: string
 *           description: The text content of the post
 *         likes:
 *           type: integer
 *           description: Number of likes the post has received
 *         user:
 *           $ref: '#/components/schemas/returnedUser'
 *         isUserLiked:
 *           type: boolean
 *           nullable: true
 *           description: Whether the current user has liked the post (optional)
 *         commentsCount:
 *           type: integer
 *           nullable: true
 *           description: Number of comments on the post (optional)
 *       example:
 *         id: "1"
 *         image: "http://localhost:3000/post-image.jpg"
 *         content: "Had a great day at the park!"
 *         likes: 10
 *         user:
 *           id: "1"
 *           email: "bob@gmail.com"
 *           username: "bob cohen"
 *           image: "http://localhost:3000/bob.png"
 *         isUserLiked: true
 *         commentsCount: 5
 */
