# 🧠 PocketTherapy

> **Your mental wellness companion** - A comprehensive React Native app for mental health support, mood tracking, and therapeutic exercises.

[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-53-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76.1-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

### Core Functionality
- **🎯 Mood Tracking**: Daily mood check-ins with detailed analytics
- **🧘 Therapeutic Exercises**: Guided breathing, meditation, and mindfulness
- **🆘 Crisis Support**: 24/7 emergency resources and hotlines
- **🤖 AI Recommendations**: Personalized mental health suggestions
- **📊 Progress Analytics**: Track your mental wellness journey
- **🔒 Privacy First**: Local data storage with optional cloud sync

### Technical Features
- **📱 Cross-Platform**: iOS, Android, and Web support
- **🌐 Offline-First**: Works without internet connection
- **♿ Accessibility**: WCAG 2.1 AA compliant
- **🎨 Therapeutic Design**: Calming colors and intuitive interface
- **🔐 HIPAA-Level Security**: End-to-end encryption for sensitive data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Terry-Mathew/pocket_therapy.git
cd pocket_therapy
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
# For web development
npm run web

# For mobile development
npx expo start
```

4. **Open the app**
- **Web**: Navigate to `http://localhost:8081`
- **Mobile**: Scan QR code with Expo Go app

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| 🌐 Web | ✅ Ready | Optimized for desktop and mobile browsers |
| 📱 iOS | ✅ Ready | Requires iOS 13+ |
| 🤖 Android | ✅ Ready | Requires Android 6.0+ |

## 🛠️ Development

### Project Structure
```
pocket_therapy/
├── assets/                 # App assets (icons, images)
├── src/                   # Source code (in PocketTherapy/)
│   ├── components/        # Reusable UI components
│   ├── screens/          # App screens
│   ├── services/         # API and business logic
│   ├── navigation/       # Navigation configuration
│   ├── store/           # State management
│   └── utils/           # Helper functions
├── App.tsx              # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

### Available Scripts
```bash
npm run web          # Start web development server
npm run android      # Start Android development
npm run ios          # Start iOS development
npm run build        # Build for production
npm run test         # Run tests
```

### Technology Stack
- **Frontend**: React Native, Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Styling**: React Native StyleSheet
- **AI Integration**: OpenAI GPT-3.5
- **Backend**: Supabase (optional)
- **Testing**: Jest, React Native Testing Library

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Customization
- **Colors**: Edit `src/constants/theme.ts`
- **Exercises**: Modify `assets/content/exercises.json`
- **Crisis Resources**: Update `assets/content/crisis_resources.json`

## 🚨 Recent Fixes (August 2025)

### Critical Issues Resolved ✅
- **React Native Compatibility**: Fixed 0.76.5 → 0.76.1 for Expo SDK 53
- **SDK Version Mismatch**: Updated all configs to SDK 53
- **Missing Assets**: Resolved asset directory issues
- **Dependency Conflicts**: Cleaned up problematic packages
- **Bundling Errors**: Simplified configurations for stability

### Build Status
- ✅ **Stable Build Achieved**
- ✅ **No Syntax Errors**
- ✅ **Compatible Dependencies**
- ✅ **Clean Bundle Process**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Maintain accessibility standards
- Use semantic commit messages
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Mental Health Resources
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

### Technical Support
- 📧 Email: support@pockettherapy.app
- 🐛 Issues: [GitHub Issues](https://github.com/Terry-Mathew/pocket_therapy/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Terry-Mathew/pocket_therapy/discussions)

## 🙏 Acknowledgments

- Mental health professionals who provided guidance
- Open source community for amazing tools
- Beta testers for valuable feedback
- Contributors who made this project possible

---

**⚠️ Disclaimer**: This app is not a substitute for professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.

**Made with ❤️ for mental wellness**
