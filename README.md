DINAR - Peer-to-Peer Transfer Platform
DINAR is a web application designed as a peer-to-peer (P2P) platform where users can securely register, login, post requests for fund transfers, and interact with other users' approved transfer requests. Administrators can review and approve transfers within a dedicated dashboard.

Table of Contents
Features
Project Structure
Installation
Usage
API Endpoints
Technologies Used
Contributing
License
Features
User
Registration & Authentication: Users can create an account and log in to access the platform.
Post Transfer Requests: Users can create transfer requests, specifying details such as the transfer amount, receiver, and mediator information.
Transfer Management: Users can view their posted transfers, submit transfer receipts, and see approval statuses.
Admin
Admin Dashboard: Admins have a dedicated dashboard to manage and approve/reject transfer requests.
Pending Posts: Admins can view transfer requests awaiting approval, with details about the sender, receiver, and mediator.
Pending Transfers: Admins can manage pending transfers, with the ability to approve or reject them based on transfer receipt verification and other transfer information.
Project Structure
graphql
Copier le code
DINAR
├── backend
│   ├── .env                    # Environment variables (hidden)
│   ├── .gitignore              # Specifies ignored files for Git
│   ├── server.js               # Main Express server
│   ├── models
│   │   ├── User.js             # User schema and model
│   │   └── Post.js             # Post schema and model
│   ├── routes
│   │   ├── auth.js             # User authentication routes
│   │   ├── posts.js            # Routes for user post actions
│   │   └── admin.js            # Admin-specific routes for managing posts
│   ├── middleware
│   │   └── auth.js             # Authentication middleware
│   └── controllers
│       ├── authController.js   # Handles user authentication
│       ├── postController.js   # Manages user post operations
│       └── adminController.js  # Admin-specific functionality
├── frontend
│   ├── index.html              # Landing page
│   ├── register.html           # User registration page
│   ├── login.html              # Login page
│   ├── dashboard.html          # User dashboard for transfer management
│   ├── admin_dashboard.html    # Admin dashboard for transfer approvals
│   ├── css
│   │   └── styles.css          # Styling for frontend pages
│   ├── js
│   │   ├── auth.js             # JavaScript for authentication handling
│   │   ├── posts.js            # Manages transfer post functionality
│   │   └── admin.js            # Admin dashboard JavaScript for approvals
└── README.md                   # Project documentation
Installation
Clone the Repository

bash
Copier le code
git clone https://github.com/yourusername/dinar.git
cd dinar
Set Up Backend

Go to the backend folder and install dependencies:
bash
Copier le code
cd backend
npm install
Create a .env file in the backend folder and configure environment variables:
env
Copier le code
PORT=5000
MONGO_URI=your_mongo_database_uri
JWT_SECRET=your_jwt_secret
Set Up Frontend

Go to the frontend folder and start a local server (such as http-server):
bash
Copier le code
cd ../frontend
npx http-server .
Run the Backend Server

Start the backend server from the backend directory:
bash
Copier le code
node server.js
Usage
User Registration and Login: Users can register and log in via the frontend interface.
Admin Login: Admins log in separately to access the admin dashboard.
Posting Transfers: Users can create transfer requests from the dashboard, uploading transfer receipts as needed.
Admin Approval: Admins can manage pending posts and transfers, reviewing details before approving or rejecting requests.
API Endpoints
Authentication (auth.js)
POST /auth/register: Register a new user.
POST /auth/login: User login.
User Posts (posts.js)
POST /posts: Create a new transfer post.
GET /posts/transferable: Get all transferable posts available for the user.
Admin Routes (admin.js)
GET /admin/posts/pending: Get all posts pending admin approval.
PUT /admin/posts/:postId: Update a post’s status (approve/reject).
Technologies Used
Backend: Node.js, Express.js, MongoDB, Mongoose
Frontend: HTML, CSS, JavaScript
Authentication: JWT (JSON Web Tokens)
Storage: Multer for file uploads
Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch.
Make your changes.
Submit a pull request.
License
This project is licensed under the MIT License.
