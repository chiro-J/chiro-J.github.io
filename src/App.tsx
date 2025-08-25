// App.tsx - 테마 시스템 사용 예시

import {
  ThemeProvider,
  ThemeToggle,
  useThemeContext,
  // CompactThemeToggle,
} from "./components/theme-system";
import "./App.css";

/**
 * 메인 앱 컴포넌트
 * ThemeProvider로 전체 앱을 감싸서 어디서든 테마 정보에 접근할 수 있게 합니다
 */
function App() {
  return (
    <ThemeProvider
      apiKey={process.env.REACT_APP_OPENWEATHER_API_KEY} // 환경변수에서 API 키 가져오기
      defaultTheme="light" // 기본 테마 (선택사항)
      updateInterval={10 * 60 * 1000} // 10분마다 날씨 업데이트 (선택사항)
      enableGeolocation={true} // 위치 정보 사용 (선택사항)
      enableWebGL={true} // WebGL 배경 사용 (선택사항)
    >
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <WelcomeSection />
          <ThemeStatusCard />
          <WeatherInfoCard />
          <DemoContent />
        </main>
      </div>
    </ThemeProvider>
  );
}

/**
 * 헤더 컴포넌트 - 테마 토글 버튼 포함
 */
const Header: React.FC = () => {
  const { mode } = useThemeContext();

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고/제목 */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {mode === "light" && "☀️"}
              {mode === "dark" && "🌙"}
              {mode === "sync" && "🌍"}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              내 앱
            </h1>
          </div>

          {/* 네비게이션 & 테마 토글 */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-4">
              <a
                href="#"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                홈
              </a>
              <a
                href="#"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                소개
              </a>
              <a
                href="#"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                연락처
              </a>
            </nav>

            {/* 데스크톱에서는 기본 토글, 모바일에서는 컴팩트 토글 */}
            <div className="hidden md:block">
              <ThemeToggle size="md" />
            </div>
            <div className="md:hidden">{/* <CompactThemeToggle /> */}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * 환영 섹션 - 테마에 따라 다른 메시지 표시
 */
const WelcomeSection: React.FC = () => {
  const { mode, isDarkMode, timeOfDay, weatherCondition } = useThemeContext();

  const getWelcomeMessage = () => {
    if (mode === "sync") {
      if (timeOfDay === "dawn") return "좋은 새벽이에요!";
      if (timeOfDay === "day") return "좋은 하루 보내세요!";
      if (timeOfDay === "dusk") return "아름다운 저녁이네요!";
      if (timeOfDay === "night") return "편안한 밤 되세요!";
    }

    return isDarkMode ? "어두운 테마로 편안하게!" : "밝은 테마로 활기차게!";
  };

  const getWeatherEmoji = () => {
    switch (weatherCondition) {
      case "clear":
        return "☀️";
      case "clouds":
        return "☁️";
      case "rain":
        return "🌧️";
      case "snow":
        return "❄️";
      case "thunderstorm":
        return "⛈️";
      case "drizzle":
        return "🌦️";
      case "mist":
      case "fog":
        return "🌫️";
      default:
        return "🌤️";
    }
  };

  return (
    <section className="text-center mb-12">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {getWelcomeMessage()}
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          현재 <strong>{mode}</strong> 모드로 설정되어 있습니다.
          {mode === "sync" && (
            <>
              <br />
              지금은 <strong>{timeOfDay}</strong> 시간대이고, 날씨는{" "}
              <strong>{weatherCondition}</strong> {getWeatherEmoji()} 입니다.
            </>
          )}
        </p>

        <div className="inline-flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            테마를 변경해보세요:
          </span>
          <ThemeToggle size="sm" simple />
        </div>
      </div>
    </section>
  );
};

/**
 * 테마 상태를 보여주는 카드
 */
const ThemeStatusCard: React.FC = () => {
  const { mode, isDarkMode, isLoading, error } = useThemeContext();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        현재 테마 상태
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl mb-2">
            {mode === "light" && "☀️"}
            {mode === "dark" && "🌙"}
            {mode === "sync" && "🌍"}
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {mode === "light" && "라이트 모드"}
            {mode === "dark" && "다크 모드"}
            {mode === "sync" && "싱크 모드"}
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl mb-2">{isDarkMode ? "🌚" : "🌞"}</div>
          <div className="font-medium text-gray-900 dark:text-white">
            {isDarkMode ? "다크 UI" : "라이트 UI"}
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl mb-2">
            {isLoading ? "⏳" : error ? "❌" : "✅"}
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {isLoading ? "로딩 중" : error ? "오류 발생" : "정상"}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>오류:</strong> {error}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * 날씨 정보를 보여주는 카드 (싱크 모드에서만 표시)
 */
const WeatherInfoCard: React.FC = () => {
  const { mode, weatherData, weatherCondition, timeOfDay, isLoading } =
    useThemeContext();

  if (mode !== "sync") return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        실시간 날씨 정보
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            날씨 정보를 가져오는 중...
          </span>
        </div>
      ) : weatherData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl mb-2">🌍</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">위치</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {weatherData.name}
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl mb-2">🌡️</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">온도</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {Math.round(weatherData.main.temp)}°C
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              체감 {Math.round(weatherData.main.feels_like)}°C
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-3xl mb-2">
              {timeOfDay === "dawn" && "🌅"}
              {timeOfDay === "day" && "☀️"}
              {timeOfDay === "dusk" && "🌇"}
              {timeOfDay === "night" && "🌙"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              시간대
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {timeOfDay === "dawn" && "새벽"}
              {timeOfDay === "day" && "낮"}
              {timeOfDay === "dusk" && "황혼"}
              {timeOfDay === "night" && "밤"}
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl mb-2">
              {weatherCondition === "clear" && "☀️"}
              {weatherCondition === "clouds" && "☁️"}
              {weatherCondition === "rain" && "🌧️"}
              {weatherCondition === "snow" && "❄️"}
              {weatherCondition === "thunderstorm" && "⛈️"}
              {weatherCondition === "drizzle" && "🌦️"}
              {(weatherCondition === "mist" || weatherCondition === "fog") &&
                "🌫️"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">날씨</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {weatherData.weather[0].description}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              습도 {weatherData.main.humidity}%
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          날씨 정보를 가져올 수 없습니다.
          <br />
          OpenWeather API 키를 확인해주세요.
        </div>
      )}
    </div>
  );
};

/**
 * 테마별 스타일을 보여주는 데모 컨텐츠
 */
const DemoContent: React.FC = () => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="space-y-8">
      {/* 버튼 데모 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          버튼 스타일 데모
        </h3>

        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Primary
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
            Secondary
          </button>
          <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
            Success
          </button>
          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
            Danger
          </button>
        </div>
      </div>

      {/* 카드 데모 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
              {num}
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              카드 제목 {num}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              테마에 따라 자동으로 색상이 변경되는 카드 컴포넌트입니다.
              {isDarkMode
                ? " 현재 다크 모드가 적용되어 있습니다."
                : " 현재 라이트 모드가 적용되어 있습니다."}
            </p>
            <button className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
              더 보기 →
            </button>
          </div>
        ))}
      </div>

      {/* 폼 데모 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          폼 요소 데모
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이름
            </label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              메시지
            </label>
            <textarea
              rows={4}
              placeholder="메시지를 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
