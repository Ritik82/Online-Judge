# 🏆 Online Judge Platform

<div align="center">

![Online Judge](https://img.shields.io/badge/Online-Judge-blue?style=for-the-badge&logo=code&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

*A comprehensive competitive programming platform for coding enthusiasts*

[🚀 Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [📦 Installation](#-installation) • [🔧 Usage](#-usage) • [📸 Screenshots](#-screenshots)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📦 Installation](#-installation)
- [🔧 Usage](#-usage)
- [🌟 Key Highlights](#-key-highlights)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Overview

**Online Judge** is a full-stack competitive programming platform that enables users to solve coding problems, participate in contests, and track their progress. Built with modern web technologies, it provides a seamless coding experience similar to platforms like LeetCode, HackerRank, and Codeforces.

The platform supports multiple programming languages, real-time code execution, comprehensive problem management, and detailed analytics to help users improve their coding skills.

## ✨ Features

### 🏃‍♂️ **Core Functionality**
- **Multi-Language Support**: C++, Java, Python with syntax highlighting
- **Real-time Code Execution**: Instant compilation and execution with custom test cases
- **Problem Solving Interface**: Clean, intuitive problem-solving environment
- **Advanced Code Editor**: Monaco Editor with IntelliSense, auto-completion, and themes

### 👑 **User Management**
- **Authentication System**: Secure JWT-based login/signup
- **User Profiles**: Comprehensive statistics and submission history
- **Role-based Access**: Admin and user roles with different permissions
- **Progress Tracking**: Detailed analytics on coding performance

### 🏆 **Competition Features**
- **Leaderboard System**: Real-time rankings based on coding scores
- **Problem Categories**: Easy, Medium, Hard difficulty levels
- **Submission History**: Track all attempts with verdict details
- **Performance Analytics**: Acceptance rates, problem distribution

### 🔧 **Administrative Tools**
- **Admin Dashboard**: Comprehensive platform management
- **Problem Management**: Create, edit, delete problems with test cases
- **User Management**: Monitor users, update roles, view statistics
- **Content Control**: Full CRUD operations for problems and users

### 💻 **Developer Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Code Snippets**: Pre-built templates for common patterns
- **Keyboard Shortcuts**: Enhanced productivity with hotkeys
- **Theme Support**: Dark/Light modes with high contrast options

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19.1.0 with Hooks
- **Styling**: Tailwind CSS with responsive design
- **Code Editor**: Monaco Editor with multi-language support
- **UI Components**: React Icons, React Toastify
- **Routing**: React Router DOM 7.6.2
- **State Management**: React Hooks and Context
- **Build Tool**: Vite for fast development

### **Backend**
- **Runtime**: Node.js with Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **Validation**: Joi for input validation
- **CORS**: Cross-origin resource sharing enabled

### **Compiler Service**
- **Language Support**: C++, Java, Python execution
- **File Management**: UUID-based temporary file handling
- **Security**: Sandboxed code execution
- **Performance**: Optimized compilation and execution

### **Database Schema**
- **Users**: Profile data, statistics, solved problems
- **Problems**: Title, difficulty, test cases, scoring
- **Submissions**: Code, language, verdict, execution details
- **Test Cases**: Input/output pairs for problem validation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │    │   Backend       │    │   Compiler      │
│   (React)       │◄──►│   (Express)     │◄──►│   Service       │
│                 │    │                 │    │                 │
│ • Monaco Editor │    │ • REST APIs     │    │ • Code Exec     │
│ • Responsive UI │    │ • JWT Auth      │    │ • Multi-lang    │
│ • Real-time UX  │    │ • MongoDB       │    │ • Sandboxing    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │                 │
                    │   MongoDB       │
                    │   Database      │
                    │                 │
                    │ • Users         │
                    │ • Problems      │
                    │ • Submissions   │
                    │ • Test Cases    │
                    │                 │
                    └─────────────────┘
```

## 📦 Installation

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### **Quick Start**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Ritik82/Online-Judge.git
   cd Online-Judge
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   echo "MONGO_URI=mongodb://localhost:27017/onlinejudge
   JWT_SECRET=your_super_secret_key
   PORT=5000" > .env
   
   # Add sample problems (optional)
   node addSampleProblems.js
   ```

3. **Setup Compiler Service**
   ```bash
   cd ../compiler
   npm install
   
   # Create .env file
   echo "PORT=3001
   MONGO_URI=mongodb://localhost:27017/onlinejudge" > .env
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000
   VITE_AUTH_URL=http://localhost:5000
   VITE_COMPILER_URL=http://localhost:3001" > .env
   ```

5. **Start All Services**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Compiler Service
   cd compiler && npm start
   
   # Terminal 3 - Frontend
   cd frontend && npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - Compiler Service: `http://localhost:3001`

## 🔧 Usage

### **For Users**

1. **Registration**: Create an account with email and password
2. **Problem Solving**: Browse problems by difficulty and solve them
3. **Code Editor**: Write code with syntax highlighting and auto-completion
4. **Testing**: Run custom test cases before submission
5. **Submission**: Submit solutions and get instant verdicts
6. **Progress Tracking**: Monitor your performance on the leaderboard

### **For Administrators**

1. **Admin Access**: Login with admin credentials
2. **Problem Management**: Create, edit, and delete problems
3. **User Management**: Monitor users and manage roles
4. **Analytics**: View platform statistics and user metrics
5. **Content Moderation**: Oversee submissions and maintain quality

### **Supported Languages**

| Language | Extension | Compiler/Interpreter |
|----------|-----------|---------------------|
| C++      | `.cpp`    | g++ with C++17      |
| Java     | `.java`   | OpenJDK 11+         |
| Python   | `.py`     | Python 3.8+         |

## 🌟 Key Highlights

### **🚀 Performance**
- **Fast Compilation**: Optimized compiler service for quick execution
- **Efficient Database**: Indexed queries for rapid data retrieval
- **Responsive UI**: Smooth interactions with modern React patterns
- **Real-time Updates**: Live leaderboard and submission tracking

### **🔒 Security**
- **Secure Authentication**: JWT-based token system
- **Input Validation**: Comprehensive data sanitization
- **CORS Protection**: Configured cross-origin policies
- **Sandboxed Execution**: Isolated code execution environment

### **📱 User Experience**
- **Mobile Responsive**: Works seamlessly on all devices
- **Intuitive Interface**: Clean, modern design with excellent UX
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance Metrics**: Detailed analytics and progress tracking

### **🔧 Developer Friendly**
- **Modern Stack**: Latest versions of React, Node.js, and MongoDB
- **Clean Architecture**: Well-organized, maintainable codebase
- **Comprehensive API**: RESTful endpoints with clear documentation
- **Easy Deployment**: Docker-ready with environment configurations

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### **Areas for Contribution**
- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🧪 Test coverage expansion
- 🎨 UI/UX enhancements
- 🌐 Internationalization support

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Ritik82](https://github.com/Ritik82)**

⭐ Star this repository if you found it helpful!

[🔝 Back to Top](#-online-judge-platform)

</div>